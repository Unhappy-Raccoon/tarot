import process from "node:process";

type DenoRuntimeLike = {
  env: {
    get(name: string): string | undefined;
  };
};

export type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

/**
 * Read hosted Supabase secrets directly from Deno.env. The Edge Runtime does not
 * allow applications to mutate process.env, so runtime configuration must remain
 * read-only. Local Node.js development falls back to process.env.
 */
export function getRuntimeEnv(name: string): string | undefined {
  const deno = (globalThis as typeof globalThis & {
    Deno?: DenoRuntimeLike;
  }).Deno;

  if (deno?.env) {
    try {
      const value = deno.env.get(name);
      if (value !== undefined) return value;
    } catch {
      // Fall back to Node.js environment below when Deno env access is unavailable.
    }

    // Supabase Edge Functions are always production deployments. Some hosted
    // runtimes do not define NODE_ENV, so treat it as production when absent.
    if (name === "NODE_ENV") return "production";
  }

  return process.env[name];
}

/** Read-only environment view for validators that expect an env-like object. */
export function getRuntimeEnvironment(): RuntimeEnvironment {
  return new Proxy(Object.create(null) as Record<string, string | undefined>, {
    get(_target, property) {
      return typeof property === "string" ? getRuntimeEnv(property) : undefined;
    },
  });
}
