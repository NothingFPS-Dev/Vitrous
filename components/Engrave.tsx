"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

const SUGGESTIONS = [
  "a frozen wave at midnight",
  "smoke caught in amber",
  "the green of very old bottle glass",
  "a cap that looks like rain on a window",
];

export default function Engrave() {
  const [prompt, setPrompt] = useState("");
  const [concept, setConcept] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const out = useRef<HTMLParagraphElement>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (status === "working" || prompt.trim().length < 3) return;

    setStatus("working");
    setMessage("");

    try {
      const res = await fetch("/api/engrave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "The register could not be reached.");
        return;
      }

      setConcept(data.concept);
      setStatus("done");

      requestAnimationFrame(() => {
        if (!out.current) return;
        gsap.fromTo(
          out.current,
          { opacity: 0, y: 14, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power3.out" }
        );
      });
    } catch {
      setStatus("error");
      setMessage("Network trouble. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label htmlFor="commission" className="label-caps">
          Describe the piece
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            id="commission"
            value={prompt}
            maxLength={240}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="a frozen wave at midnight…"
            className="w-full border-0 border-b border-[var(--rule-strong)] bg-transparent px-0 py-3 text-[1rem] font-normal text-text transition-colors placeholder:text-text-mute focus:border-espresso focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "working" || prompt.trim().length < 3}
            className="btn btn-solid shrink-0"
          >
            <span className="label-caps text-current !tracking-[0.22em]">
              {status === "working" ? "Recording…" : "Record it"}
            </span>
          </button>
        </div>
      </form>

      {/* suggestions */}
      {status === "idle" && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPrompt(s)}
              className="rounded-[3px] border border-[var(--rule)] px-3 py-1.5 text-[0.78rem] font-normal text-text-soft transition-colors duration-300 hover:border-[var(--rule-strong)] hover:text-text"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {message && (
        <p className="mt-5 text-[0.88rem] font-normal text-[#9c3b28]" role="alert">
          {message}
        </p>
      )}

      {status === "done" && concept && (
        <div className="mt-8 border-l border-[var(--rule-strong)] pl-6" aria-live="polite">
          <p className="label-caps mb-3">Entered in the register</p>
          <p
            ref={out}
            className="display-serif text-[clamp(1.15rem,2.4vw,1.5rem)] font-normal leading-[1.5] text-text"
          >
            {concept}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setConcept("");
              setPrompt("");
            }}
            className="label-caps mt-5 transition-colors duration-300 hover:text-text"
          >
            Describe another →
          </button>
        </div>
      )}
    </div>
  );
}
