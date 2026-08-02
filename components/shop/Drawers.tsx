"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { bySlug, formatPrice, productImage } from "@/lib/products";
import { useShop } from "./ShopProvider";

/** Shared slide-in panel: scrim + right-hand sheet, animated with GSAP. */
function Sheet({
  open,
  onClose,
  labelledBy,
  children,
  width = "min(92vw, 460px)",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  width?: string;
}) {
  const scrim = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (sheet.current) gsap.set(sheet.current, { xPercent: 100 });
  }, []);

  useEffect(() => {
    if (!sheet.current || !scrim.current) return;
    gsap.killTweensOf([sheet.current, scrim.current]);
    if (open) {
      gsap.set([sheet.current, scrim.current], { pointerEvents: "auto" });
      gsap.to(scrim.current, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.to(sheet.current, {
        xPercent: 0,
        duration: 0.66,
        ease: "power4.out",
      });
      gsap.fromTo(
        sheet.current.querySelectorAll("[data-sheet-item]"),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.05,
          delay: 0.16,
        }
      );
    } else {
      gsap.to(scrim.current, { opacity: 0, duration: 0.35 });
      gsap.to(sheet.current, {
        xPercent: 100,
        duration: 0.45,
        ease: "power3.in",
        onComplete: () =>
          gsap.set([sheet.current, scrim.current], { pointerEvents: "none" }),
      });
    }
  }, [open]);

  return (
    <>
      <div
        ref={scrim}
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 z-[70] bg-[rgba(26,19,14,0.5)] opacity-0 backdrop-blur-[3px]"
        style={{ pointerEvents: "none" }}
      />
      <aside
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="fixed right-0 top-0 z-[80] flex h-dvh flex-col bg-parchment tooth"
        style={{ width, pointerEvents: "none" }}
      >
        {children}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */
export function CartDrawer() {
  const { cartOpen, closeCart, lines, setQty, remove, subtotal, count } =
    useShop();

  return (
    <Sheet open={cartOpen} onClose={closeCart} labelledBy="cart-title">
      <div className="flex items-center justify-between border-b border-[var(--rule)] px-7 py-5">
        <h2 id="cart-title" className="display-serif text-[1.3rem] font-medium">
          Your bag
          {count > 0 && (
            <span className="lining-figures ml-2 text-text-mute">({count})</span>
          )}
        </h2>
        <button onClick={closeCart} className="label-caps !tracking-[0.16em]">
          Close
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p data-sheet-item className="display-serif text-[1.4rem]">
            Nothing here yet.
          </p>
          <p data-sheet-item className="body-copy mt-2 max-w-xs text-[0.9rem]">
            Every piece is cast to order. Nothing is held in stock, and nothing
            is reserved until it is paid for.
          </p>
          <button
            data-sheet-item
            onClick={closeCart}
            className="btn btn-solid mt-7"
          >
            Browse the catalogue
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {lines.map((l) => {
              const p = bySlug(l.slug);
              if (!p) return null;
              return (
                <div
                  key={l.slug}
                  data-sheet-item
                  className="flex gap-4 border-b border-[var(--rule)] py-5 first:pt-0"
                >
                  <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[2px] bg-espresso">
                    <Image
                      src={productImage(p.slug)}
                      alt={p.name}
                      fill
                      sizes="86px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <h3 className="display-serif text-[1rem] font-medium leading-tight">
                        {p.name}
                      </h3>
                      <p className="lining-figures shrink-0 text-[0.95rem]">
                        {formatPrice(p.price * l.qty)}
                      </p>
                    </div>
                    <p className="body-copy mt-0.5 text-[0.8rem]">
                      {p.subtitle}
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <div className="flex items-center rounded-[2px] border border-[var(--rule-strong)]">
                        <button
                          onClick={() => setQty(l.slug, l.qty - 1)}
                          aria-label={`Decrease ${p.name}`}
                          className="px-2.5 py-1 text-text-soft transition-colors hover:text-text"
                        >
                          −
                        </button>
                        <span className="lining-figures min-w-6 text-center text-[0.85rem]">
                          {l.qty}
                        </span>
                        <button
                          onClick={() => setQty(l.slug, l.qty + 1)}
                          aria-label={`Increase ${p.name}`}
                          className="px-2.5 py-1 text-text-soft transition-colors hover:text-text"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(l.slug)}
                        className="link-underline label-caps !tracking-[0.14em] !text-[0.62rem]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[var(--rule)] px-7 py-6">
            <div className="flex items-baseline justify-between">
              <span className="label-caps">Subtotal</span>
              <span className="lining-figures display-serif text-[1.4rem] font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="body-copy mt-2 text-[0.78rem]">
              Shipping and any duties are calculated at checkout.
            </p>
            <button className="btn btn-solid mt-5 w-full" disabled>
              Checkout — opening soon
            </button>
            <p className="body-copy mt-3 text-center text-[0.72rem]">
              Payment isn&rsquo;t connected yet. Your bag is saved on this
              device.
            </p>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Product detail                                                      */
/* ------------------------------------------------------------------ */
export function ProductDrawer() {
  const { viewing, closeView, add } = useShop();

  return (
    <Sheet
      open={Boolean(viewing)}
      onClose={closeView}
      labelledBy="product-title"
      width="min(96vw, 560px)"
    >
      {viewing && (
        <>
          <div className="flex items-center justify-between border-b border-[var(--rule)] px-7 py-5">
            <p className="label-caps">{viewing.collection}</p>
            <button onClick={closeView} className="label-caps !tracking-[0.16em]">
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div
              data-sheet-item
              className="relative aspect-square w-full bg-espresso"
            >
              <Image
                src={productImage(viewing.slug)}
                alt={viewing.name}
                fill
                sizes="(max-width: 640px) 96vw, 560px"
                className="object-cover"
                priority
              />
            </div>

            <div className="px-7 py-7">
              <div data-sheet-item className="flex items-start justify-between gap-6">
                <div>
                  <h2
                    id="product-title"
                    className="display-serif text-[1.7rem] font-medium leading-tight"
                  >
                    {viewing.name}
                  </h2>
                  <p className="body-copy mt-1 text-[0.9rem]">
                    {viewing.subtitle}
                  </p>
                </div>
                <p className="lining-figures display-serif shrink-0 text-[1.5rem] font-medium">
                  {formatPrice(viewing.price)}
                </p>
              </div>

              <p data-sheet-item className="label-caps mt-4">
                {viewing.edition}
              </p>

              <p data-sheet-item className="body-copy mt-6 text-[0.95rem]">
                {viewing.blurb}
              </p>

              <dl data-sheet-item className="mt-8">
                {viewing.spec.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-6 border-b border-[var(--rule)] py-3.5"
                  >
                    <dt className="label-caps !tracking-[0.14em]">{k}</dt>
                    <dd className="text-right text-[0.9rem] text-text">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* The Unsplash licence doesn't require attribution — we credit
                  anyway, because using someone's photograph silently is poor
                  form. Our own renders carry no credit. */}
              <p data-sheet-item className="label-caps mt-6 !text-[0.6rem]">
                {viewing.credit ? (
                  <>
                    Photography via{" "}
                    <a
                      href={viewing.credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      {viewing.credit.source}
                    </a>
                  </>
                ) : (
                  "Rendered in-house"
                )}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--rule)] px-7 py-5">
            {viewing.available ? (
              <button
                onClick={() => {
                  add(viewing.slug);
                  closeView();
                }}
                className="btn btn-solid w-full"
              >
                Add to bag — {formatPrice(viewing.price)}
              </button>
            ) : (
              <a
                href="#register"
                onClick={closeView}
                className="btn btn-solid w-full"
              >
                Join the list
              </a>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
