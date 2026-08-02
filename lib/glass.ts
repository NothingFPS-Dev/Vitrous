import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ===========================================================================
   Shared glass-keycap kit. The hero and the product renderer both build from
   these so a cap on a product card is literally the same object, lit the same
   way, as the one you can spin in the hero.
   =========================================================================== */

export type CapProfile = "r1" | "spacebar";

export interface GlassTint {
  /** transmitted colour picked up over distance through the body */
  attenuation: number;
  /** how quickly that colour saturates — smaller = deeper tint */
  attenuationDistance: number;
  /** faint surface tint; keep near-white for clear glass */
  color?: number;
}

export const TINTS: Record<string, GlassTint> = {
  clear: { attenuation: 0xdfe6ef, attenuationDistance: 6.0 },
  obsidian: { attenuation: 0x363b45, attenuationDistance: 1.5, color: 0xe8e8ea },
  amber: { attenuation: 0xe8952b, attenuationDistance: 2.6 },
  cobalt: { attenuation: 0x3a68d8, attenuationDistance: 2.3 },
  rose: { attenuation: 0xe06a82, attenuationDistance: 2.6 },
  ember: { attenuation: 0xd9531f, attenuationDistance: 2.1 },
  smoke: { attenuation: 0x5c574f, attenuationDistance: 2.8 },
};

const CAP_H = 0.46;
const CAP_DISH = 0.042;

/**
 * A keycap: rounded box, tapered toward the top, with a dished face.
 * `widthUnits` of 1 is a standard 1u key; a spacebar is ~6.25u.
 */
export function makeKeycapGeometry(widthUnits = 1): THREE.BufferGeometry {
  const geo = new RoundedBoxGeometry(widthUnits, CAP_H, 1, 14, 0.07);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = THREE.MathUtils.clamp((v.y + CAP_H / 2) / CAP_H, 0, 1);
    const k = 1 - 0.19 * t * t; // taper
    v.x *= k;
    v.z *= k;
    const topness = THREE.MathUtils.smoothstep(t, 0.72, 1.0);
    // dish across the short axis only, so wide keys dish like real ones
    const r = Math.min(1, Math.hypot(v.x / widthUnits, v.z) / 0.42);
    v.y -= topness * CAP_DISH * (1 - r * r);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export const CAP_TOP_Y = CAP_H / 2 - CAP_DISH + 0.012;

/** Physically-based optical glass. Uncoated — clearcoat makes glass milky. */
export function makeGlassMaterial(tint: GlassTint): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: tint.color ?? 0xffffff,
    metalness: 0,
    roughness: 0.045,
    transmission: 1,
    thickness: 0.45,
    ior: 1.52,
    dispersion: 1.8,
    clearcoat: 0,
    envMapIntensity: 1.7,
    specularIntensity: 1,
    attenuationColor: new THREE.Color(tint.attenuation),
    attenuationDistance: tint.attenuationDistance,
  });
}

export interface StudioOptions {
  /** overall warmth of the key light — the storefront runs warm/bronze */
  warm?: boolean;
}

/**
 * Emissive strips on black, baked to an environment map. Glass has almost no
 * colour of its own: what reads as "glass" is the shape of the highlights it
 * catches, so this matters more than the scene lights.
 */
export function makeStudioEnv(
  renderer: THREE.WebGLRenderer,
  opts: StudioOptions = {}
): { texture: THREE.Texture; dispose: () => void } {
  const warm = opts.warm ?? false;
  const envScene = new THREE.Scene();

  const panel = (
    w: number,
    h: number,
    pos: [number, number, number],
    rot: [number, number, number],
    intensity: number,
    rgb: [number, number, number] = [1, 1, 1]
  ) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(
          intensity * rgb[0],
          intensity * rgb[1],
          intensity * rgb[2]
        ),
      })
    );
    m.position.set(...pos);
    m.rotation.set(...rot);
    envScene.add(m);
  };

  const key: [number, number, number] = warm ? [1, 0.9, 0.78] : [1, 1, 1];
  const fill: [number, number, number] = warm ? [1, 0.86, 0.7] : [0.9, 0.94, 1];

  panel(1.5, 7.5, [4.0, 3.4, 2.4], [0, -0.85, 0.25], 6.0, key);
  panel(0.8, 5.5, [-3.6, 2.2, -1.8], [0, 2.3, 0.2], 3.6, fill);
  panel(1.0, 6, [-4.4, 1.0, 1.8], [0, 1.15, -0.2], 2.2, fill);
  panel(8, 1.0, [0, 3.4, -5.5], [0, 0, 0], 0.7, key);
  panel(5, 0.9, [0, -2.6, 3.2], [-0.5, 0, 0], 2.8, key);
  panel(6, 4, [0, -4.2, 1.5], [Math.PI / 2, 0, 0], 0.12, fill);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(envScene, 0.02);

  return {
    texture: rt.texture,
    dispose: () => {
      rt.dispose();
      pmrem.dispose();
      envScene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
    },
  };
}

/**
 * A soft radial halo used behind glass. Glass on a flat backdrop is invisible
 * — it needs something luminous to refract. The gradient must reach the
 * background colour well inside the plane's own edges or the quad shows.
 */
export function makeGlowPlane(
  size: number,
  inner: string,
  mid: string,
  outer: string
): THREE.Mesh {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.16, mid);
  grad.addColorStop(0.34, outer);
  grad.addColorStop(0.5, outer);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: tex })
  );
}

/** Legend texture ("esc", "⌘", …) laid into the dished face. */
export function makeLegend(text: string, dot = true): THREE.Mesh {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = "#ffffff";
  g.font = "500 150px 'Manrope', system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, dot ? 246 : 256, 262);
  if (dot) {
    g.beginPath();
    g.arc(372, 292, 15, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.52),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      // the cap renders in three's transmissive pass, which lands after the
      // transparent queue — without this the legend loses the depth test
      depthTest: false,
      side: THREE.FrontSide,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = CAP_TOP_Y;
  mesh.renderOrder = 999;
  return mesh;
}
