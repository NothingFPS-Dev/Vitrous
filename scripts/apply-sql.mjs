/**
 * Applies a .sql file to the linked Supabase project via the Management API.
 *
 *   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... \
 *     node scripts/apply-sql.mjs supabase/002_commissions.sql
 *
 * The token is read from the environment and never written to disk.
 */
import { readFile } from "node:fs/promises";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;
const file = process.argv[2];

if (!token || !ref || !file) {
  console.error(
    "Usage: SUPABASE_ACCESS_TOKEN=… SUPABASE_PROJECT_REF=… node scripts/apply-sql.mjs <file.sql>"
  );
  process.exit(1);
}

const query = await readFile(file, "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }
);

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}\n${text.slice(0, 600)}`);
  process.exit(1);
}
console.log(`✓ applied ${file}`);
console.log(text.slice(0, 300));
