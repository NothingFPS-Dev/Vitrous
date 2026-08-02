/* ===========================================================================
   The Vitrous catalogue.

   Every product is Vitrous's own — nothing here references or resells another
   maker's goods, and every image is rendered in-house from `scenes/[slug]`
   by scripts/render-products.mjs, so the shop owns its photography outright.
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
  /** minor units, GBP-style integer pence-free: 89 = £89 */
  price: number;
  collection: "Singles" | "Sets" | "Objects";
  edition: string;
  blurb: string;
  spec: [string, string][];
  scene: Scene;
  /** true = orderable now, false = the coming-soon flagship */
  available: boolean;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "esc-obsidian",
    name: "ESC — Obsidian",
    subtitle: "Smoke-cast escape key",
    price: 89,
    collection: "Singles",
    edition: "First Edition · 100 pieces",
    blurb:
      "The piece the workshop was founded to make. Lead-free crystal pulled dark with manganese, so the cap reads almost black until light passes through it and finds the smoke inside.",
    spec: [
      ["Material", "Lead-free optical crystal"],
      ["Profile", "OEM R1 — escape row"],
      ["Stem", "Cherry MX cross, cut by hand"],
      ["Mass", "11.4 g"],
      ["Edition", "One hundred, numbered"],
    ],
    scene: { kind: "single", tint: "obsidian", legend: "esc" },
    available: false,
    featured: true,
  },
  {
    slug: "esc-clear",
    name: "ESC — Clear",
    subtitle: "Optical clear escape key",
    price: 89,
    collection: "Singles",
    edition: "Open edition",
    blurb:
      "Undyed crystal, polished to nine grades. The most difficult finish we make — clear glass hides nothing, so every inclusion and every stroke of the abrasive has to be answered for.",
    spec: [
      ["Material", "Lead-free optical crystal"],
      ["Profile", "OEM R1 — escape row"],
      ["Clarity", "Inclusion-free, graded by eye"],
      ["Mass", "11.1 g"],
      ["Edition", "Open"],
    ],
    scene: { kind: "single", tint: "clear", legend: "esc" },
    available: true,
  },
  {
    slug: "esc-amber",
    name: "ESC — Amber",
    subtitle: "Iron-tinted escape key",
    price: 95,
    collection: "Singles",
    edition: "Open edition",
    blurb:
      "Iron oxide folded into the melt gives a warm, resinous body — the colour of very old bottle glass held against a window. Warms further under lamplight.",
    spec: [
      ["Material", "Iron-tinted optical crystal"],
      ["Profile", "OEM R1 — escape row"],
      ["Colourant", "Iron oxide, in-melt"],
      ["Mass", "11.4 g"],
      ["Edition", "Open"],
    ],
    scene: { kind: "single", tint: "amber", legend: "esc" },
    available: true,
  },
  {
    slug: "esc-cobalt",
    name: "ESC — Cobalt",
    subtitle: "Cobalt-tinted escape key",
    price: 95,
    collection: "Singles",
    edition: "Open edition",
    blurb:
      "A single gram of cobalt colours forty kilos of glass. Ours sits deep and cold, dark at the shoulders and clearest across the dished face where the wall runs thin.",
    spec: [
      ["Material", "Cobalt-tinted optical crystal"],
      ["Profile", "OEM R1 — escape row"],
      ["Colourant", "Cobalt oxide, in-melt"],
      ["Mass", "11.4 g"],
      ["Edition", "Open"],
    ],
    scene: { kind: "single", tint: "cobalt", legend: "esc" },
    available: true,
  },
  {
    slug: "esc-rose",
    name: "ESC — Rose",
    subtitle: "Selenium-tinted escape key",
    price: 95,
    collection: "Singles",
    edition: "Open edition",
    blurb:
      "Selenium pink, the hardest tint to hold steady — a few degrees either side of temperature and the batch turns grey. We lose roughly one pour in four.",
    spec: [
      ["Material", "Selenium-tinted crystal"],
      ["Profile", "OEM R1 — escape row"],
      ["Colourant", "Selenium, in-melt"],
      ["Mass", "11.4 g"],
      ["Edition", "Open"],
    ],
    scene: { kind: "single", tint: "rose", legend: "esc" },
    available: true,
  },
  {
    slug: "cardinal-set",
    name: "The Cardinal Set",
    subtitle: "Four glass modifiers",
    price: 320,
    collection: "Sets",
    edition: "Open edition",
    blurb:
      "Escape, tab, control and command — the four keys a hand finds without looking. Cast in one session from a single melt so the four match, which a second melt never quite does.",
    spec: [
      ["Contents", "esc · tab · ctrl · cmd"],
      ["Material", "Lead-free optical crystal"],
      ["Profile", "OEM R1 / R2"],
      ["Matching", "Single-melt, four caps"],
      ["Edition", "Open"],
    ],
    scene: {
      kind: "set",
      tint: "smoke",
      count: 4,
      legends: ["esc", "tab", "ctrl", "cmd"],
    },
    available: true,
  },
  {
    slug: "monolith-spacebar",
    name: "Monolith",
    subtitle: "6.25u glass spacebar",
    price: 240,
    collection: "Sets",
    edition: "Limited · 40 pieces",
    blurb:
      "Six and a quarter units of unbroken crystal. Long glass wants to bow as it cools, so each bar spends nineteen days in the kiln rather than eleven — more than half our annealing capacity for one object.",
    spec: [
      ["Material", "Lead-free optical crystal"],
      ["Width", "6.25u"],
      ["Anneal", "19 days, descending"],
      ["Mass", "62 g"],
      ["Edition", "Forty, numbered"],
    ],
    scene: { kind: "spacebar", tint: "smoke" },
    available: true,
  },
  {
    slug: "artisan-001-ember",
    name: "Artisan Nº 001 — Ember",
    subtitle: "One-off, colour suspended in-body",
    price: 180,
    collection: "Objects",
    edition: "One of one",
    blurb:
      "A thread of ember-red dropped into clear crystal mid-pour and frozen where it fell. It cannot be repeated — the pattern belongs to the second it was made in.",
    spec: [
      ["Material", "Clear crystal, in-body colour"],
      ["Profile", "OEM R1"],
      ["Pattern", "Unrepeatable"],
      ["Mass", "11.6 g"],
      ["Edition", "One of one"],
    ],
    scene: { kind: "artisan", tint: "ember", legend: "esc" },
    available: true,
  },
  {
    slug: "the-vitrine",
    name: "The Vitrine",
    subtitle: "Walnut display plinth",
    price: 140,
    collection: "Objects",
    edition: "Open edition",
    blurb:
      "Oiled walnut, milled with a single seat. Made because a glass keycap spends most of its life not being typed on, and deserves somewhere better than a drawer.",
    spec: [
      ["Material", "Oiled English walnut"],
      ["Seat", "One cap, 1u"],
      ["Finish", "Hand-rubbed oil"],
      ["Footprint", "70 × 70 mm"],
      ["Edition", "Open"],
    ],
    scene: { kind: "plinth", tint: "clear", legend: "esc" },
    available: true,
  },
  {
    slug: "vitrum-full-set",
    name: "Vitrum — The Full Set",
    subtitle: "Twelve glass caps",
    price: 780,
    collection: "Sets",
    edition: "Limited · 25 sets",
    blurb:
      "Twelve caps, one melt, one hand. The largest run we can hold to a single tone; beyond twelve the glass shifts and the set stops reading as a set.",
    spec: [
      ["Contents", "12 caps, mixed profile"],
      ["Material", "Lead-free optical crystal"],
      ["Matching", "Single-melt across twelve"],
      ["Anneal", "11 days, each"],
      ["Edition", "Twenty-five sets"],
    ],
    scene: { kind: "set", tint: "clear", count: 12 },
    available: true,
  },
];

export const COLLECTIONS = ["All", "Singles", "Sets", "Objects"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(n);

export const productImage = (slug: string) => `/products/${slug}.png`;
