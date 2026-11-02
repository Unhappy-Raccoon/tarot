import { assertEquals } from "jsr:@std/assert@1.0.14";
import { constantTimeEquals, hasValidSecretHeader } from "./security.ts";

Deno.test("constantTimeEquals accepts matching secrets", () => {
  assertEquals(constantTimeEquals("secret-123", "secret-123"), true);
});

Deno.test("constantTimeEquals rejects different lengths and contents", () => {
  assertEquals(constantTimeEquals("secret", "secret-long"), false);
  assertEquals(constantTimeEquals("secret-a", "secret-b"), false);
});

Deno.test("hasValidSecretHeader rejects missing secrets and validates a header", () => {
  const request = new Request("https://example.test", {
    headers: { "x-cron-secret": "cron-test-secret" },
  });
  assertEquals(hasValidSecretHeader(request, "x-cron-secret", "cron-test-secret"), true);
  assertEquals(hasValidSecretHeader(request, "x-cron-secret", "wrong"), false);
  assertEquals(hasValidSecretHeader(request, "x-missing-secret", "cron-test-secret"), false);
  assertEquals(hasValidSecretHeader(request, "x-cron-secret", ""), false);
});
