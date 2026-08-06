import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { PRODUCTS, formatPrice } from "@/lib/products";

/* ===========================================================================
   Customer-service agent for the Vitrous storefront.
   Groq via the Vercel AI SDK, streamed to the client.
   =========================================================================== */

export const maxDuration = 30;

/*
 * gpt-oss-120b rather than llama-3.3-70b: on Groq, Llama 3.3 reliably breaks
 * the second step of a tool loop — it emits the arguments *inside* the tool
 * name (`findProducts {"maxPrice": 100}`), which Groq rejects as an unknown
 * tool and the whole reply comes back empty. gpt-oss-120b handles the loop
 * cleanly. Override with GROQ_MODEL if you want to swap it.
 */
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

/** Catalogue summary injected into the system prompt so the agent can't invent stock. */
const catalogue = PRODUCTS.map(
  (p) =>
    `- ${p.name} (slug: ${p.slug}) — ${p.subtitle}. ${formatPrice(p.price)}. ` +
    `Collection: ${p.collection}. ${p.edition}. ` +
    `${p.available ? "Available now." : "NOT yet on sale — waitlist only."}`
).join("\n");

const SYSTEM = `You are the customer-service assistant for Vitrous, a small atelier that sells glass keycaps, keycap sets, a barebones keyboard, switches and tools.

Voice: calm, precise, warm but unfussy. Short paragraphs. British spelling. Never use exclamation marks or sales hype. You are staff, not a salesperson on commission.

THE CATALOGUE — this is the complete list. Nothing else exists:
${catalogue}

Policies you may state as fact:
- Shipping: free worldwide over £150; otherwise £8. Dispatch in 3–5 working days.
- Returns: 30 days, unused and in original packaging. One-of-one artisan pieces are final sale.
- Every piece is cast or assembled to order; nothing is held in stock.
- Payment/checkout is not open yet — the bag saves, but orders cannot be completed. Say so plainly if asked to buy.
- The ESC — Obsidian is the flagship and is not on sale yet; visitors join the waitlist for it.

Formatting — important:
- Write plain prose only. No markdown: no asterisks, no bold, no bullet lists, no headings. The chat window renders raw text, so markup shows up as literal characters.
- When findProducts returns results, the interface already displays each product as a card with its image, price and an add-to-bag button. Do NOT list those products again. Instead write one or two short sentences of guidance — which one you'd suggest and why, or what to consider between them.

Rules:
- Use the findProducts tool whenever a customer asks what you sell, asks for a recommendation, or mentions a colour, budget, type or use case. Do not describe products from memory when the tool can confirm them.
- Never invent a product, price, material, delivery date or discount code. If you don't know, say you'll pass it to the workshop.
- Never claim an order is placed, refunded or shipped. You cannot take payments or look up orders.
- If asked something off-topic, answer briefly and steer back to the shop.
- Keep answers under about 90 words unless the customer asks for detail.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "The assistant is offline.", reason: "no_api_key" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Malformed request." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return new Response(JSON.stringify({ error: "No messages." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const groq = createGroq({ apiKey });

  const result = streamText({
    model: groq(MODEL),
    system: SYSTEM,
    messages: await convertToModelMessages(messages as never),
    temperature: 0.4,
    // one round of tool call + follow-up answer is enough for a shop assistant
    stopWhen: stepCountIs(3),
    tools: {
      findProducts: tool({
        description:
          "Search the Vitrous catalogue. Use for recommendations, browsing, budgets, colours, or 'what do you sell'. Returns real products the UI renders as cards.",
        inputSchema: z.object({
          query: z
            .string()
            .describe("What the customer is after — colour, type, use case, or a product name.")
            .optional(),
          collection: z
            .enum(["Keycaps", "Boards", "Parts"])
            .describe("Narrow to one collection.")
            .optional(),
          maxPrice: z.number().describe("Upper price limit in pounds.").optional(),
        }),
        execute: async ({ query, collection, maxPrice }) => {
          const terms = (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
          const scored = PRODUCTS.map((p) => {
            const haystack = [
              p.name,
              p.subtitle,
              p.blurb,
              p.collection,
              p.spec.map(([k, v]) => `${k} ${v}`).join(" "),
            ]
              .join(" ")
              .toLowerCase();
            const score = terms.reduce(
              (n, t) => n + (haystack.includes(t) ? 1 : 0),
              0
            );
            return { p, score };
          })
            .filter(({ p }) => !collection || p.collection === collection)
            .filter(({ p }) => maxPrice === undefined || p.price <= maxPrice)
            .filter(({ score }) => terms.length === 0 || score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);

          const hits = (scored.length ? scored : PRODUCTS.slice(0, 3).map((p) => ({ p, score: 0 })))
            .map(({ p }) => ({
              slug: p.slug,
              name: p.name,
              subtitle: p.subtitle,
              price: p.price,
              priceLabel: formatPrice(p.price),
              collection: p.collection,
              edition: p.edition,
              available: p.available,
              image: p.image,
            }));

          return { count: hits.length, products: hits };
        },
      }),
    },
  });

  // Surface provider failures as a readable line instead of a silently empty
  // reply — the failure mode that hid the Llama tool-calling bug above.
  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[chat] stream error:", error);
      return "Sorry — I lost that one. Could you ask again?";
    },
  });
}
