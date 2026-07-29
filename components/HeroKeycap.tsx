"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   A real glass ESC keycap, cast procedurally rather than loaded as a model:
   a rounded box tapered toward the top with a dished face, rendered with
   physically-based transmission (refraction + dispersion) so it behaves like
   optical glass rather than a transparent PNG.

   Behind it sits a slowly morphing liquid-glass drop — a displaced sphere
   driven by simplex noise — which the keycap actually refracts, giving the
   glass something to bend.
   =========================================================================== */

/* --- GLSL simplex noise (Ashima / Stefan Gustavson, public domain) -------- */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
    + i.y+vec4(0.0,i1.y,i2.y,1.0))
    + i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/** Two octaves, slowly drifting — reads as a heavy liquid, not static noise. */
const FIELD_GLSL = /* glsl */ `
float field(vec3 p){
  float t = uTime * 0.06;
  float a = snoise(p * 0.52 + vec3(0.0, t, 0.0));
  float b = snoise(p * 1.05 - vec3(t * 0.6, 0.0, t * 0.35));
  return a * 0.82 + b * 0.18;
}
`;

export default function HeroKeycap() {
  const mount = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);
  const pressFn = useRef<() => void>(() => {});

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- renderer ---------------- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // transmission buffer at half res — invisible here, much cheaper
    renderer.transmissionResolutionScale = 0.5;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      30,
      el.clientWidth / el.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.55, 4.9);
    camera.lookAt(0, -0.05, 0);

    /* ---------------- studio environment ----------------
       Emissive panels on black. Glass has almost no colour of its own — what
       you read as "glass" is entirely the shape of the highlights it catches,
       so the env matters more than the lights. */
    const envScene = new THREE.Scene();
    const panel = (
      w: number,
      h: number,
      pos: [number, number, number],
      rot: [number, number, number],
      intensity: number
    ) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(intensity, intensity, intensity),
        })
      );
      m.position.set(...pos);
      m.rotation.set(...rot);
      envScene.add(m);
    };
    // Narrow, bright strips rather than broad panels: glass reads as glass
    // when it catches distinct highlights, not an even wash.
    panel(1.5, 7.5, [4.0, 3.4, 2.4], [0, -0.85, 0.25], 6.0); // key strip
    panel(0.8, 5.5, [-3.6, 2.2, -1.8], [0, 2.3, 0.2], 3.6); // counter-rim
    panel(1.0, 6, [-4.4, 1.0, 1.8], [0, 1.15, -0.2], 2.2); // fill strip
    panel(8, 1.0, [0, 3.4, -5.5], [0, 0, 0], 0.7); // top rim
    // low front strip — this is what lights the bottom bevel and gives glass
    // its characteristic bright underline
    panel(5, 0.9, [0, -2.6, 3.2], [-0.5, 0, 0], 2.8);
    panel(6, 4, [0, -4.2, 1.5], [Math.PI / 2, 0, 0], 0.12); // bounce

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(envScene, 0.02);
    scene.environment = envRT.texture;

    /* ---------------- backdrop glow ----------------
       Glass on pure black is invisible: with nothing luminous behind it there
       is nothing to refract and no edge definition. This very dim halo gives
       the cap something to bend, and reads as depth rather than a light. */
    const glowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
      // Must reach pure black well inside the plane's own edges, otherwise
       // the quad's rectangle is visible against the page.
      grad.addColorStop(0, "#aeb7ca");
      grad.addColorStop(0.16, "#3d4551");
      grad.addColorStop(0.34, "#141821");
      grad.addColorStop(0.5, "#000000");
      grad.addColorStop(1, "#000000");
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 512);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 13),
      new THREE.MeshBasicMaterial({ map: glowTex })
    );
    glow.position.set(0, 0.05, -8);
    scene.add(glow);

    /* ---------------- the liquid-glass drop ---------------- */
    const blobUniforms = { uTime: { value: 0 }, uAmp: { value: 0.3 } };
    const blobMat = new THREE.MeshPhysicalMaterial({
      // Near-black liquid glass: it must give the keycap something to catch
      // and refract without ever competing with it for attention.
      color: 0x05070b,
      roughness: 0.055,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      // a whisper of iridescence only — full strength threw green into an
      // otherwise monochrome scene
      iridescence: 0.18,
      iridescenceIOR: 1.25,
      iridescenceThicknessRange: [260, 620],
      envMapIntensity: 1.5,
      // Deliberately opaque: three.js renders only opaque objects into the
      // transmission backdrop. Marking this transparent leaves the glass's
      // transmission sampler unbound — it then reads white and the keycap
      // renders as flat white plastic.
      transparent: false,
    });

    blobMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = blobUniforms.uTime;
      shader.uniforms.uAmp = blobUniforms.uAmp;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uTime; uniform float uAmp;
           ${NOISE_GLSL}
           ${FIELD_GLSL}`
        )
        .replace(
          "#include <beginnormal_vertex>",
          `#include <beginnormal_vertex>
           // Displace, then rebuild the normal from two displaced neighbours.
           // Without this the surface morphs but the reflections don't follow,
           // which instantly reads as fake.
           vec3 dispPos = position + normal * (field(position) * uAmp);
           vec3 tRef = abs(normal.y) < 0.9 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0);
           vec3 tan1 = normalize(cross(tRef, normal));
           vec3 tan2 = normalize(cross(normal, tan1));
           float eps = 0.035;
           vec3 nA = position + tan1 * eps;
           vec3 nB = position + tan2 * eps;
           nA += normalize(nA) * (field(nA) * uAmp);
           nB += normalize(nB) * (field(nB) * uAmp);
           objectNormal = normalize(cross(nA - dispPos, nB - dispPos));
           if (dot(objectNormal, normal) < 0.0) objectNormal = -objectNormal;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           transformed = dispPos;`
        );
    };

    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 72),
      blobMat
    );
    blob.position.set(-1.15, 0.62, -2.4);
    scene.add(blob);

    /* ---------------- the keycap ----------------
       OEM R1-ish: 18mm base tapering to ~14mm, ~10mm tall, dished face. */
    const capGeo = new RoundedBoxGeometry(1, 0.62, 1, 14, 0.15);
    {
      const pos = capGeo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const t = THREE.MathUtils.clamp((v.y + 0.31) / 0.62, 0, 1);
        // taper toward the top
        const k = 1 - 0.19 * t * t;
        v.x *= k;
        v.z *= k;
        // dish the face — concave, deepest at centre
        const topness = THREE.MathUtils.smoothstep(t, 0.72, 1.0);
        const r = Math.min(1, Math.hypot(v.x, v.z) / 0.42);
        v.y -= topness * 0.055 * (1 - r * r);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
      capGeo.computeVertexNormals();
    }

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.045,
      transmission: 1,
      thickness: 0.45,
      ior: 1.52,
      // splits the refraction into faint colour at the edges — the single
      // detail that most separates "glass" from "clear plastic"
      dispersion: 1.8,
      // no clearcoat: glass is not a lacquered surface, and the extra
      // specular layer was washing the whole cap milky white
      clearcoat: 0,
      envMapIntensity: 1.7,
      specularIntensity: 1,
      attenuationColor: new THREE.Color(0xdfe6ef),
      attenuationDistance: 6.0,
    });

    const cap = new THREE.Mesh(capGeo, glass);

    /* legend: sub-surface, sitting just under the dished face */
    const legendTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, 512, 512);
      g.fillStyle = "#ffffff";
      g.font = "500 150px 'Manrope', system-ui, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("esc", 246, 262);
      g.beginPath();
      g.arc(372, 292, 15, 0, Math.PI * 2);
      g.fill();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    })();

    const legend = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.52),
      new THREE.MeshBasicMaterial({
        map: legendTex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: false,
        side: THREE.FrontSide,
      })
    );
    legend.rotation.x = -Math.PI / 2;
    legend.position.y = 0.263;
    legend.renderOrder = 999;
    cap.add(legend);

    const capGroup = new THREE.Group();
    capGroup.add(cap);
    capGroup.scale.setScalar(1.42);
    scene.add(capGroup);

    /* a couple of direct lights purely for edge definition */
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd4ff, 1.1);
    rim.position.set(-3, 1.5, -2.5);
    scene.add(rim);

    /* ---------------- interaction ---------------- */
    const spin = { y: 0, x: 0 };
    const pointer = { x: 0, y: 0 };
    const pressState = { y: 0 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const vel = { y: 0, x: 0 };

    const doPress = () => {
      gsap.killTweensOf(pressState);
      gsap
        .timeline()
        .to(pressState, { y: -0.11, duration: 0.08, ease: "power3.out" })
        .to(pressState, { y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    };
    pressFn.current = doPress;

    const dom = renderer.domElement;
    dom.style.touchAction = "pan-y";

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!dragging) return;
      vel.y = (e.clientX - lastX) * 0.008;
      vel.x = (e.clientY - lastY) * 0.006;
      spin.y += vel.y;
      spin.x += vel.x;
      spin.x = THREE.MathUtils.clamp(spin.x, -0.6, 0.6);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      dom.releasePointerCapture?.(e.pointerId);
      dom.style.cursor = "grab";
    };
    const onClick = () => {
      if (Math.abs(vel.y) > 0.01) return; // was a drag, not a tap
      setHint(false);
      doPress();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHint(false);
        doPress();
      }
    };

    dom.style.cursor = "grab";
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    dom.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    /* ---------------- scroll parallax ---------------- */
    const scrollState = { y: 0, scale: 1, opacity: 1 };
    let st: ScrollTrigger | undefined;
    if (!reduce) {
      st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          scrollState.y = -self.progress * 1.1;
          scrollState.scale = 1 - self.progress * 0.16;
          scrollState.opacity = 1 - self.progress * 0.55;
        },
      });
    }

    /* ---------------- loop ---------------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const t = clock.getElapsedTime();
      blobUniforms.uTime.value = t;

      if (!dragging) {
        // ease the spin back to rest, keeping a slow idle turn
        spin.y += (0 - spin.y) * 0.022;
        spin.x += (0 - spin.x) * 0.03;
      }

      const idleY = reduce ? 0 : Math.sin(t * 0.34) * 0.16;
      const idleFloat = reduce ? 0 : Math.sin(t * 0.72) * 0.035;

      capGroup.rotation.y = spin.y + idleY + pointer.x * 0.16;
      capGroup.rotation.x = spin.x + pointer.y * 0.12 + 0.24;
      capGroup.position.y =
        idleFloat + pressState.y + scrollState.y;
      capGroup.scale.setScalar(1.42 * scrollState.scale);


      blob.rotation.y = t * 0.045;
      blob.rotation.x = Math.sin(t * 0.12) * 0.2;
      blob.position.y = 0.62 + scrollState.y * 0.45;
      el.style.opacity = String(scrollState.opacity);


      renderer.render(scene, camera);
    };
    tick();

    /* ---------------- resize ---------------- */
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    /* ---------------- teardown ---------------- */
    return () => {
      cancelAnimationFrame(raf);
      st?.kill();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dom.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      capGeo.dispose();
      glass.dispose();
      blob.geometry.dispose();
      blobMat.dispose();
      legendTex.dispose();
      legend.geometry.dispose();
      (legend.material as THREE.Material).dispose();
      glowTex.dispose();
      glow.geometry.dispose();
      (glow.material as THREE.Material).dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mount}
        className="h-[min(64vh,460px)] w-[min(92vw,560px)]"
        role="button"
        tabIndex={0}
        aria-label="Interactive glass Escape keycap — click to press, drag to turn"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setHint(false);
            pressFn.current();
          }
        }}
      />
      <p
        className="label-caps pointer-events-none absolute -bottom-2 left-1/2 hidden -translate-x-1/2 whitespace-nowrap transition-opacity duration-700 sm:block"
        style={{ opacity: hint ? 0.5 : 0, fontSize: "0.58rem" }}
        aria-hidden
      >
        Press it · drag to turn
      </p>
    </div>
  );
}
