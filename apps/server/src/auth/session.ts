import { createHmac, timingSafeEqual } from "node:crypto";

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function createSessionToken(
  telegramId: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const payload: SessionPayload = {
    sub: telegramId,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string | null {
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra !== undefined) return null;

  const expected = createHmac("sha256", secret)
    .update(encoded)
    .digest();
  const actual = Buffer.from(suppliedSignature, "base64url");

  if (
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= nowSeconds
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}
