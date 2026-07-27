"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

type Title = "MR" | "MRS";
type Kind = "WAITLIST" | "PREORDER";
type Status = "idle" | "sending" | "done" | "error";

export default function WaitlistForm({ kind = "WAITLIST" }: { kind?: Kind }) {
  const [title, setTitle] = useState<Title | null>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [already, setAlready] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    if (!title) {
      setStatus("error");
      setMessage("Please select a title.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, firstName, email, kind }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setAlready(Boolean(data.already));
      setStatus("done");

      // fade the form out, the confirmation in
      gsap
        .timeline()
        .to(formRef.current, {
          opacity: 0,
          y: -8,
          duration: 0.45,
          ease: "power2.in",
        })
        .set(formRef.current, { display: "none" })
        .fromTo(
          doneRef.current,
          { opacity: 0, y: 12, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          }
        );
    } catch {
      setStatus("error");
      setMessage("Network trouble. Please try again.");
    }
  }

  const field =
    "peer w-full bg-transparent border-0 border-b border-white/15 px-0 py-3 text-[0.95rem] font-light text-platinum placeholder:text-white/25 focus:border-platinum focus:outline-none transition-colors";

  return (
    <div className="relative w-full max-w-xl">
      {/* confirmation */}
      <div
        ref={doneRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center opacity-0"
        aria-live="polite"
      >
        {status === "done" && (
          <>
            <p className="display-serif text-[clamp(1.5rem,3vw,2.1rem)] leading-tight">
              {already ? (
                <>You are already with us.</>
              ) : (
                <>
                  Thank you,{" "}
                  <em className="italic text-silver">
                    {title === "MR" ? "Mr" : "Mrs"} {firstName.trim()}
                  </em>
                  .
                </>
              )}
            </p>
            <p className="mt-3 max-w-sm text-[0.9rem] font-light leading-6 text-smoke">
              {already
                ? "Your place is held. We will write to you before the release."
                : "Your place is held. We will write to you once, when the First Edition opens."}
            </p>
          </>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex flex-col gap-7"
        noValidate
      >
        {/* title */}
        <fieldset className="flex flex-col gap-3">
          <legend className="label-caps mb-1">Title</legend>
          <div className="flex gap-3">
            {(["MR", "MRS"] as const).map((t) => {
              const active = title === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  aria-pressed={active}
                  className={[
                    "label-caps !tracking-[0.2em] rounded-[3px] border px-6 py-2.5 transition-all duration-300",
                    active
                      ? "border-platinum bg-platinum text-black"
                      : "border-white/15 text-silver hover:border-white/40 hover:text-platinum",
                  ].join(" ")}
                >
                  {t === "MR" ? "Mr" : "Mrs"}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* first name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="label-caps">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alexander"
            className={field}
          />
        </div>

        {/* email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="label-caps">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className={field}
          />
        </div>

        {message && (
          <p className="text-[0.85rem] font-light text-[#c98b84]" role="alert">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="group relative mt-1 overflow-hidden rounded-[3px] border border-platinum bg-platinum px-8 py-3.5 text-black transition-all duration-300 hover:bg-transparent hover:text-platinum disabled:cursor-wait disabled:opacity-60"
        >
          <span className="label-caps text-current !tracking-[0.24em]">
            {status === "sending"
              ? "Securing your place…"
              : kind === "PREORDER"
                ? "Reserve a piece"
                : "Request an invitation"}
          </span>
        </button>

        <p className="text-[0.75rem] font-light leading-5 text-smoke">
          One email, once. No newsletters, no forwarding, no third parties.
        </p>
      </form>
    </div>
  );
}
