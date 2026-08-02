"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PRODUCTS, type Product, bySlug } from "@/lib/products";

export interface CartLine {
  slug: string;
  qty: number;
}

interface ShopState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;

  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;

  viewing: Product | null;
  view: (slug: string) => void;
  closeView: () => void;
}

const Ctx = createContext<ShopState | null>(null);
const STORAGE_KEY = "vitrous.cart.v1";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewingSlug, setViewingSlug] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // restore, ignoring anything that no longer matches the catalogue
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartLine[] = JSON.parse(raw);
        setLines(
          parsed.filter(
            (l) =>
              typeof l?.slug === "string" &&
              Number.isFinite(l.qty) &&
              l.qty > 0 &&
              PRODUCTS.some((p) => p.slug === l.slug)
          )
        );
      }
    } catch {
      /* corrupt cart is not worth crashing over */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode, quota — non-fatal */
    }
  }, [lines, hydrated]);

  const add = useCallback((slug: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.slug === slug);
      if (found) {
        return prev.map((l) =>
          l.slug === slug ? { ...l, qty: Math.min(l.qty + qty, 12) } : l
        );
      }
      return [...prev, { slug, qty: Math.min(qty, 12) }];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) =>
            l.slug === slug ? { ...l, qty: Math.min(qty, 12) } : l
          )
    );
  }, []);

  const remove = useCallback(
    (slug: string) => setLines((p) => p.filter((l) => l.slug !== slug)),
    []
  );

  const value = useMemo<ShopState>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce(
      (n, l) => n + (bySlug(l.slug)?.price ?? 0) * l.qty,
      0
    );
    return {
      lines,
      count,
      subtotal,
      add,
      setQty,
      remove,
      clear: () => setLines([]),
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      menuOpen,
      toggleMenu: () => setMenuOpen((m) => !m),
      closeMenu: () => setMenuOpen(false),
      viewing: viewingSlug ? bySlug(viewingSlug) ?? null : null,
      view: (slug: string) => setViewingSlug(slug),
      closeView: () => setViewingSlug(null),
    };
  }, [lines, cartOpen, menuOpen, viewingSlug, add, setQty, remove]);

  // lock the page behind any open overlay
  useEffect(() => {
    const locked = cartOpen || menuOpen || Boolean(viewingSlug);
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, menuOpen, viewingSlug]);

  // escape closes the topmost overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewingSlug) setViewingSlug(null);
      else if (cartOpen) setCartOpen(false);
      else if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, menuOpen, viewingSlug]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
