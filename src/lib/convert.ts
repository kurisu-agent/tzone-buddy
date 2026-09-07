import Fuse from "fuse.js";
import { DateTime, IANAZone } from "luxon";
import { cities } from "../data/cities.js";
import { loadConfig } from "./config.js";
import { getAbbreviation } from "./timezone.js";

export interface ParsedTime {
  hour: number;
  minute: number;
}

export interface ResolvedZone {
  zone: string;
  matchedFrom?: string;
}

/**
 * Parse a time argument: "0700", "700", "7", "07:00", "7:30", "7pm", "7:30am".
 */
export function parseTimeArg(arg: string): ParsedTime | null {
  const m = arg
    .toLowerCase()
    .match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$|^(\d{1,4})\s*(am|pm)?$/);
  if (!m) return null;

  let hour: number;
  let minute: number;
  const meridiem = m[3] || m[5];

  if (m[1] !== undefined) {
    hour = Number(m[1]);
    minute = Number(m[2]);
  } else {
    const digits = m[4]!;
    if (digits.length <= 2) {
      hour = Number(digits);
      minute = 0;
    } else {
      hour = Number(digits.slice(0, -2));
      minute = Number(digits.slice(-2));
    }
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  }

  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Resolve a zone argument to an IANA timezone. Exact IANA names (including
 * aliases like "Japan" and "UTC") win; anything else is fuzzy-matched against
 * the city list by city name, country name, or timezone.
 */
export function resolveZone(query: string): ResolvedZone | null {
  if (IANAZone.isValidZone(query)) {
    return { zone: query };
  }

  const entries = cities.map((c) => ({
    city: c.name,
    country: countryName(c.country),
    timezone: c.timezone,
  }));
  const fuse = new Fuse(entries, {
    keys: ["city", "country", "timezone"],
    threshold: 0.4,
  });
  const results = fuse.search(query, { limit: 1 });
  if (results.length === 0) return null;
  const best = results[0]!.item;
  return { zone: best.timezone, matchedFrom: query };
}

/**
 * Print the configured cities' local times for a given time of day.
 * Returns a process exit code.
 */
export function runPrintMode(positional: string[]): number {
  const parsed = parseTimeArg(positional[0]!);
  if (!parsed) {
    console.error(
      `Invalid time: "${positional[0]}" (expected e.g. 0700, 07:00, 7pm)`,
    );
    return 1;
  }

  const zoneQuery = positional.slice(1).join(" ") || "UTC";
  const resolved = resolveZone(zoneQuery);
  if (!resolved) {
    console.error(`Unknown timezone: "${zoneQuery}"`);
    return 1;
  }

  const ref = DateTime.now()
    .setZone(resolved.zone)
    .set({ hour: parsed.hour, minute: parsed.minute, second: 0, millisecond: 0 });
  if (!ref.isValid) {
    console.error(`Unknown timezone: "${zoneQuery}"`);
    return 1;
  }

  const config = loadConfig();
  const matched = resolved.matchedFrom
    ? `  (${resolved.matchedFrom} → ${resolved.zone})`
    : "";

  const lines: string[] = [];
  lines.push("");
  lines.push(
    `${ref.toFormat("HH:mm")} ${getAbbreviation(ref)} — ${ref.toFormat("ccc yyyy-MM-dd")}${matched}`,
  );
  lines.push("");

  const nameWidth = Math.max(...config.cities.map((c) => c.name.length));
  const abbrWidth = Math.max(
    ...config.cities.map((c) => getAbbreviation(ref.setZone(c.timezone)).length),
  );
  for (const city of config.cities) {
    const zoned = ref.setZone(city.timezone);
    lines.push(
      `${city.name.padEnd(nameWidth)}  ${getAbbreviation(zoned).padEnd(abbrWidth)}  ${zoned.toFormat("HH:mm")}  ${zoned.toFormat("ccc yyyy-MM-dd")}`,
    );
  }
  lines.push("");

  console.log(lines.join("\n"));
  return 0;
}
