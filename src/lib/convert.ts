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

export interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

export interface DateMatch {
  date: ParsedDate;
  consumed: number;
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

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function monthNumber(token: string): number | null {
  if (token.length < 3) return null;
  const i = MONTHS.findIndex((m) => m.startsWith(token));
  return i === -1 ? null : i + 1;
}

function weekdayNumber(token: string): number | null {
  if (token.length < 3) return null;
  const i = WEEKDAYS.findIndex((d) => d.startsWith(token));
  return i === -1 ? null : i + 1;
}

function fromDateTime(dt: DateTime): ParsedDate {
  return { year: dt.year, month: dt.month, day: dt.day };
}

function validate(date: ParsedDate): ParsedDate | null {
  return DateTime.fromObject(date).isValid ? date : null;
}

function withDay(
  month: number,
  dayToken: string | undefined,
  yearToken: string | undefined,
  now: DateTime,
): DateMatch | null {
  if (!dayToken || !/^\d{1,2}$/.test(dayToken)) return null;
  const year = yearToken && /^\d{4}$/.test(yearToken) ? Number(yearToken) : null;
  const date = validate({
    year: year ?? now.year,
    month,
    day: Number(dayToken),
  });
  return date ? { date, consumed: year ? 3 : 2 } : null;
}

/**
 * Parse a date from the front of `tokens`: "2026-09-15", "09-15", "15sep",
 * "sep 15 2026", "today", "tomorrow", "yesterday", a weekday name (the next
 * such day, today included), or a "+3d" / "-2w" offset. Returns how many
 * tokens were consumed so the caller can keep scanning.
 */
export function parseDateArg(
  tokens: string[],
  now: DateTime,
): DateMatch | null {
  const token = tokens[0]?.toLowerCase();
  if (!token) return null;

  const shift = (days: number): DateMatch => ({
    date: fromDateTime(now.plus({ days })),
    consumed: 1,
  });

  if (token === "today") return shift(0);
  if (token === "tomorrow" || token === "tmr" || token === "tmrw")
    return shift(1);
  if (token === "yesterday") return shift(-1);

  const offset = token.match(/^([+-])(\d{1,3})([dw])$/);
  if (offset) {
    const n = Number(offset[2]) * (offset[3] === "w" ? 7 : 1);
    return shift(offset[1] === "-" ? -n : n);
  }

  const iso = token.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    const date = validate({
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    });
    return date ? { date, consumed: 1 } : null;
  }

  const monthDay = token.match(/^(\d{1,2})[-/](\d{1,2})$/);
  if (monthDay) {
    const date = validate({
      year: now.year,
      month: Number(monthDay[1]),
      day: Number(monthDay[2]),
    });
    return date ? { date, consumed: 1 } : null;
  }

  const glued = token.match(/^(\d{1,2})([a-z]{3,9})$|^([a-z]{3,9})(\d{1,2})$/);
  if (glued) {
    const month = monthNumber(glued[2] ?? glued[3]!);
    const day = glued[1] ?? glued[4]!;
    if (month) {
      const date = validate({ year: now.year, month, day: Number(day) });
      if (date) return { date, consumed: 1 };
    }
  }

  const named = monthNumber(token);
  if (named) {
    const match = withDay(named, tokens[1], tokens[2], now);
    if (match) return match;
  }

  if (/^\d{1,2}$/.test(token)) {
    const month = tokens[1] ? monthNumber(tokens[1].toLowerCase()) : null;
    if (month) {
      const match = withDay(month, token, tokens[2], now);
      if (match) return match;
    }
  }

  const weekday = weekdayNumber(token);
  if (weekday) {
    const ahead = (weekday - now.weekday + 7) % 7;
    return { date: fromDateTime(now.plus({ days: ahead })), consumed: 1 };
  }

  return null;
}

export interface LeadingArgs {
  time: ParsedTime | null;
  date: ParsedDate | null;
  zoneQuery: string;
}

/**
 * Split positional args into an optional time, an optional date (in either
 * order) and the remaining zone query. Returns null when the first token is
 * none of those.
 */
export function parseLeadingArgs(
  positional: string[],
  now: DateTime,
): LeadingArgs | null {
  let time: ParsedTime | null = null;
  let date: ParsedDate | null = null;
  let i = 0;

  while (i < positional.length) {
    const token = positional[i]!;
    if (!time && token.toLowerCase() === "now") {
      i += 1;
      continue;
    }
    if (!time) {
      const parsed = parseTimeArg(token);
      if (parsed) {
        time = parsed;
        i += 1;
        continue;
      }
    }
    if (!date) {
      const match = parseDateArg(positional.slice(i), now);
      if (match) {
        date = match.date;
        i += match.consumed;
        continue;
      }
    }
    break;
  }

  if (i === 0) return null;
  return { time, date, zoneQuery: positional.slice(i).join(" ") || "UTC" };
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
 * Print the configured cities' local times for a given time of day and/or
 * date (or "now"). Returns a process exit code.
 */
export function runPrintMode(
  positional: string[],
  flags: { wide?: boolean } = {},
): number {
  const args = parseLeadingArgs(positional, DateTime.now());
  if (!args) {
    console.error(
      `Invalid time or date: "${positional[0]}" (expected e.g. 0700, 07:00, 7pm, now, tomorrow, 2026-09-15)`,
    );
    return 1;
  }

  const resolved = resolveZone(args.zoneQuery);
  if (!resolved) {
    console.error(`Unknown timezone: "${args.zoneQuery}"`);
    return 1;
  }

  let ref = DateTime.now().setZone(resolved.zone);
  // "tomorrow" means tomorrow in the target zone.
  const { time, date } = ref.isValid ? parseLeadingArgs(positional, ref)! : args;
  if (date) {
    ref = ref.set(date);
  }
  if (time) {
    ref = ref.set({
      hour: time.hour,
      minute: time.minute,
      second: 0,
      millisecond: 0,
    });
  }
  if (!ref.isValid) {
    console.error(`Unknown timezone: "${args.zoneQuery}"`);
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
