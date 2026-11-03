import { assertEquals } from "jsr:@std/assert@1";
import { normalizeApiPath } from "./path.ts";

Deno.test("strips the Supabase internal function-name prefix", () => {
  assertEquals(normalizeApiPath("/api/health"), "/health");
  assertEquals(normalizeApiPath("/api/api/tarot/spreads"), "/api/tarot/spreads");
  assertEquals(normalizeApiPath("/api"), "/");
});

Deno.test("strips a full function URL prefix when present", () => {
  assertEquals(normalizeApiPath("/functions/v1/api/health"), "/health");
  assertEquals(normalizeApiPath("/functions/v1/api/api/tarot/spreads"), "/api/tarot/spreads");
});

Deno.test("preserves an already normalized application route", () => {
  assertEquals(normalizeApiPath("/health"), "/health");
  assertEquals(normalizeApiPath("/api/tarot/spreads"), "/api/tarot/spreads");
});

Deno.test("does not mistake a similarly named prefix for the api function", () => {
  assertEquals(normalizeApiPath("/apiary/health"), "/apiary/health");
});
