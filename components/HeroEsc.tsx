"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assetUrl } from "@/lib/supabase";

gsap.registerPlugin(ScrollTrigger);

// Served from /public until the Storage bucket is populated — see lib/supabase.
const ESC_SRC = assetUrl("esc-key.jpg", "/esc-key.jpg");

/**
 * The keycap, treated as a physical object you can handle:
 *  - levitates on a slow sine loop
 *  - tilts toward the pointer, and can be grabbed and spun
 *  - depresses like a real switch on click, or when you press Esc
 *  - a specular highlight tracks the pointer across the glass
 *  - drifts and parallaxes as the page scrolls
 */
export default function HeroEsc() {
  const stage = useRef<HTMLDivElement>(null);
  const object = useRef<HTMLDivElement>(null);
  const press = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  const [hint, setHint] = useState(true);
  const dragging = useRef(false);
  const spin = useRef({ y: 0, x: 0 });

  /** the switch-press: down fast, back on a soft elastic return */
  const doPress = useCallback(() => {
    if (!press.current || !halo.current) return;
    gsap.killTweensOf([press.current, halo.current]);
    gsap
      .timeline()
      .to(press.current, {
        y: 13,
        scale: 0.975,
        duration: 0.09,
        ease: "power3.out",
      })
      .to(press.current, {
        y: 0,
        scale: 1,
        duration: 0.85,
        ease: "elastic.out(1, 0.42)",
      });
    gsap.fromTo(
      halo.current,
      { opacity: 0.55, scale: 0.85 },
      { opacity: 0, scale: 1.5, duration: 0.95, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (!stage.current || !object.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.to(object.current, {
          y: -15,
          duration: 3.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        gsap.fromTo(
          sheen.current,
          { xPercent: -150, opacity: 0 },
          {
            xPercent: 150,
            opacity: 0.45,
            duration: 2,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 5.5,
          }
        );

        // scroll parallax: the cap sinks and recedes as you leave the hero
        gsap.to(object.current, {
          yPercent: 22,
          scale: 0.9,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.1,
          },
        });
      }

      // pointer tilt + tracked glare
      const rx = gsap.quickTo(object.current, "rotationX", {
        duration: 1,
        ease: "power3.out",
      });
      const ry = gsap.quickTo(object.current, "rotationY", {
        duration: 1,
        ease: "power3.out",
      });
      const gx = gsap.quickTo(glare.current, "xPercent", {
        duration: 0.85,
        ease: "power3.out",
      });
      const gy = gsap.quickTo(glare.current, "yPercent", {
        duration: 0.85,
        ease: "power3.out",
      });

      const onMove = (e: PointerEvent) => {
        const r = stage.current!.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        ry(spin.current.y + nx * 16);
        rx(spin.current.x + ny * -12);
        gx(nx * 60);
        gy(ny * 60);
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      return () => window.removeEventListener("pointermove", onMove);
    }, stage);

    // press the real Escape key
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHint(false);
        doPress();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      ctx.revert();
      window.removeEventListener("keydown", onKey);
    };
  }, [doPress]);

  /* ---- drag to spin ---- */
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    gsap.to(stage.current, { cursor: "grabbing", duration: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    spin.current.y += e.movementX * 0.45;
    spin.current.x -= e.movementY * 0.3;
    spin.current.x = gsap.utils.clamp(-38, 38, spin.current.x);
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    // ease the spin back to rest so it always returns to the hero pose
    gsap.to(spin.current, {
      y: 0,
      x: 0,
      duration: 2.4,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={stage}
      className="relative flex cursor-grab flex-col items-center select-none active:cursor-grabbing"
      style={{ perspective: "1200px" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={() => {
        setHint(false);
        doPress();
      }}
      role="button"
      tabIndex={0}
      aria-label="Press the glass Escape keycap"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setHint(false);
          doPress();
        }
      }}
    >
      <div
        ref={object}
        className="relative will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div ref={press} className="relative will-change-transform">
          {/* pulse that radiates on press */}
          <div
            ref={halo}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
            style={{
              background:
                "radial-gradient(circle, rgba(242,242,245,0.34) 0%, rgba(242,242,245,0.07) 45%, transparent 70%)",
            }}
          />

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

            {/* glare that follows the pointer across the glass */}
            <div
              ref={glare}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(242,242,245,0.16) 0%, transparent 46%)",
                mixBlendMode: "screen",
              }}
            />

            {/* periodic specular sweep */}
            <div
              ref={sheen}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-full"
              style={{
                background:
                  "linear-gradient(105deg, transparent 42%, rgba(242,242,245,0.16) 50%, transparent 58%)",
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
                  "linear-gradient(to top, rgba(0,0,0,0.24) 62%, transparent 96%)",
                WebkitMaskImage:
                  "linear-gradient(to top, rgba(0,0,0,0.24) 62%, transparent 96%)",
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

      {/* Absolutely placed so it never pushes the headline down. Hidden on
          small screens, where the tighter hero leaves no clearance above the
          headline — and where there's no cursor to drag with anyway. */}
      <p
        className="label-caps pointer-events-none absolute -bottom-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-center transition-opacity duration-700 sm:block"
        style={{ opacity: hint ? 0.5 : 0, fontSize: "0.58rem" }}
        aria-hidden
      >
        Press it · drag to turn
      </p>
    </div>
  );
}
