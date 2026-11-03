import process from "node:process";
import { hydrateNodeEnvironment } from "../_shared/runtime-env.ts";

const ENV_KEYS = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "SESSION_SECRET",
  "TELEGRAM_WEBAPP_URL",
  "WEBAPP_ORIGIN",
  "AI_PROVIDER",
  "AI_API_KEY",
  "AI_MODEL",
  "AI_BASE_URL",
  "AI_FREE_DAILY_LIMIT",
  "AI_PREMIUM_DAILY_LIMIT",
  "AI_MAX_INPUT_CHARS",
  "AI_MAX_HISTORY_MESSAGES",
  "AI_MAX_OUTPUT_TOKENS",
  "AI_REQUEST_TIMEOUT_MS",
  "HOROSCOPE_DEFAULT_TIME_ZONE",
  "LOG_LEVEL",
  "DATABASE_POOL_MAX",
] as const;

type FastifyApp = {
  ready(): PromiseLike<unknown>;
  inject(options: {
    method: string;
    url: string;
    headers: Record<string, string>;
    payload?: string;
  }): Promise<{
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: string;
  }>;
};

function safeDiagnostic(value: string): string {
  return value
    .replace(/postgres(?:ql)?:\/\/[^\s"'\x60]+/gi, "[redacted database URL]")
    .replace(/Bearer\s+[^\s"'\x60]+/gi, "Bearer [redacted]")
    .replace(/\b(?:sk|rk|sbp|eyJ)[A-Za-z0-9._-]{12,}\b/g, "[redacted credential]")
    .replace(/(token|secret|password|api[_-]?key)\s*[:=]\s*[^,\s]+/gi, "$1=[redacted]")
    .slice(0, 1200);
}

let appPromise: Promise<FastifyApp> | null = null;

async function getApp(): Promise<FastifyApp> {
  if (!appPromise) {
    appPromise = (async () => {
      hydrateNodeEnvironment(process, ENV_KEYS);
      const [{ buildApp }] = await Promise.all([
        import("../_shared/server/app.js"),
      ]);
      const app = buildApp({
        botToken: Deno.env.get("TELEGRAM_BOT_TOKEN"),
        sessionSecret: Deno.env.get("SESSION_SECRET"),
        webAppOrigin: Deno.env.get("WEBAPP_ORIGIN"),
      }) as FastifyApp;
      await app.ready();
      return app;
    })().catch((error) => {
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const configuredOrigin = Deno.env.get("WEBAPP_ORIGIN");
    if (!origin || !configuredOrigin || origin !== configuredOrigin) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": configuredOrigin,
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
        "access-control-max-age": "86400",
        vary: "Origin",
      },
    });
  }

  try {
    const app = await getApp();
    const url = new URL(request.url);
    const functionPrefix = "/functions/v1/api";
    const routePath = url.pathname.startsWith(functionPrefix)
      ? (url.pathname.slice(functionPrefix.length) || "/")
      : url.pathname;
    const payload = request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();
    const injected = await app.inject({
      method: request.method,
      url: `${routePath}${url.search}`,
      headers: Object.fromEntries(request.headers.entries()),
      ...(payload !== undefined ? { payload } : {}),
    });

    const headers = new Headers();
    for (const [name, value] of Object.entries(injected.headers)) {
      if (typeof value === "string") headers.set(name, value);
      else if (Array.isArray(value)) {
        for (const item of value) headers.append(name, item);
      }
    }
    return new Response(injected.body, {
      status: injected.statusCode,
      headers,
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "unknown";
    const errorMessage = error instanceof Error
      ? safeDiagnostic(error.message)
      : safeDiagnostic(String(error));
    const errorStack = error instanceof Error && error.stack
      ? safeDiagnostic(error.stack.split("\n").slice(0, 5).join("\n"))
      : "no stack";
    console.error("Supabase API invocation failed", errorName, errorMessage, errorStack);
    return Response.json({ error: "service_unavailable" }, { status: 503 });
  }
});
