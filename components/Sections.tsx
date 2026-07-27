"use client";

import Reveal from "./Reveal";
import WaitlistForm from "./WaitlistForm";

function Rule() {
  return <div className="hairline" />;
}

/* ------------------------------------------------------------------ */
/* Manifesto                                                           */
/* ------------------------------------------------------------------ */
export function Manifesto() {
  return (
    <section className="px-7 py-28 sm:px-12 sm:py-40">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p data-r className="label-caps mb-8">
          Nº 001 — The First Edition
        </p>
        <p
          data-r
          className="display-serif text-[clamp(1.5rem,3.4vw,2.4rem)] font-normal leading-[1.32] tracking-[-0.01em] text-platinum"
        >
          A keyboard is touched more than any other object a person owns, and
          almost none of it is made to be looked at. We began with the one key
          that means <em className="italic text-silver">stop</em> — and cast it
          in optical glass.
        </p>
        <p
          data-r
          className="mx-auto mt-8 max-w-xl text-[0.95rem] font-light leading-7 text-smoke"
        >
          Vitrous is a two-person atelier. We do not manufacture. We pour, cool,
          grind and polish each cap by hand, and we sign the run when it is
          finished.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The making — three movements                                        */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    n: "I",
    title: "Cast",
    body: "Lead-free optical crystal is brought to 1,400°C and hand-poured into a single-use mould. One pour yields one cap; the mould is destroyed with it.",
  },
  {
    n: "II",
    title: "Anneal",
    body: "Each piece cools for eleven days in a descending kiln. Rushed glass carries stress and shatters in the hand — patience is the only cure.",
  },
  {
    n: "III",
    title: "Polish",
    body: "Nine grades of abrasive, finishing with cerium oxide on felt. The stem is cut last, to Cherry MX tolerance, under magnification.",
  },
];

export function Making() {
  return (
    <section className="px-7 sm:px-12">
      <Rule />
      <Reveal className="mx-auto max-w-6xl py-24 sm:py-32">
        <p data-r className="label-caps mb-14">
          The Making
        </p>
        <div className="grid gap-14 md:grid-cols-3 md:gap-10">
          {STEPS.map((s) => (
            <div key={s.n} data-r className="flex flex-col">
              <span className="display-serif text-[2.6rem] leading-none text-white/18">
                {s.n}
              </span>
              <h3 className="display-serif mt-5 text-[1.45rem] font-medium text-platinum">
                {s.title}
              </h3>
              <p className="mt-3 text-[0.9rem] font-light leading-7 text-smoke">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
      <Rule />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Specification                                                       */
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
      <Reveal className="mx-auto max-w-3xl" stagger={0.07}>
        <p data-r className="label-caps mb-12">
          Specification
        </p>
        <dl className="flex flex-col">
          {SPEC.map(([k, v]) => (
            <div
              key={k}
              data-r
              className="flex items-baseline justify-between gap-6 border-b border-white/8 py-5"
            >
              <dt className="label-caps !tracking-[0.18em] !text-smoke">{k}</dt>
              <dd className="text-right text-[0.95rem] font-light text-platinum">
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <p data-r className="mt-10 text-[0.82rem] font-light leading-6 text-smoke">
          Specifications are provisional until the edition is sealed. Price will
          be disclosed to the list before it is published.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Waitlist                                                            */
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
            className="display-serif text-[clamp(1.9rem,4vw,2.7rem)] font-medium leading-[1.12] tracking-[-0.015em]"
          >
            One hundred pieces.
            <br />
            <em className="italic text-silver">By invitation.</em>
          </h2>
          <p
            data-r
            className="mt-5 max-w-sm text-[0.92rem] font-light leading-7 text-smoke"
          >
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
/* Footer                                                              */
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
          © MMXXVI — Glass keycaps, cast one at a time
        </span>
      </div>
    </footer>
  );
}
