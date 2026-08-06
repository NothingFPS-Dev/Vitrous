"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import gsap from "gsap";
import { useShop } from "@/components/shop/ShopProvider";
import { formatPrice } from "@/lib/products";

/* Shape returned by the findProducts tool on the server. */
interface ToolProduct {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  priceLabel: string;
  collection: string;
  edition: string;
  available: boolean;
  image: string;
}

/**
 * The panel renders plain text, so any markdown the model slips through would
 * show as literal asterisks. The system prompt asks for prose; this is the
 * belt-and-braces pass for when it doesn't comply.
 */
function stripMarkdown(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/(^|\s)\*(?!\s)(.+?)(?<!\s)\*/g, "$1$2") // italic
    .replace(/^\s*[*-]\s+/gm, "• ") // bullets
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/`([^`]+)`/g, "$1"); // inline code
}

const OPENERS = [
  "What would suit a first build?",
  "Do you ship to the UK?",
  "Something under £100?",
  "When is the glass ESC out?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { add, openCart } = useShop();

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  useLayoutEffect(() => {
    if (panel.current) gsap.set(panel.current, { yPercent: 6, opacity: 0 });
  }, []);

  useEffect(() => {
    if (!panel.current) return;
    gsap.killTweensOf(panel.current);
    if (open) {
      gsap.set(panel.current, { pointerEvents: "auto" });
      gsap.to(panel.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      gsap.to(panel.current, {
        yPercent: 6,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(panel.current, { pointerEvents: "none" }),
      });
    }
  }, [open]);

  // keep the transcript pinned to the newest message
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[90] flex h-14 items-center gap-2.5 rounded-full border border-espresso bg-espresso pl-5 pr-5 text-[var(--text-inv)] shadow-[var(--shadow-lift)] transition-all duration-300 hover:bg-sienna hover:border-sienna sm:bottom-7 sm:right-7"
      >
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full bg-[var(--sienna-soft)]"
        />
        <span className="label-caps !text-[0.64rem] !tracking-[0.18em] !text-[var(--text-inv)]">
          {open ? "Close" : "Help"}
        </span>
      </button>

      {/* panel */}
      <div
        ref={panel}
        role="dialog"
        aria-label="Vitrous customer service"
        className="fixed bottom-[5.5rem] right-4 z-[95] flex h-[min(72vh,620px)] w-[min(94vw,420px)] flex-col overflow-hidden rounded-[4px] border border-[var(--rule-strong)] bg-parchment shadow-[var(--shadow-lift)] sm:bottom-[6.5rem] sm:right-7"
        style={{ pointerEvents: "none" }}
      >
        <header className="flex items-center justify-between border-b border-[var(--rule)] bg-sand px-5 py-4">
          <div>
            <p className="display-serif text-[1.05rem] font-medium leading-none">
              Vitrous — Help
            </p>
            <p className="label-caps mt-1.5 !text-[0.58rem]">
              Usually replies instantly
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="label-caps !text-[0.6rem] !tracking-[0.16em]"
          >
            Close
          </button>
        </header>

        <div ref={scroller} className="flex-1 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <>
              <p className="body-copy text-[0.92rem]">
                Ask about a piece, materials, shipping or returns. I can point
                you to anything in the catalogue.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {OPENERS.map((o) => (
                  <button
                    key={o}
                    onClick={() => submit(o)}
                    className="rounded-[2px] border border-[var(--rule)] px-3 py-2 text-left text-[0.84rem] text-text-soft transition-colors duration-300 hover:border-[var(--rule-strong)] hover:text-text"
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((m) => (
            <div key={m.id} className="mb-4">
              {m.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "ml-auto w-fit max-w-[85%] rounded-[3px] bg-espresso px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-[var(--text-inv)]"
                          : "max-w-[92%] whitespace-pre-wrap text-[0.92rem] leading-relaxed text-text"
                      }
                    >
                      {m.role === "user" ? part.text : stripMarkdown(part.text)}
                    </div>
                  );
                }

                // product cards returned by the findProducts tool
                if (isToolUIPart(part) && getToolName(part) === "findProducts") {
                  if (part.state !== "output-available") {
                    return (
                      <p key={i} className="label-caps !text-[0.6rem]">
                        Checking the catalogue…
                      </p>
                    );
                  }
                  const out = part.output as { products?: ToolProduct[] };
                  const items = out?.products ?? [];
                  if (!items.length) return null;
                  return (
                    <div key={i} className="mt-3 flex flex-col gap-2">
                      {items.map((p) => (
                        <div
                          key={p.slug}
                          className="flex gap-3 rounded-[3px] border border-[var(--rule)] p-2.5"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[2px] bg-espresso">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <p className="display-serif text-[0.95rem] font-medium leading-tight">
                              {p.name}
                            </p>
                            <p className="body-copy text-[0.76rem] leading-tight">
                              {p.subtitle}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                            <span className="lining-figures text-[0.86rem] text-text">
                              {formatPrice(p.price)}
                            </span>
                            {p.available ? (
                              <button
                                onClick={() => {
                                  add(p.slug);
                                  setOpen(false);
                                  openCart();
                                }}
                                className="label-caps !text-[0.55rem] !tracking-[0.14em] text-sienna transition-colors hover:text-text"
                              >
                                Add to bag
                              </button>
                            ) : (
                              <span className="label-caps !text-[0.55rem]">
                                Waitlist
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}

          {busy && (
            <p className="label-caps !text-[0.6rem]" aria-live="polite">
              Typing…
            </p>
          )}

          {error && (
            <p className="mt-2 text-[0.84rem] text-[#9c3b28]" role="alert">
              The assistant is unavailable just now. Please try again shortly.
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2 border-t border-[var(--rule)] px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a piece…"
            maxLength={500}
            aria-label="Message"
            className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent px-1 py-2 text-[0.92rem] text-text placeholder:text-text-mute focus:border-[var(--rule-strong)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="btn btn-solid !px-5 !py-2.5 !text-[0.62rem]"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
