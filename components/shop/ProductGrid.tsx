"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  COLLECTIONS,
  PRODUCTS,
  formatPrice,
  productImage,
  type Collection,
} from "@/lib/products";
import { useShop } from "./ShopProvider";

gsap.registerPlugin(ScrollTrigger);

export default function ProductGrid() {
  const [filter, setFilter] = useState<Collection>("All");
  const root = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { add, view } = useShop();

  const items =
    filter === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.collection === filter);

  /* reveal on first entry */
  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-card]",
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 76%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  /* re-stagger whenever the filter changes */
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll("[data-card]");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 18, scale: 0.985 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.04,
        overwrite: true,
      }
    );
  }, [filter]);

  return (
    <section id="shop" ref={root} className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-caps mb-4">The Catalogue</p>
            <h2 className="display-serif max-w-2xl text-[clamp(2rem,4.6vw,3.2rem)] font-medium leading-[1.06] tracking-[-0.02em]">
              Ten objects, cast in glass and walnut.
            </h2>
          </div>

          {/* collection filter */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {COLLECTIONS.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(c)}
                  className={[
                    "label-caps !tracking-[0.16em] rounded-[2px] border px-4 py-2.5 transition-all duration-300",
                    active
                      ? "border-espresso bg-espresso !text-[var(--text-inv)]"
                      : "border-[var(--rule-strong)] hover:border-espresso hover:text-text",
                  ].join(" ")}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={gridRef}
          className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((p) => (
            <article key={p.slug} data-card className="group">
              <button
                onClick={() => view(p.slug)}
                className="relative block w-full overflow-hidden rounded-[3px] bg-espresso text-left"
                aria-label={`View ${p.name}`}
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={productImage(p.slug)}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  {/* warm wash that lifts on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(26,19,14,0.55),transparent_55%)] opacity-70 transition-opacity duration-700 group-hover:opacity-40" />

                  {!p.available && (
                    <span className="label-caps absolute left-4 top-4 rounded-[2px] bg-[var(--parchment)] px-2.5 py-1.5 !text-[0.6rem] !tracking-[0.18em] !text-text">
                      Coming soon
                    </span>
                  )}

                  {/* quick-view affordance */}
                  <span className="label-caps pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 rounded-[2px] bg-[var(--parchment)] px-4 py-2.5 !text-[0.6rem] !tracking-[0.18em] !text-text opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    View piece
                  </span>
                </div>
              </button>

              <div className="mt-5 flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h3 className="display-serif text-[1.2rem] font-medium leading-tight text-text">
                    {p.name}
                  </h3>
                  <p className="body-copy mt-1 text-[0.86rem] leading-snug">
                    {p.subtitle}
                  </p>
                  <p className="label-caps mt-2 !text-[0.62rem] !tracking-[0.18em] text-text-mute">
                    {p.edition}
                  </p>
                </div>
                <p className="lining-figures display-serif shrink-0 text-[1.15rem] font-medium text-text">
                  {formatPrice(p.price)}
                </p>
              </div>

              <button
                onClick={() => (p.available ? add(p.slug) : view(p.slug))}
                className="btn btn-outline mt-4 w-full"
              >
                {p.available ? "Add to bag" : "Join the list"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
