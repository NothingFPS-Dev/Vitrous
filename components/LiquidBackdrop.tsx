"use client";

import dynamic from "next/dynamic";

const LiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.LiquidMetal),
  { ssr: false }
);

/**
 * A slow chrome field behind the keycap. The shader is masked with a radial
 * gradient so it melts into the black page — it should read as candlelight
 * on metal, never as a "background effect".
 */
export default function LiquidBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2"
      style={{
        width: "min(64vmin, 560px)",
        height: "min(64vmin, 560px)",
        opacity: 0.22,
        maskImage:
          "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.55) 34%, transparent 58%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, black 0%, rgba(0,0,0,0.55) 34%, transparent 58%)",
      }}
    >
      <LiquidMetal
        style={{ width: "100%", height: "100%" }}
        colorBack="#000000"
        colorTint="#e9e9ec"
        shape="none"
        repetition={2.8}
        softness={0.5}
        shiftRed={0.05}
        shiftBlue={0.08}
        distortion={0.16}
        contour={0.6}
        angle={72}
        speed={0.2}
      />
    </div>
  );
}
