import Fuse from "fuse.js";
import { DateTime, IANAZone } from "luxon";
import { cities } from "../data/cities.js";
import { loadConfig } from "./config.js";
import { countryFlag } from "./flags.js";
import { getAbbreviation } from "./timezone.js";
import type { City } from "../types/index.js";

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

export interface RenderOptions {
  wide?: boolean;
  matchedFrom?: string;
  zone?: string;
}

// Compact rows must stay within ~32 monospace columns so a code block
// survives phone-width chat clients unwrapped. The city column is capped
// at COMPACT_CITY_WIDTH; a `short` config field skips truncation.
const COMPACT_CITY_WIDTH = 12;

function compactCityLabel(city: City): string {
  if (city.short) return city.short;
  return city.name.length > COMPACT_CITY_WIDTH
    ? city.name.slice(0, COMPACT_CITY_WIDTH)
    : city.name;
}

/**
 * Render the lookup as lines (including the ``` fences). Compact by
 * default; `wide` restores the full layout with zone abbreviations and
 * ISO dates per row.
 */
export function renderLookup(
  ref: DateTime,
  configCities: City[],
  opts: RenderOptions = {},
): string[] {
  // Furthest in the future (largest UTC offset) first.
  const sorted = [...configCities].sort(
    (a, b) => ref.setZone(b.timezone).offset - ref.setZone(a.timezone).offset,
  );
  const zoned = sorted.map((c) => ref.setZone(c.timezone));
  const matched = opts.matchedFrom
    ? `(${opts.matchedFrom} → ${opts.zone})`
    : "";

  const lines: string[] = ["```"];

  if (opts.wide) {
    lines.push(
      `${ref.toFormat("HH:mm")} ${getAbbreviation(ref)} — ${ref.toFormat("ccc yyyy-MM-dd")}${matched ? `  ${matched}` : ""}`,
    );
    lines.push("");
    const nameWidth = Math.max(...sorted.map((c) => c.name.length));
    const abbrWidth = Math.max(...zoned.map((z) => getAbbreviation(z).length));
    sorted.forEach((city, i) => {
      const z = zoned[i]!;
      lines.push(
        `${countryFlag(city.country)} ${city.name.padEnd(nameWidth)}  ${getAbbreviation(z).padEnd(abbrWidth)}  ${z.toFormat("HH:mm")}  ${z.toFormat("ccc yyyy-MM-dd")}`,
      );
    });
  } else {
    lines.push(
      `${ref.toFormat("ccc d MMM yyyy")}, ${ref.toFormat("HH:mm")} ${getAbbreviation(ref)}`,
    );
    if (matched) lines.push(matched);
    lines.push("");
    const labels = sorted.map(compactCityLabel);
    const cityWidth = Math.min(
      COMPACT_CITY_WIDTH,
      Math.max(...labels.map((l) => l.length)),
    );
    const days = zoned.map((z) => z.toFormat("ccc d"));
    const dayWidth = Math.max(...days.map((d) => d.length));
    sorted.forEach((city, i) => {
      lines.push(
        `${countryFlag(city.country)} ${labels[i]!.padEnd(cityWidth)}  ${days[i]!.padEnd(dayWidth)} ${zoned[i]!.toFormat("HH:mm")}`,
      );
    });
  }

  lines.push("```");
  return lines;
}

/**
 * Print the configured cities' local times for a given time of day
 * (or "now"). Returns a process exit code.
 */
export function runPrintMode(
  positional: string[],
  flags: { wide?: boolean } = {},
): number {
  const timeArg = positional[0]!;
  const isNow = timeArg.toLowerCase() === "now";
  const parsed = isNow ? null : parseTimeArg(timeArg);
  if (!isNow && !parsed) {
    console.error(
      `Invalid time: "${positional[0]}" (expected e.g. 0700, 07:00, 7pm, now)`,
    );
    return 1;
  }

  const zoneQuery = positional.slice(1).join(" ") || "UTC";
  const resolved = resolveZone(zoneQuery);
  if (!resolved) {
    console.error(`Unknown timezone: "${zoneQuery}"`);
    return 1;
  }

  let ref = DateTime.now().setZone(resolved.zone);
  if (parsed) {
    ref = ref.set({
      hour: parsed.hour,
      minute: parsed.minute,
      second: 0,
      millisecond: 0,
    });
  }
  if (!ref.isValid) {
    console.error(`Unknown timezone: "${zoneQuery}"`);
    return 1;
  }

  const config = loadConfig();
  const lines = renderLookup(ref, config.cities, {
    wide: flags.wide,
    matchedFrom: resolved.matchedFrom,
    zone: resolved.zone,
  });
  console.log(lines.join("\n"));
  return 0;
}
