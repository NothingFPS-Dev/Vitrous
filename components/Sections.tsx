"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "./Reveal";
import WaitlistForm from "./WaitlistForm";

gsap.registerPlugin(ScrollTrigger);

function Rule() {
  return <div className="hairline" />;
}

/* ------------------------------------------------------------------ */
/* 1. INVITATION — exclusivity, immediately after the hero             */
/* ------------------------------------------------------------------ */
const SCARCITY: [string, string][] = [
  ["100", "pieces in the edition. Ever."],
  ["01", "cast per mould, then destroyed."],
  ["11", "days annealing, each piece."],
];

export function Invitation() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      // the big numerals count up as they enter
      root.current!.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const pad = el.dataset.count!.length;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v)).padStart(pad, "0");
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="invitation" className="relative px-7 sm:px-12">
      <Rule />
      <Reveal className="mx-auto max-w-6xl py-24 sm:py-32" stagger={0.1}>
        <p data-r className="label-caps mb-8">
          The First Edition
        </p>

        <h2
          data-r
          className="display-serif max-w-3xl text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.02em] text-platinum"
        >
          One hundred will exist.
          <br />
          <em className="font-normal italic text-silver">
            Then the mould is broken.
          </em>
        </h2>

        <p data-r className="body-copy mt-6 max-w-xl text-[1rem]">
          Not a limited run in the marketing sense — a physical limit. Each cap
          is poured into a mould that survives exactly one pour. When the
          hundredth is finished, there is no mechanism by which a hundred and
          first could be made.
        </p>

        {/* scarcity figures */}
        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {SCARCITY.map(([n, label]) => (
            <div key={label} data-r className="flex flex-col">
              <span
                data-count={n}
                className="display-serif lining-figures text-[clamp(2.8rem,6vw,4.2rem)] font-medium leading-none text-platinum"
              >
                {n}
              </span>
              <span className="body-copy mt-3 text-[0.9rem] leading-6">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div data-r className="mt-16">
          <a
            href="#waitlist"
            className="group inline-flex items-center gap-3 rounded-[3px] border border-platinum bg-platinum px-8 py-4 text-black transition-all duration-300 hover:bg-transparent hover:text-platinum"
          >
            <span className="label-caps text-current !tracking-[0.24em]">
              Request an invitation
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <p className="body-copy mt-4 text-[0.82rem]">
            The list closes when the edition is sealed.
          </p>
        </div>
      </Reveal>
      <Rule />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. ORIGIN — the deep, ancient story                                 */
/* ------------------------------------------------------------------ */
const CHAPTERS: {
  numeral: string;
  title: string;
  lead?: string;
  body: string;
}[] = [
  {
    numeral: "I",
    title: "The Word",
    lead: "Vitrum.",
    body: " It is the Latin word for glass, and it is where this workshop takes its name. Rome did not invent the material — it inherited it, named it, and carried it to the edges of the known world.",
  },
  {
    numeral: "II",
    title: "The Breath",
    body: "Somewhere on the Levantine coast, around fifty years before the common era, a craftsman lowered a hollow iron rod into molten sand and exhaled. Glass had existed for millennia before that moment, ground and carved from cooled blocks like stone. After it, glass could be shaped by breath alone. Every vessel, every lens, every window since descends from that one exhalation.",
  },
  {
    numeral: "III",
    title: "The State",
    body: "Glass is not quite a solid. Cooled too quickly for its atoms to settle into the ordered lattice of a crystal, it holds the disarray of the liquid it used to be — a structure caught in the act of becoming something else, and stopped there. It is the only material we make by refusing to let it finish.",
  },
  {
    numeral: "IV",
    title: "The Inheritance",
    body: "We make one key. The key that means stop, withdraw, begin again — cast in the oldest material that still remembers the fire it came from. It is a small object. It is also two thousand years of breath, sand and patience, resting under a fingertip.",
  },
];

export function Origin() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      // each chapter rises and settles, with its numeral drifting slower
      root.current!.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll("[data-line]"),
          { opacity: 0, y: 34, filter: "blur(9px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "power3.out",
            stagger: 0.14,
            scrollTrigger: { trigger: el, start: "top 76%", once: true },
          }
        );

        const numeral = el.querySelector("[data-numeral]");
        if (numeral) {
          gsap.to(numeral, {
            yPercent: -34,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        }
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="origin" className="px-7 sm:px-12">
      <div className="mx-auto max-w-5xl py-28 sm:py-40">
        <Reveal>
          <p data-r className="label-caps mb-8">
            Origin
          </p>
          <h2
            data-r
            className="display-serif max-w-2xl text-[clamp(1.9rem,4.4vw,2.9rem)] font-medium leading-[1.14] tracking-[-0.015em] text-platinum"
          >
            Glass is the oldest thing we make that still{" "}
            <em className="font-normal italic text-silver">remembers light</em>.
          </h2>
        </Reveal>

        <div className="mt-24 flex flex-col gap-28 sm:gap-36">
          {CHAPTERS.map((c) => (
            <article
              key={c.numeral}
              data-chapter
              className="grid gap-6 sm:grid-cols-[110px_1fr] sm:gap-14"
            >
              <div
                data-numeral
                className="display-serif select-none text-[3.4rem] leading-none text-platinum/25 sm:text-[4.6rem]"
                aria-hidden
              >
                {c.numeral}
              </div>
              <div className="max-w-2xl">
                <h3
                  data-line
                  className="display-serif text-[1.6rem] font-medium text-platinum sm:text-[2rem]"
                >
                  {c.title}
                </h3>
                <p data-line className="body-copy mt-4 text-[1rem] sm:text-[1.05rem]">
                  {c.lead && (
                    <em className="not-italic font-medium text-silver">
                      <i className="italic">{c.lead}</i>
                    </em>
                  )}
                  {c.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Rule />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. THE MAKING                                                       */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    n: "01",
    title: "Cast",
    body: "Lead-free optical crystal is brought to 1,400°C and hand-poured into a single-use mould. One pour yields one cap; the mould is destroyed with it.",
  },
  {
    n: "02",
    title: "Anneal",
    body: "Each piece cools for eleven days in a descending kiln. Rushed glass carries stress and shatters in the hand — patience is the only cure.",
  },
  {
    n: "03",
    title: "Polish",
    body: "Nine grades of abrasive, finishing with cerium oxide on felt. The stem is cut last, to Cherry MX tolerance, under magnification.",
  },
];

export function Making() {
  return (
    <section className="px-7 sm:px-12">
      <Reveal className="mx-auto max-w-6xl py-24 sm:py-32">
        <p data-r className="label-caps mb-14">
          The Making
        </p>
        <div className="grid gap-14 md:grid-cols-3 md:gap-10">
          {STEPS.map((s) => (
            <div key={s.n} data-r className="flex flex-col">
              <span className="label-caps !tracking-[0.24em] text-platinum">
                {s.n}
              </span>
              <h3 className="display-serif mt-4 text-[1.5rem] font-medium text-platinum">
                {s.title}
              </h3>
              <p className="body-copy mt-3 text-[0.94rem]">{s.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Rule />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. SPECIFICATION                                                    */
/* ------------------------------------------------------------------ */
const SPEC: [string, string][] = [
  ["Material", "Lead-free optical crystal"],
  ["Profile", "OEM R1 — escape row"],
  ["Stem", "Cherry MX cross, cut by hand"],
  ["Mass", "11.4 g"],
  ["Legend", "Sub-surface laser, 0.2 mm depth"],
  ["Edition", "One hundred pieces, numbered"],
];

export function Specification() {
  return (
    <section className="px-7 py-24 sm:px-12 sm:py-32">
      <Reveal className="mx-auto max-w-3xl" stagger={0.06}>
        <p data-r className="label-caps mb-12">
          Specification
        </p>
        <dl className="flex flex-col">
          {SPEC.map(([k, v]) => (
            <div
              key={k}
              data-r
              className="group flex items-baseline justify-between gap-6 border-b border-white/12 py-5 transition-colors duration-300 hover:border-white/30"
            >
              <dt className="label-caps !tracking-[0.18em]">{k}</dt>
              <dd className="text-right text-[0.98rem] font-normal text-platinum">
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <p data-r className="body-copy mt-10 text-[0.85rem]">
          Specifications are provisional until the edition is sealed. Price will
          be disclosed to the list before it is published.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. WAITLIST                                                         */
/* ------------------------------------------------------------------ */
export function Waitlist() {
  return (
    <section id="waitlist" className="relative px-7 sm:px-12">
      <Rule />
      <Reveal className="mx-auto flex max-w-6xl flex-col gap-14 py-24 sm:py-36 md:flex-row md:items-start md:justify-between md:gap-24">
        <div className="md:max-w-sm">
          <p data-r className="label-caps mb-6">
            The List
          </p>
          <h2
            data-r
            className="display-serif text-[clamp(1.9rem,4vw,2.7rem)] font-medium leading-[1.12] tracking-[-0.015em] text-platinum"
          >
            One hundred pieces.
            <br />
            <em className="font-normal italic text-silver">By invitation.</em>
          </h2>
          <p data-r className="body-copy mt-5 max-w-sm text-[0.95rem]">
            The First Edition will not be sold publicly. Those on the list are
            written to first, and are given the week before release to reserve.
          </p>
        </div>

        <div data-r className="w-full md:max-w-md">
          <WaitlistForm kind="WAITLIST" />
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. FOOTER                                                           */
/* ------------------------------------------------------------------ */
export function SiteFooter() {
  return (
    <footer className="px-7 sm:px-12">
      <Rule />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <span className="label-caps !tracking-[0.42em] text-platinum">
          Vitrous
        </span>
        <span className="label-caps">
          © MMXXVI — from the Latin <em className="italic">vitrum</em>, glass
        </span>
      </div>
    </footer>
  );
}
