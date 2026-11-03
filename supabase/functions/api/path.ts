/**
 * Supabase's gateway strips /functions/v1 before invoking an Edge Function,
 * but leaves the function name as the first path segment. Some local/test
 * invocations may still include the complete function prefix.
 */
export function normalizeApiPath(pathname: string): string {
  const fullFunctionPrefix = "/functions/v1/api";
  if (pathname === fullFunctionPrefix || pathname.startsWith(`${fullFunctionPrefix}/`)) {
    return pathname.slice(fullFunctionPrefix.length) || "/";
  }

  if (pathname === "/api") return "/";
  if (pathname.startsWith("/api/")) return pathname.slice("/api".length);

  return pathname || "/";
}
