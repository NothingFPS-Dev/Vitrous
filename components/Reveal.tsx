"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-reveal wrapper. Children marked with [data-r] rise and un-blur in
 * sequence as the block enters the viewport. Deliberately slow — haste reads
 * as cheap.
 */
export default function Reveal({
  children,
  className = "",
  stagger = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const targets = root.current!.querySelectorAll("[data-r]");
      if (!targets.length) return;
      gsap.fromTo(
        targets,
        { opacity: 0, y: 30, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.25,
          ease: "power3.out",
          stagger,
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
