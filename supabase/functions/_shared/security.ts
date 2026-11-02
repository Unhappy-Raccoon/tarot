export function constantTimeEquals(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

export function hasValidSecretHeader(
  request: Request,
  headerName: string,
  expectedSecret: string,
): boolean {
  if (!expectedSecret) return false;
  const supplied = request.headers.get(headerName) ?? "";
  return constantTimeEquals(supplied, expectedSecret);
}
