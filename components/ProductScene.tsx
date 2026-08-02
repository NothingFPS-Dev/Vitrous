"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  TINTS,
  makeGlassMaterial,
  makeKeycapGeometry,
  makeLegend,
  makeStudioEnv,
  CAP_TOP_Y,
} from "@/lib/glass";
import type { Scene as ProductSceneSpec } from "@/lib/products";

/**
 * Renders one catalogue product on a warm backdrop. Used by /scenes/[slug],
 * which scripts/render-products.mjs screenshots into public/products/*.png —
 * so the shop's photography is generated from the same glass kit as the hero.
 *
 * Signals readiness by setting `data-ready` once a few frames have landed,
 * so the capture script never shoots a half-composed scene.
 */
export default function ProductScene({
  spec,
  size = 1100,
}: {
  spec: ProductSceneSpec;
  size?: number;
}) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.transmissionResolutionScale = 1;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

    const env = makeStudioEnv(renderer, { warm: true });
    scene.environment = env.texture;

    /* Warm backdrop — an opaque plane so it also fills the transmission
       buffer; a transparent one would leave the glass sampling nothing. */
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#191713") })
    );
    backdrop.position.z = -14;
    scene.add(backdrop);

    /* A graded pool behind the subject. Tinted glass on a *flat* backdrop
       just looks like coloured plastic — refraction is only legible when
       there is a luminance gradient behind it to bend. */
    const pool = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(256, 200, 0, 256, 256, 300);
      grad.addColorStop(0, "#6a655c");
      grad.addColorStop(0.26, "#39352f");
      grad.addColorStop(0.62, "#211f1a");
      grad.addColorStop(1, "#191713");
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 512);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(26, 26),
        new THREE.MeshBasicMaterial({ map: t })
      );
      m.position.z = -9;
      return m;
    })();
    scene.add(pool);

    /* Contact shadow — a soft dark ellipse on the ground plane. Without it a
       rendered product floats and reads as a sticker. */
    const shadow = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(0,0,0,0.55)");
      grad.addColorStop(0.45, "rgba(0,0,0,0.22)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(c);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: t,
          transparent: true,
          depthWrite: false,
        })
      );
      m.rotation.x = -Math.PI / 2;
      return m;
    })();
    scene.add(shadow);

    const key = new THREE.DirectionalLight(0xfff1e0, 1.5);
    key.position.set(3, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe6cc, 0.8);
    fill.position.set(-3, 1.5, 2);
    scene.add(fill);

    const tint = TINTS[("tint" in spec && spec.tint) || "clear"] ?? TINTS.clear;
    const glass = makeGlassMaterial(tint);
    const group = new THREE.Group();
    const disposables: { dispose: () => void }[] = [glass];

    const cap = (widthUnits = 1, legend?: string) => {
      const geo = makeKeycapGeometry(widthUnits);
      disposables.push(geo);
      const mesh = new THREE.Mesh(geo, glass);
      if (legend) mesh.add(makeLegend(legend));
      return mesh;
    };

    /* ---- compose per product kind ---- */
    switch (spec.kind) {
      case "single": {
        const m = cap(1, spec.legend);
        group.add(m);
        group.rotation.set(0.34, -0.5, 0);
        group.scale.setScalar(2.35);
        break;
      }
      case "artisan": {
        const m = cap(1, spec.legend);
        // a thread of colour suspended inside the body
        const thread = new THREE.Mesh(
          new THREE.TorusKnotGeometry(0.13, 0.016, 120, 12, 2, 5),
          new THREE.MeshStandardMaterial({
            color: 0xd8501e,
            emissive: 0x8f2b08,
            emissiveIntensity: 0.4,
            roughness: 0.35,
          })
        );
        thread.rotation.set(0.6, 0.3, 0.2);
        thread.position.y = -0.02;
        m.add(thread);
        group.add(m);
        group.rotation.set(0.34, -0.5, 0);
        group.scale.setScalar(2.35);
        break;
      }
      case "spacebar": {
        const m = cap(6.25);
        group.add(m);
        group.rotation.set(0.58, -0.62, 0.04);
        group.scale.setScalar(0.8);
        break;
      }
      case "set": {
        const n = spec.count;
        const cols = n === 4 ? 2 : 4;
        const rows = Math.ceil(n / cols);
        const gap = 1.12;
        for (let i = 0; i < n; i++) {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const m = cap(1, spec.legends?.[i]);
          m.position.set(
            (c - (cols - 1) / 2) * gap,
            0,
            (r - (rows - 1) / 2) * gap
          );
          group.add(m);
        }
        group.rotation.set(0.52, -0.42, 0);
        group.scale.setScalar(n === 4 ? 1.5 : 0.98);
        break;
      }
      case "plinth": {
        const walnut = new THREE.MeshPhysicalMaterial({
          color: 0x7a5433,
          roughness: 0.38,
          metalness: 0,
          clearcoat: 0.35,
          clearcoatRoughness: 0.4,
        });
        disposables.push(walnut);
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, 2.2), walnut);
        base.position.y = -0.42;
        group.add(base);
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(1.15, 0.1, 1.15),
          walnut
        );
        seat.position.y = -0.18;
        group.add(seat);
        const m = cap(1, spec.legend);
        m.position.y = 0.05;
        group.add(m);
        group.rotation.set(0.3, -0.55, 0);
        group.scale.setScalar(1.55);
        break;
      }
    }

    scene.add(group);

    /* Recentre on the origin so every product lands in the same place in
       frame regardless of how its group was rotated, then pull the camera
       back just far enough to hold it. */
    const box = new THREE.Box3().setFromObject(group);
    const centre = new THREE.Vector3();
    const dims = new THREE.Vector3();
    box.getCenter(centre);
    box.getSize(dims);
    group.position.sub(centre);

    const radius = Math.max(dims.x, dims.y, dims.z) * 0.5;
    const dist = (radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.42;
    camera.position.set(0, radius * 0.22, dist);
    camera.lookAt(0, 0, 0);

    shadow.position.y = -dims.y * 0.5 - 0.06;
    shadow.scale.setScalar(Math.max(dims.x, dims.z) * 2.3);

    let frames = 0;
    let raf = 0;
    const tick = () => {
      renderer.render(scene, camera);
      frames++;
      if (frames === 6) el.setAttribute("data-ready", "1");
      if (frames < 12) raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      env.dispose();
      disposables.forEach((d) => d.dispose());
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose?.();
          const mat = o.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [spec, size]);

  return <div ref={mount} style={{ width: size, height: size }} />;
}
