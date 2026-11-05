export function isValidIanaTimeZone(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return true;

  try {
    new Intl.DateTimeFormat("en", { timeZone: normalized }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

export function getDeviceTimeZone(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return isValidIanaTimeZone(timeZone) ? timeZone : "";
  } catch {
    return "";
  }
}

export function invalidTimeZoneMessage(value: string): string {
  return `«${value.trim()}» не является корректным часовым поясом IANA. Укажи, например, Europe/Tallinn, или очисти поле, если точный пояс неизвестен.`;
}
