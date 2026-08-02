import Hero from "@/components/Hero";
import SmoothScroll from "@/components/SmoothScroll";
import { ShopProvider } from "@/components/shop/ShopProvider";
import SiteNav from "@/components/shop/SiteNav";
import ProductGrid from "@/components/shop/ProductGrid";
import { CartDrawer, ProductDrawer } from "@/components/shop/Drawers";
import {
  Invitation,
  Origin,
  Making,
  Register,
  Waitlist,
  SiteFooter,
} from "@/components/Sections";

export default function Home() {
  return (
    <ShopProvider>
      <SmoothScroll />
      <SiteNav />
      <main>
        <Hero />
        {/* the shop leads — this is a storefront first now */}
        <ProductGrid />
        <Invitation />
        <Origin />
        <Making />
        <Register />
        <Waitlist />
        <SiteFooter />
      </main>
      <CartDrawer />
      <ProductDrawer />
    </ShopProvider>
  );
}
