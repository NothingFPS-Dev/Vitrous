/**
 * Uploads everything in ./public/assets-to-upload (and the hero image) into the
 * Supabase Storage bucket, then prints the public URLs.
 *
 *   node scripts/upload-assets.mjs
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * The service-role key is required because the bucket is public-read but
 * write-protected — never expose that key in the browser.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// tiny .env.local reader so this script has no extra dependencies
const envPath = path.resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const raw = await readFile(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "vitrous-assets";

if (!URL || !SERVICE_KEY) {
  console.error(
    "\n  Missing credentials.\n" +
      "  Add these to .env.local, then run again:\n\n" +
      "    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=<Settings → API Keys → service_role>\n"
  );
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
};

async function upload(localPath, remoteName) {
  const body = await readFile(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(remoteName, body, {
      contentType: MIME[ext] ?? "application/octet-stream",
      upsert: true,
      cacheControl: "31536000",
    });

  if (error) {
    console.error(`  ✗ ${remoteName} — ${error.message}`);
    return;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(remoteName);
  console.log(`  ✓ ${remoteName}\n    ${publicUrl}`);
}

console.log(`\nUploading to bucket "${BUCKET}"…\n`);

// the hero keycap
const hero = path.resolve("public/esc-key.jpg");
if (existsSync(hero)) await upload(hero, "esc-key.jpg");

// anything else dropped into public/assets-to-upload
const extra = path.resolve("public/assets-to-upload");
if (existsSync(extra)) {
  for (const f of await readdir(extra)) {
    await upload(path.join(extra, f), f);
  }
}

console.log(
  "\nDone. To serve the hero from Storage instead of /public, set:\n" +
    "  NEXT_PUBLIC_USE_STORAGE_ASSETS=true\n"
);
