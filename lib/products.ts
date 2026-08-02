/* ===========================================================================
   The Vitrous catalogue.

   Imagery, and why it is what it is:
   - The flagship ESC is rendered in-house from the same glass kit as the hero
     (`scenes/[slug]` + scripts/render-products.mjs), so the shop owns it.
   - Everything else is photographed, sourced from Unsplash under a licence
     that permits free use without attribution. Credits are kept anyway in
     `credit` below and surfaced in the product drawer — attribution isn't
     required, but taking someone's photograph and saying nothing is poor form.

   Nothing here reproduces another retailer's photography or product names.
   =========================================================================== */

export type Scene =
  | { kind: "single"; tint: string; legend: string }
  | { kind: "spacebar"; tint: string }
  | { kind: "set"; tint: string; count: 4 | 12; legends?: string[] }
  | { kind: "plinth"; tint: string; legend: string }
  | { kind: "artisan"; tint: string; legend: string };

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  /** whole pounds — 89 renders as £89 */
  price: number;
  collection: "Keycaps" | "Boards" | "Parts";
  edition: string;
  blurb: string;
  spec: [string, string][];
  /** file under /public/products */
  image: string;
  /** photo credit, or null when the image is our own render */
  credit: { source: "Unsplash"; url: string } | null;
  /** only set for the rendered flagship */
  scene?: Scene;
  available: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "esc-obsidian",
    name: "ESC — Obsidian",
    subtitle: "Hand-cast glass escape key",
    price: 89,
    collection: "Keycaps",
    edition: "First Edition · 100 pieces",
    blurb:
      "The piece the workshop was founded to make, and the only one we cast ourselves. Lead-free crystal pulled dark with manganese, poured into a mould that survives exactly one pour.",
    spec: [
      ["Material", "Lead-free optical crystal"],
      ["Profile", "OEM R1 — escape row"],
      ["Stem", "Cherry MX cross, cut by hand"],
      ["Anneal", "11 days, descending kiln"],
      ["Edition", "One hundred, numbered"],
    ],
    image: "/products/esc-obsidian.png",
    credit: null,
    scene: { kind: "single", tint: "obsidian", legend: "esc" },
    available: false,
  },
  {
    slug: "pastel-archive",
    name: "Pastel Archive",
    subtitle: "Full dye-sublimated set, 129 keys",
    price: 165,
    collection: "Keycaps",
    edition: "Open edition",
    blurb:
      "Mint, clay pink and powder blue across a full set, with sublegends printed rather than pad-stamped so they will not wear off under a thumb. Cherry profile, thick PBT.",
    spec: [
      ["Contents", "129 keys, Cherry profile"],
      ["Material", "1.5 mm PBT"],
      ["Legends", "Dye-sublimated"],
      ["Layouts", "ANSI · ISO · 65% · 75%"],
      ["Edition", "Open"],
    ],
    image: "/products/pastel-archive.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/Z6SXt1v5tP8" },
    available: true,
  },
  {
    slug: "sunset-gradient",
    name: "Sunset Gradient",
    subtitle: "Graded set, peach through rose",
    price: 178,
    collection: "Keycaps",
    edition: "Limited · 300 sets",
    blurb:
      "A set graded row by row, warmest at the top and cooling as it descends. Matching a gradient across five rows of moulded plastic is difficult enough that we cap the run.",
    spec: [
      ["Contents", "126 keys, OEM profile"],
      ["Material", "PBT, doubleshot"],
      ["Gradient", "Five-step, row-matched"],
      ["Layouts", "ANSI · 60% · 65%"],
      ["Edition", "Three hundred sets"],
    ],
    image: "/products/sunset-gradient.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/8ssNFn4VPLg" },
    available: true,
  },
  {
    slug: "artisan-tide",
    name: "Artisan Nº 004 — Tide",
    subtitle: "Hand-poured resin, one of one",
    price: 140,
    collection: "Keycaps",
    edition: "One of one",
    blurb:
      "Blue resin poured in two stages so the wave sets before the clear coat goes over it. The break never lands twice in the same place, which is the point.",
    spec: [
      ["Material", "Two-stage cast resin"],
      ["Profile", "Fits R1 — escape or 1u"],
      ["Stem", "Cherry MX cross"],
      ["Pattern", "Unrepeatable"],
      ["Edition", "One of one"],
    ],
    image: "/products/artisan-tide.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/L4Bi4Zfb6Ls" },
    available: true,
  },
  {
    slug: "lavender-field",
    name: "Lavender Field",
    subtitle: "Muted violet set, blank modifiers",
    price: 152,
    collection: "Keycaps",
    edition: "Open edition",
    blurb:
      "A quiet violet that reads grey in daylight and purple under lamplight. Modifiers ship blank — the set is meant to be looked at rather than read.",
    spec: [
      ["Contents", "117 keys, blank mods"],
      ["Material", "PBT"],
      ["Profile", "Cherry"],
      ["Layouts", "ANSI · 65% · TKL"],
      ["Edition", "Open"],
    ],
    image: "/products/lavender-field.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/PT_9ux0j-x4" },
    available: true,
  },
  {
    slug: "chroma-retro",
    name: "Chroma Retro",
    subtitle: "Full colour set, cream and primary",
    price: 195,
    collection: "Keycaps",
    edition: "Limited · 200 sets",
    blurb:
      "Cream body, primary accents, and a colour order borrowed from machines that stopped being made before most of us could type. Loud on purpose.",
    spec: [
      ["Contents", "132 keys, SA profile"],
      ["Material", "Doubleshot ABS"],
      ["Accents", "Nine colourways in-set"],
      ["Layouts", "ANSI · full-size · TKL"],
      ["Edition", "Two hundred sets"],
    ],
    image: "/products/chroma-retro.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/PTTlyA62exo" },
    available: true,
  },
  {
    slug: "nightshift",
    name: "Nightshift",
    subtitle: "Shine-through set, cool white",
    price: 128,
    collection: "Keycaps",
    edition: "Open edition",
    blurb:
      "Opaque black with a translucent legend layer, so the board stays dark until it is lit. Built for people who work when everyone else has stopped.",
    spec: [
      ["Contents", "104 keys"],
      ["Material", "Doubleshot PBT"],
      ["Legends", "Shine-through"],
      ["Profile", "OEM"],
      ["Edition", "Open"],
    ],
    image: "/products/nightshift.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/dbgbyzFR8uI" },
    available: true,
  },
  {
    slug: "slate-84",
    name: "Slate 84",
    subtitle: "75% barebones, anodised aluminium",
    price: 320,
    collection: "Boards",
    edition: "Open edition",
    blurb:
      "A milled aluminium 75% with a gasket mount and no switches or caps — the base you build the rest of this catalogue onto. Hot-swap, so nothing needs soldering.",
    spec: [
      ["Layout", "75% · 84 keys"],
      ["Case", "CNC anodised aluminium"],
      ["Mount", "Gasket, poron"],
      ["Sockets", "Hot-swap, 3 and 5-pin"],
      ["Connection", "USB-C, detachable"],
    ],
    image: "/products/slate-84.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/cVUPic1cbd4" },
    available: true,
  },
  {
    slug: "tactile-switches",
    name: "Tactile 67g",
    subtitle: "Switch set, 70 pieces",
    price: 62,
    collection: "Parts",
    edition: "Open edition",
    blurb:
      "A rounded tactile bump early in the travel, factory-lubed and bagged in seventies so a 65% board is covered with spares. No spring ping worth complaining about.",
    spec: [
      ["Quantity", "70 switches"],
      ["Type", "Tactile"],
      ["Spring", "67 g bottom-out"],
      ["Lubrication", "Factory, light"],
      ["Pins", "5-pin, PCB mount"],
    ],
    image: "/products/tactile-switches.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/ZByWaPXD2fU" },
    available: true,
  },
  {
    slug: "service-kit",
    name: "The Service Kit",
    subtitle: "Puller, brush, lube and spares",
    price: 48,
    collection: "Parts",
    edition: "Open edition",
    blurb:
      "A wire puller that will not scar an ABS cap, a switch puller, a fine brush, a pot of lubricant and a strip of spare stabiliser inserts. Everything a board needs and nothing it does not.",
    spec: [
      ["Contents", "5 pieces"],
      ["Keycap puller", "Coated wire"],
      ["Switch puller", "Steel"],
      ["Lubricant", "10 g, PTFE-based"],
      ["Spares", "Stabiliser inserts ×4"],
    ],
    image: "/products/service-kit.jpg",
    credit: { source: "Unsplash", url: "https://unsplash.com/photos/c4a_0kycTUE" },
    available: true,
  },
];

export const COLLECTIONS = ["All", "Keycaps", "Boards", "Parts"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(n);

export const productImage = (slug: string) =>
  bySlug(slug)?.image ?? `/products/${slug}.png`;
