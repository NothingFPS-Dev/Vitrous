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

// read slugs straight out of the catalogue so the two can't drift
const src = await readFile("lib/products.ts", "utf8");
const slugs = [...src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
if (!slugs.length) {
  console.error("No product slugs found in lib/products.ts");
  process.exit(1);
}

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
