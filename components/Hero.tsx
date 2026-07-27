"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import LiquidBackdrop from "./LiquidBackdrop";
import HeroEsc from "./HeroEsc";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        "[data-hero-object]",
        { opacity: 0, scale: 0.92, filter: "blur(14px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.6 }
      ).fromTo(
        "[data-reveal]",
        { opacity: 0, y: 24, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.3,
          stagger: 0.13,
        },
        "-=1.15"
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* nav strip */}
      <header
        data-reveal
        className="z-10 flex items-center justify-between px-7 pt-7 sm:px-12"
      >
        <span className="label-caps !tracking-[0.42em] text-platinum">
          Vitrous
        </span>
        <span className="label-caps hidden sm:block">Atelier · Est. MMXXVI</span>
      </header>

      {/* centre stage */}
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6">
        <div data-hero-object className="relative">
          <LiquidBackdrop />
          <HeroEsc />
        </div>

        {/* copy under the object */}
        <div className="relative z-10 mt-2 flex flex-col items-center text-center">
          <h1
            data-reveal
            className="display-serif text-[clamp(1.9rem,4.8vw,3rem)] font-medium leading-[1.1] tracking-[-0.015em] text-platinum"
          >
            The escape,{" "}
            <em className="font-normal italic text-silver">immortalised</em> in
            glass.
          </h1>

          <p
            data-reveal
            className="body-copy mt-4 max-w-md text-[0.95rem]"
          >
            Each keycap is cast, cooled and polished by hand — one at a time,
            never in batches. No two hold the light the same way.
          </p>

          <div data-reveal className="mt-7 flex items-center gap-2">
            <span className="label-caps text-platinum">
              First Edition · Coming Soon
            </span>
            <span className="label-caps text-platinum">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </div>
        </div>
      </div>

      {/* foot strip */}
      <footer className="z-10 px-7 pb-7 sm:px-12">
        <div data-reveal className="hairline mb-5" />
        <div data-reveal className="flex items-center justify-between">
          <a
            href="#invitation"
            className="label-caps transition-colors duration-300 hover:text-platinum"
          >
            By private waitlist only ↓
          </a>
          <span className="label-caps hidden sm:block">Nº 001 — ESC</span>
        </div>
      </footer>
    </section>
  );
}
