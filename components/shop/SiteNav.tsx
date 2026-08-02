"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useShop } from "./ShopProvider";
import { COLLECTIONS } from "@/lib/products";

const LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "Origin", href: "#origin" },
  { label: "The Making", href: "#making" },
  { label: "Register", href: "#register" },
];

export default function SiteNav() {
  const { count, openCart, menuOpen, toggleMenu, closeMenu } = useShop();
  const [solid, setSolid] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const firstMount = useRef(true);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // park off-canvas before first paint so it never flashes or widens the page
  useLayoutEffect(() => {
    if (panel.current) gsap.set(panel.current, { xPercent: 100 });
  }, []);

  /* slide-out menu */
  useEffect(() => {
    if (!panel.current) return;
    const items = panel.current.querySelectorAll("[data-menu-item]");
    if (menuOpen) {
      gsap.killTweensOf([panel.current, items]);
      gsap.set(panel.current, { pointerEvents: "auto" });
      gsap
        .timeline()
        .to(panel.current, { xPercent: 0, duration: 0.62, ease: "power4.out" })
        .fromTo(
          items,
          { opacity: 0, x: 28 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 },
          "-=0.34"
        );
    } else {
      gsap.killTweensOf([panel.current, items]);
      gsap.to(panel.current, {
        xPercent: 100,
        duration: 0.45,
        ease: "power3.in",
        onComplete: () => gsap.set(panel.current, { pointerEvents: "none" }),
      });
    }
  }, [menuOpen]);

  /* nudge the badge whenever the cart count changes */
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    if (!badge.current || count === 0) return;
    gsap.fromTo(
      badge.current,
      { scale: 0.5 },
      { scale: 1, duration: 0.55, ease: "back.out(3)" }
    );
  }, [count]);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid
            ? "border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--parchment)_88%,transparent)] backdrop-blur-xl"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-10">
          <a
            href="#top"
            className="display-serif text-[1.28rem] font-semibold tracking-[0.02em] text-text"
          >
            Vitrous
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="link-underline label-caps !tracking-[0.16em] transition-colors hover:text-text"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCart}
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
              className="group relative flex h-10 items-center gap-2 rounded-[2px] border border-[var(--rule-strong)] px-4 transition-colors duration-300 hover:border-espresso hover:bg-espresso"
            >
              <span className="label-caps !tracking-[0.16em] transition-colors group-hover:text-[var(--text-inv)]">
                Bag
              </span>
              <span
                ref={badge}
                className="lining-figures flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sienna px-1 text-[0.62rem] font-semibold text-[var(--parchment)]"
              >
                {count}
              </span>
            </button>

            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            >
              <span
                className={`block h-[1.5px] w-5 bg-text transition-transform duration-300 ${
                  menuOpen ? "translate-y-[6.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-text transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-text transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* scrim */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-[55] bg-[rgba(26,19,14,0.45)] backdrop-blur-[2px] transition-opacity duration-500 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* slide-out menu */}
      <div
        ref={panel}
        className="fixed right-0 top-0 z-[60] h-dvh w-[min(86vw,380px)] bg-sand tooth md:hidden"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex h-full flex-col px-8 pb-10 pt-8">
          <div className="flex items-center justify-between">
            <span className="display-serif text-[1.2rem] font-semibold">
              Vitrous
            </span>
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="label-caps !tracking-[0.16em]"
            >
              Close
            </button>
          </div>

          <div className="mt-14 flex flex-col gap-6">
            {LINKS.map((l) => (
              <a
                key={l.href}
                data-menu-item
                href={l.href}
                onClick={closeMenu}
                className="display-serif text-[2rem] leading-none text-text transition-colors hover:text-sienna"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div data-menu-item className="mt-auto">
            <p className="label-caps mb-3">Collections</p>
            <div className="flex flex-wrap gap-2">
              {COLLECTIONS.filter((c) => c !== "All").map((c) => (
                <a
                  key={c}
                  href="#shop"
                  onClick={closeMenu}
                  className="rounded-[2px] border border-[var(--rule-strong)] px-3 py-1.5 text-[0.75rem] text-text-soft transition-colors hover:border-espresso hover:bg-espresso hover:text-[var(--text-inv)]"
                >
                  {c}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
