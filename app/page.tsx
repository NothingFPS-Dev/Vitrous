import Hero from "@/components/Hero";
import SmoothScroll from "@/components/SmoothScroll";
import ProductGrid from "@/components/shop/ProductGrid";
import {
  Invitation,
  Origin,
  Making,
  Register,
  Waitlist,
  SiteFooter,
} from "@/components/Sections";

// Nav, cart drawers and the chat assistant are mounted in app/layout.tsx
// via <SiteChrome>, so they persist across every route.
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <main>
        <Hero />
        <ProductGrid />
        <Invitation />
        <Origin />
        <Making />
        <Register />
        <Waitlist />
        <SiteFooter />
      </main>
    </>
  );
}
