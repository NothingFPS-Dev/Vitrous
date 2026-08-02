import { notFound } from "next/navigation";
import ProductScene from "@/components/ProductScene";
import { PRODUCTS, bySlug } from "@/lib/products";

/**
 * Bare render surface for one product — no nav, no chrome, just the scene at a
 * fixed size. scripts/render-products.mjs screenshots these into
 * public/products/*.png so the storefront ships static, fast imagery.
 *
 * Harmless to leave deployed, but it is excluded from search.
 */
export const metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  // only products with a scene are renderable
  return PRODUCTS.filter((p) => p.scene).map((p) => ({ slug: p.slug }));
}

export default async function ScenePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = bySlug(slug);
  if (!product?.scene) notFound();

  return (
    <>
      {/* the dev-tools badge would otherwise land in every product shot */}
      <style>{`nextjs-portal, #__next-build-watcher { display: none !important; }`}</style>
      <main
      id="scene-root"
      style={{
        width: 1100,
        height: 1100,
        background: "#191713",
        overflow: "hidden",
      }}
    >
        <ProductScene spec={product.scene} size={1100} />
      </main>
    </>
  );
}
