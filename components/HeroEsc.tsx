"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { assetUrl } from "@/lib/supabase";

// Served from /public until the Storage bucket is populated — see lib/supabase.
const ESC_SRC = assetUrl("esc-key.jpg", "/esc-key.jpg");

/**
 * The ESC keycap, treated as an object rather than a picture:
 *  - slow levitation (sine yoyo)
 *  - pointer-follow parallax tilt in 3D perspective
 *  - a specular sheen that sweeps across every few seconds
 *  - a soft inverted reflection beneath, like glass on black marble
 */
export default function HeroEsc() {
  const stage = useRef<HTMLDivElement>(null);
  const object = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stage.current || !object.current) return;
    const ctx = gsap.context(() => {
      // levitation
      gsap.to(object.current, {
        y: -14,
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // sheen sweep, every ~7s
      if (sheen.current) {
        gsap.fromTo(
          sheen.current,
          { xPercent: -140, opacity: 0 },
          {
            xPercent: 140,
            opacity: 0.5,
            duration: 1.9,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 5.2,
          }
        );
      }

      // pointer parallax tilt
      const rx = gsap.quickTo(object.current, "rotationX", {
        duration: 0.9,
        ease: "power3.out",
      });
      const ry = gsap.quickTo(object.current, "rotationY", {
        duration: 0.9,
        ease: "power3.out",
      });
      const onMove = (e: PointerEvent) => {
        const r = stage.current!.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        ry(nx * 10);
        rx(ny * -8);
      };
      const onLeave = () => {
        rx(0);
        ry(0);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      };
    }, stage);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={stage}
      className="relative flex flex-col items-center"
      style={{ perspective: "1100px" }}
    >
      <div
        ref={object}
        className="relative will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* the keycap — pure black jpg melts into the page */}
        <div className="relative overflow-hidden">
          <Image
            src={ESC_SRC}
            alt="A hand-cast glass ESC keycap"
            width={520}
            height={520}
            priority
            className="h-auto w-[min(56vw,368px)] select-none"
            draggable={false}
          />
          {/* specular sweep */}
          <div
            ref={sheen}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-full"
            style={{
              background:
                "linear-gradient(105deg, transparent 42%, rgba(233,233,236,0.14) 50%, transparent 58%)",
              mixBlendMode: "screen",
            }}
          />
        </div>

        {/* reflection — height-capped so it doesn't push the layout */}
        <div
          aria-hidden
          className="pointer-events-none relative -mt-16 h-[88px] overflow-hidden"
        >
          <div
            style={{
              marginTop: "-72px",
              transform: "scaleY(-1)",
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,0.22) 62%, transparent 96%)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0,0,0,0.22) 62%, transparent 96%)",
            }}
          >
            <Image
              src={ESC_SRC}
              alt=""
              width={520}
              height={520}
              className="h-auto w-[min(56vw,368px)] select-none blur-[2px]"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
