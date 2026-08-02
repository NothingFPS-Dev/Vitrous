/**
 * Pre-renders every catalogue product to public/products/<slug>.png by
 * screenshotting the /scenes/<slug> route.
 *
 *   npm run dev            # in one terminal
 *   node scripts/render-products.mjs
 *
 * Why pre-render rather than run WebGL in each card: ten live canvases on one
 * page is a lot of GPU for a grid that never moves. This way the shop ships
 * flat images and the only live scene is the hero.
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.RENDER_BASE ?? "http://localhost:3000";
const OUT_DIR = path.resolve("public/products");

/*
 * Read slugs from the catalogue so the two can't drift. Only entries that
 * declare a `scene` are rendered — the rest of the shop is photographed.
 * Splitting on the slug key gives one chunk per product, which is enough
 * structure to ask "does this one have a scene?" without parsing TypeScript.
 */
const src = await readFile("lib/products.ts", "utf8");
const chunks = src.split(/slug:\s*"/).slice(1);
const slugs = chunks
  .map((chunk) => {
    const slug = chunk.slice(0, chunk.indexOf('"'));
    const body = chunk.slice(0, chunk.indexOf("\n  },"));
    return body.includes("scene:") ? slug : null;
  })
  .filter(Boolean);

if (!slugs.length) {
  console.error("No renderable products found in lib/products.ts");
  process.exit(1);
}
console.log(`Renderable products: ${slugs.join(", ")}`);

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1100, height: 1100 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

let ok = 0;
for (const slug of slugs) {
  const url = `${BASE}/scenes/${slug}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    // the scene flags itself once enough frames have composited
    await page.waitForSelector("[data-ready='1']", { timeout: 45_000 });
    await page.waitForTimeout(600);
    await page.locator("#scene-root").screenshot({
      path: path.join(OUT_DIR, `${slug}.png`),
    });
    console.log(`  ✓ ${slug}.png`);
    ok++;
  } catch (err) {
    console.error(`  ✗ ${slug} — ${err.message.split("\n")[0]}`);
  }
}

await browser.close();
console.log(`\n${ok}/${slugs.length} rendered into public/products/`);
if (errors.length) {
  console.log("page errors:", [...new Set(errors)].slice(0, 5));
}
if (ok !== slugs.length) process.exit(1);
