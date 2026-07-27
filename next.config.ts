import type { NextConfig } from "next";

/**
 * Allow next/image to optimise files served from the Supabase Storage bucket.
 *
 * Parsed defensively: an env var that arrives with a BOM, stray quotes or a
 * trailing newline (easy to introduce when setting it from a shell) must not
 * take the whole build down — we just skip the remote pattern instead.
 */
function supabaseHostname(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;

  // strip BOM/whitespace and any wrapping quotes
  const cleaned = raw.trim().replace(/^﻿/, "").replace(/^["']|["']$/g, "");
  if (!cleaned) return undefined;

  try {
    return new URL(cleaned).hostname;
  } catch {
    console.warn(
      `[next.config] NEXT_PUBLIC_SUPABASE_URL is not a valid URL; ` +
        `skipping Supabase image remotePattern.`
    );
    return undefined;
  }
}

const host = supabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: host
      ? [
          {
            protocol: "https",
            hostname: host,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
