import { normalizeApiPath } from "./path.ts";

function assertEquals(actual: string, expected: string): void {
  if (actual !== expected) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

Deno.test("strips the Supabase internal function-name prefix", () => {
  assertEquals(normalizeApiPath("/api/health"), "/health");
  assertEquals(normalizeApiPath("/api/api/tarot/spreads"), "/api/tarot/spreads");
  assertEquals(normalizeApiPath("/api"), "/");
});

Deno.test("strips a full function URL prefix when present", () => {
  assertEquals(normalizeApiPath("/functions/v1/api/health"), "/health");
  assertEquals(normalizeApiPath("/functions/v1/api/api/tarot/spreads"), "/api/tarot/spreads");
});

Deno.test("preserves routes that have no Supabase function prefix", () => {
  assertEquals(normalizeApiPath("/health"), "/health");
  assertEquals(normalizeApiPath("/apiary/health"), "/apiary/health");
});
