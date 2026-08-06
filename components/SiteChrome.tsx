"use client";

import { usePathname } from "next/navigation";
import { ShopProvider } from "@/components/shop/ShopProvider";
import SiteNav from "@/components/shop/SiteNav";
import { CartDrawer, ProductDrawer } from "@/components/shop/Drawers";
import ChatWidget from "@/components/chat/ChatWidget";

/**
 * Everything that should appear on *every* page: nav, cart, and the customer
 * service assistant. Mounted from app/layout.tsx.
 *
 * This is also why ShopProvider lives here rather than in the page — the chat
 * widget adds items to the bag, so both need to sit under the same provider.
 *
 * /scenes/* is the bare product-render surface that scripts/render-products.mjs
 * screenshots. Any chrome there would end up baked into the product imagery,
 * so the whole lot is skipped for those routes.
 */
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRenderSurface = pathname?.startsWith("/scenes");

  if (isRenderSurface) return <>{children}</>;

  return (
    <ShopProvider>
      <SiteNav />
      {children}
      <CartDrawer />
      <ProductDrawer />
      <ChatWidget />
    </ShopProvider>
  );
}
