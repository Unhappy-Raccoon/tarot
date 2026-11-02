type Environment = Readonly<Record<string, string | undefined>>;

function isHttpsUrl(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Strict checks apply only to production; local preview remains optional. */
export function getRuntimeConfigurationIssues(env: Environment = process.env): string[] {
  if (env.NODE_ENV !== "production") return [];
  const issues: string[] = [];
  const required = [
    "DATABASE_URL", "TELEGRAM_BOT_TOKEN", "SESSION_SECRET",
    "TELEGRAM_WEBAPP_URL", "WEBAPP_ORIGIN", "AI_API_KEY", "AI_MODEL",
  ] as const;

  for (const name of required) {
    if (!env[name]?.trim()) issues.push(`${name} is required`);
  }
  if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32) {
    issues.push("SESSION_SECRET must contain at least 32 characters");
  }

  if (env.DATABASE_URL) {
    try {
      const databaseUrl = new URL(env.DATABASE_URL);
      if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
          !databaseUrl.hostname || !databaseUrl.pathname || databaseUrl.pathname === "/") {
        issues.push("DATABASE_URL must be a PostgreSQL connection URL with a database name");
      }
    } catch {
      issues.push("DATABASE_URL must be a valid PostgreSQL connection URL");
    }
  }

  const webAppUrl = isHttpsUrl(env.TELEGRAM_WEBAPP_URL);
  if (env.TELEGRAM_WEBAPP_URL && !webAppUrl) {
    issues.push("TELEGRAM_WEBAPP_URL must be a valid HTTPS URL");
  }

  let originUrl: URL | null = null;
  if (env.WEBAPP_ORIGIN) {
    originUrl = isHttpsUrl(env.WEBAPP_ORIGIN);
    if (!originUrl || originUrl.origin !== env.WEBAPP_ORIGIN) {
      issues.push("WEBAPP_ORIGIN must be an HTTPS origin without a path or trailing slash");
    }
  }
  if (webAppUrl && originUrl && webAppUrl.origin !== originUrl.origin) {
    issues.push("WEBAPP_ORIGIN must match the origin of TELEGRAM_WEBAPP_URL");
  }

  const provider = (env.AI_PROVIDER || "openai").trim().toLowerCase();
  if (provider !== "openai") issues.push("AI_PROVIDER must be openai for this test launch");
  if (!isHttpsUrl(env.AI_BASE_URL || "https://api.openai.com/v1")) {
    issues.push("AI_BASE_URL must be a valid HTTPS URL");
  }
  return issues;
}

export function assertRuntimeConfiguration(env: Environment = process.env): void {
  const issues = getRuntimeConfigurationIssues(env);
  if (issues.length) {
    throw new Error(`Invalid production configuration:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  }
}
