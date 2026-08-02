"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";

// WebGL scene: client-only, and never part of the server render.
const HeroKeycap = dynamic(() => import("./HeroKeycap"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        "[data-hero-object]",
        { opacity: 0, scale: 0.92, filter: "blur(14px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5 }
      ).fromTo(
        "[data-reveal]",
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.12 },
        "-=1.1"
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate flex min-h-dvh flex-col overflow-hidden pt-16"
    >
      {/* warm ground: the cap sits in a lit pool rather than on flat colour */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 82% at 50% 30%, #fbf7ef 0%, #f2ebdf 34%, #e9dfcd 66%, #ded1bb 100%)",
        }}
      />
      <div aria-hidden className="tooth absolute inset-0 -z-10" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-6">
        <p data-reveal className="label-caps mb-2">
          Est. MMXXVI · Cast by hand
        </p>

        <div data-hero-object className="relative">
          <HeroKeycap />
        </div>

        <div className="relative z-10 mt-6 flex flex-col items-center text-center">
          <h1
            data-reveal
            className="display-serif max-w-4xl text-[clamp(2.1rem,5.4vw,3.6rem)] font-medium leading-[1.06] tracking-[-0.025em] text-text"
          >
            The escape,{" "}
            <em className="font-normal italic text-sienna">immortalised</em> in
            glass.
          </h1>

          <p data-reveal className="body-copy mt-5 max-w-lg text-[1rem]">
            A two-person atelier casting keycaps from optical crystal — poured,
            annealed for eleven days, and polished one at a time.
          </p>

          <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#shop" className="btn btn-solid">
              Shop the catalogue
            </a>
            <a href="#origin" className="btn btn-outline">
              Our origin
            </a>
          </div>
        </div>
      </div>

      <div className="relative px-6 pb-7 sm:px-10">
        <div data-reveal className="rule mb-5" />
        <div data-reveal className="flex items-center justify-between">
          <span className="label-caps">Ten pieces · Cast to order</span>
          <span className="label-caps hidden sm:block">Nº 001 — ESC</span>
        </div>
      </div>
    </section>
  );
}
