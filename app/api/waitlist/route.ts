import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const TITLES = ["MR", "MRS"] as const;
const KINDS = ["WAITLIST", "PREORDER"] as const;

type Title = (typeof TITLES)[number];
type Kind = (typeof KINDS)[number];

// Deliberately strict but not exotic — catches typos, accepts real addresses.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed request." },
      { status: 400 }
    );
  }

  const title = String(body.title ?? "").toUpperCase() as Title;
  const firstName = String(body.firstName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const kind = (
    String(body.kind ?? "WAITLIST").toUpperCase()
  ) as Kind;

  if (!TITLES.includes(title)) {
    return NextResponse.json(
      { error: "Please select a title." },
      { status: 400 }
    );
  }
  if (firstName.length < 1 || firstName.length > 80) {
    return NextResponse.json(
      { error: "Please enter your first name." },
      { status: 400 }
    );
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 }
    );
  }
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: "Unknown request." }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured) {
    // Keys not added yet — say so honestly rather than pretending it worked.
    return NextResponse.json(
      {
        error:
          "The list isn't open just yet. Please try again shortly.",
        reason: "supabase_not_configured",
      },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("signups").insert({
    title,
    first_name: firstName,
    email,
    kind,
    source: "web",
    user_agent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
  });

  if (error) {
    // 23505 = unique violation: they're already on the list.
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: true, already: true },
        { status: 200 }
      );
    }
    console.error("[waitlist] insert failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't add you just now. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, already: false }, { status: 201 });
}
