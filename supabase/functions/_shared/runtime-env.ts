export function hydrateNodeEnvironment(
  processLike: { env: Record<string, string | undefined> },
  keys: readonly string[],
): void {
  for (const key of keys) {
    const value = Deno.env.get(key);
    if (value !== undefined) processLike.env[key] = value;
  }
}
