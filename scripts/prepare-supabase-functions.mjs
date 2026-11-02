import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const source = resolve(root, "apps/server/dist");
const target = resolve(root, "supabase/functions/_shared/server");

await mkdir(resolve(root, "supabase/functions/_shared"), { recursive: true });
await rm(target, { recursive: true, force: true });
try {
  await cp(source, target, { recursive: true, errorOnExist: true });
} catch (error) {
  console.error("Unable to stage apps/server/dist for Supabase Edge Functions. Run npm run build first.");
  process.exitCode = 1;
  throw error;
}
console.log("Prepared compiled server modules inside supabase/functions/_shared/server.");
