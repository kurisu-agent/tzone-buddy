/**
 * Convert an ISO 3166-1 alpha-2 country code to its flag emoji via
 * regional indicator symbols. Returns "" for anything else.
 */
export function countryFlag(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
