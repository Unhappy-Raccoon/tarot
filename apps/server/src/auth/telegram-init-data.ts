import { createHmac, timingSafeEqual } from "node:crypto";

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidatedTelegramInitData {
  user: TelegramWebAppUser;
  authDate: number;
  queryId?: string;
}

export interface InitDataValidationOptions {
  nowSeconds?: number;
  maxAgeSeconds?: number;
  futureToleranceSeconds?: number;
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  options: InitDataValidationOptions = {},
): ValidatedTelegramInitData | null {
  if (!initData || initData.length > 10_000 || !botToken) return null;

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) return null;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest();
  const actualHash = Buffer.from(receivedHash, "hex");

  if (
    actualHash.length !== expectedHash.length ||
    !timingSafeEqual(actualHash, expectedHash)
  ) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isSafeInteger(authDate) || authDate <= 0) return null;

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxAge = options.maxAgeSeconds ?? 600;
  const futureTolerance = options.futureToleranceSeconds ?? 30;

  if (authDate > now + futureTolerance || now - authDate > maxAge) {
    return null;
  }

  const rawUser = params.get("user");
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as Partial<TelegramWebAppUser>;
    if (
      typeof user.id !== "number" ||
      !Number.isSafeInteger(user.id) ||
      typeof user.first_name !== "string" ||
      user.first_name.length === 0
    ) {
      return null;
    }

    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        ...(typeof user.last_name === "string" ? { last_name: user.last_name } : {}),
        ...(typeof user.username === "string" ? { username: user.username } : {}),
        ...(typeof user.language_code === "string"
          ? { language_code: user.language_code }
          : {}),
      },
      authDate,
      ...(params.get("query_id") ? { queryId: params.get("query_id")! } : {}),
    };
  } catch {
    return null;
  }
}
