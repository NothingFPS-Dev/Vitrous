import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True once both env vars are present. The site is designed to build and
 * deploy *before* Supabase is connected — every call site checks this first
 * so a missing key degrades to a friendly message instead of a crash.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url!, anonKey!, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

/** Storage bucket that holds product imagery. */
export const ASSET_BUCKET = "vitrous-assets";

/**
 * Public URL for a file in the assets bucket.
 *
 * Serving from Storage is opt-in: it only kicks in once the URL is set *and*
 * NEXT_PUBLIC_USE_STORAGE_ASSETS=true, i.e. after you've actually run
 * `node scripts/upload-assets.mjs`. Until then every image comes from /public,
 * so the hero can never 404 because of a half-finished setup.
 */
export function assetUrl(objectPath: string, fallback: string): string {
  const useStorage = process.env.NEXT_PUBLIC_USE_STORAGE_ASSETS === "true";
  if (!url || !useStorage) return fallback;
  return `${url}/storage/v1/object/public/${ASSET_BUCKET}/${objectPath}`;
}
