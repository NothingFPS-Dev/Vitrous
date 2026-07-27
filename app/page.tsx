import Hero from "@/components/Hero";
import {
  Manifesto,
  Making,
  Specification,
  Waitlist,
  SiteFooter,
} from "@/components/Sections";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <Making />
      <Specification />
      <Waitlist />
      <SiteFooter />
    </main>
  );
}
