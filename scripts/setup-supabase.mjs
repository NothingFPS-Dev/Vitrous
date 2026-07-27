/**
 * One-shot Supabase setup.
 *
 *   node scripts/setup-supabase.mjs <PERSONAL_ACCESS_TOKEN> [PROJECT_REF]
 *
 * - finds your project (or uses the ref you pass)
 * - runs supabase/schema.sql against it
 * - fetches the project URL + anon key
 * - writes .env.local
 *
 * The token is used for this run only. It is never written to disk.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const API = "https://api.supabase.com/v1";
const [argToken, argRef] = process.argv.slice(2);

// Prefer the env var so the token doesn't end up in shell history.
const token = process.env.SUPABASE_ACCESS_TOKEN || argToken;
const refArg = process.env.SUPABASE_PROJECT_REF || argRef;

if (!token) {
  console.error(
    "Set SUPABASE_ACCESS_TOKEN, or: node scripts/setup-supabase.mjs <TOKEN> [REF]"
  );
  process.exit(1);
}

const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: h });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} → ${res.status}\n${
        typeof body === "string" ? body : JSON.stringify(body, null, 2)
      }`
    );
  }
  return body;
}

// ---- 1. pick the project -------------------------------------------------
let ref = refArg;
const projects = await api("/projects");

if (!ref) {
  if (!projects.length) {
    console.error("No projects on this account.");
    process.exit(1);
  }
  // newest first
  const sorted = [...projects].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  ref = sorted[0].id;
  console.log(
    `Projects found:\n` +
      projects.map((p) => `   ${p.id}  ${p.name}  (${p.region})`).join("\n")
  );
  console.log(`\nUsing newest: ${sorted[0].name} (${ref})\n`);
}

const project = projects.find((p) => p.id === ref);
if (!project) {
  console.error(`Project ${ref} not found on this account.`);
  process.exit(1);
}
if (project.status !== "ACTIVE_HEALTHY") {
  console.log(`  note: project status is ${project.status} — continuing anyway`);
}

// ---- 2. run the schema ---------------------------------------------------
const sqlPath = "supabase/schema.sql";
if (!existsSync(sqlPath)) {
  console.error(`Missing ${sqlPath}`);
  process.exit(1);
}
const query = await readFile(sqlPath, "utf8");

console.log("Running schema.sql …");
await api(`/projects/${ref}/database/query`, {
  method: "POST",
  body: JSON.stringify({ query }),
});
console.log("  ✓ schema applied");

// ---- 3. verify ------------------------------------------------------------
const check = await api(`/projects/${ref}/database/query`, {
  method: "POST",
  body: JSON.stringify({
    query: `
      select
        (select count(*) from information_schema.tables
           where table_schema='public' and table_name='signups') as signups_table,
        (select count(*) from pg_policies
           where tablename='signups') as policies,
        (select count(*) from storage.buckets
           where id='vitrous-assets') as bucket;
    `,
  }),
});
console.log("  ✓ verified:", JSON.stringify(check));

// ---- 4. keys --------------------------------------------------------------
const keys = await api(`/projects/${ref}/api-keys`);
const anon = keys.find((k) => k.name === "anon" || k.type === "anon")?.api_key;
if (!anon) {
  console.error("Could not read the anon key. Keys returned:", keys.map((k) => k.name));
  process.exit(1);
}

const url = `https://${ref}.supabase.co`;

// ---- 5. write .env.local --------------------------------------------------
const env =
  `# Written by scripts/setup-supabase.mjs\n` +
  `NEXT_PUBLIC_SUPABASE_URL=${url}\n` +
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}\n`;
await writeFile(".env.local", env, "utf8");

console.log(`\n  ✓ .env.local written`);
console.log(`    NEXT_PUBLIC_SUPABASE_URL=${url}`);
console.log(`    NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon.slice(0, 12)}…(hidden)`);
console.log(`\nDone. Restart the dev server.\n`);
