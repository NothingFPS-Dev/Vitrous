import Hero from "@/components/Hero";
import SmoothScroll from "@/components/SmoothScroll";
import {
  Invitation,
  Origin,
  Making,
  Specification,
  Waitlist,
  SiteFooter,
} from "@/components/Sections";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <main>
        <Hero />
        {/* exclusivity lands immediately after the hero, while attention is high */}
        <Invitation />
        <Origin />
        <Making />
        <Specification />
        <Waitlist />
        <SiteFooter />
      </main>
    </>
  );
}
