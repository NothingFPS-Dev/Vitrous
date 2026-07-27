"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis momentum scrolling, driven by GSAP's ticker so scroll position and
 * every ScrollTrigger update happen on the same frame. Running them on
 * separate loops is what makes scroll-linked animation feel a half-beat
 * behind the page; sharing a ticker is what makes it feel welded to the wheel.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      // long, gentle tail — the "butter"
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      syncTouch: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
