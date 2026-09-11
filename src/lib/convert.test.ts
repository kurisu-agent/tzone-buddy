import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import {
  parseDateArg,
  parseLeadingArgs,
  parseTimeArg,
  renderLookup,
  resolveZone,
} from "./convert.js";

describe("parseTimeArg", () => {
  test("HHMM", () => {
    expect(parseTimeArg("0700")).toEqual({ hour: 7, minute: 0 });
    expect(parseTimeArg("2359")).toEqual({ hour: 23, minute: 59 });
  });

  test("HMM and bare hour", () => {
    expect(parseTimeArg("700")).toEqual({ hour: 7, minute: 0 });
    expect(parseTimeArg("7")).toEqual({ hour: 7, minute: 0 });
    expect(parseTimeArg("07")).toEqual({ hour: 7, minute: 0 });
  });

  test("colon forms", () => {
    expect(parseTimeArg("07:00")).toEqual({ hour: 7, minute: 0 });
    expect(parseTimeArg("7:30")).toEqual({ hour: 7, minute: 30 });
  });

  test("am/pm", () => {
    expect(parseTimeArg("7pm")).toEqual({ hour: 19, minute: 0 });
    expect(parseTimeArg("7:30am")).toEqual({ hour: 7, minute: 30 });
    expect(parseTimeArg("12am")).toEqual({ hour: 0, minute: 0 });
    expect(parseTimeArg("12pm")).toEqual({ hour: 12, minute: 0 });
    expect(parseTimeArg("13pm")).toBeNull();
  });

  test("invalid", () => {
    expect(parseTimeArg("2500")).toBeNull();
    expect(parseTimeArg("0790")).toBeNull();
    expect(parseTimeArg("abc")).toBeNull();
  });
});

describe("parseDateArg", () => {
  // Tuesday.
  const now = DateTime.fromISO("2026-09-08T12:00", { zone: "UTC" });
  const on = (...tokens: string[]) => parseDateArg(tokens, now);

  test("keywords", () => {
    expect(on("today")).toEqual({
      date: { year: 2026, month: 9, day: 8 },
      consumed: 1,
    });
    expect(on("tomorrow")?.date).toEqual({ year: 2026, month: 9, day: 9 });
    expect(on("yesterday")?.date).toEqual({ year: 2026, month: 9, day: 7 });
  });

  test("offsets", () => {
    expect(on("+3d")?.date).toEqual({ year: 2026, month: 9, day: 11 });
    expect(on("-1w")?.date).toEqual({ year: 2026, month: 9, day: 1 });
    expect(on("+1w")?.date).toEqual({ year: 2026, month: 9, day: 15 });
  });

  test("ISO and month-day", () => {
    expect(on("2027-01-05")?.date).toEqual({ year: 2027, month: 1, day: 5 });
    expect(on("2027/01/05")?.date).toEqual({ year: 2027, month: 1, day: 5 });
    expect(on("09-15")?.date).toEqual({ year: 2026, month: 9, day: 15 });
    expect(on("9/15")?.date).toEqual({ year: 2026, month: 9, day: 15 });
  });

  test("named months", () => {
    expect(on("15sep")).toEqual({
      date: { year: 2026, month: 9, day: 15 },
      consumed: 1,
    });
    expect(on("sep15")?.date).toEqual({ year: 2026, month: 9, day: 15 });
    expect(on("sep", "15")).toEqual({
      date: { year: 2026, month: 9, day: 15 },
      consumed: 2,
    });
    expect(on("15", "september", "2027")).toEqual({
      date: { year: 2027, month: 9, day: 15 },
      consumed: 3,
    });
  });

  test("weekdays roll forward, today included", () => {
    expect(on("tue")?.date).toEqual({ year: 2026, month: 9, day: 8 });
    expect(on("fri")?.date).toEqual({ year: 2026, month: 9, day: 11 });
    expect(on("monday")?.date).toEqual({ year: 2026, month: 9, day: 14 });
  });

  test("non-dates", () => {
    expect(on("15")).toBeNull();
    expect(on("0700")).toBeNull();
    expect(on("2026-13-01")).toBeNull();
    expect(on("sep", "31")).toBeNull();
    expect(on("tokyo")).toBeNull();
    expect(on("Thailand")).toBeNull();
  });
});

describe("parseLeadingArgs", () => {
  const now = DateTime.fromISO("2026-09-08T12:00", { zone: "UTC" });
  const on = (...tokens: string[]) => parseLeadingArgs(tokens, now);

  test("time only keeps the old behaviour", () => {
    expect(on("0700")).toEqual({
      time: { hour: 7, minute: 0 },
      date: null,
      zoneQuery: "UTC",
    });
    expect(on("7:30pm", "Japan")?.zoneQuery).toBe("Japan");
    expect(on("now")).toEqual({ time: null, date: null, zoneQuery: "UTC" });
  });

  test("date in either order", () => {
    const expected = {
      time: { hour: 7, minute: 0 },
      date: { year: 2026, month: 9, day: 15 },
      zoneQuery: "Japan",
    };
    expect(on("0700", "2026-09-15", "Japan")).toEqual(expected);
    expect(on("2026-09-15", "0700", "Japan")).toEqual(expected);
    expect(on("tomorrow", "7am", "new york")?.date).toEqual({
      year: 2026,
      month: 9,
      day: 9,
    });
  });

  test("date without a time", () => {
    expect(on("tomorrow", "Thailand")).toEqual({
      time: null,
      date: { year: 2026, month: 9, day: 9 },
      zoneQuery: "Thailand",
    });
  });

  test("multi-word zones survive", () => {
    expect(on("0700", "fri", "new", "york")?.zoneQuery).toBe("new york");
  });

  test("null when nothing leads", () => {
    expect(on("Japan")).toBeNull();
    expect(on("zzz")).toBeNull();
  });
});

describe("resolveZone", () => {
  test("exact IANA zones and aliases", () => {
    expect(resolveZone("UTC")).toEqual({ zone: "UTC" });
    expect(resolveZone("Asia/Tokyo")).toEqual({ zone: "Asia/Tokyo" });
    expect(resolveZone("Japan")).toEqual({ zone: "Japan" });
  });

  test("fuzzy country names", () => {
    expect(resolveZone("Thailand")?.zone).toBe("Asia/Bangkok");
    expect(resolveZone("japn")?.zone).toBe("Asia/Tokyo");
  });

  test("fuzzy city names", () => {
    expect(resolveZone("tokio")?.zone).toBe("Asia/Tokyo");
    expect(resolveZone("new york")?.zone).toBe("America/New_York");
  });

  test("garbage", () => {
    expect(resolveZone("zzzzqqqq")).toBeNull();
  });
});

describe("countryFlag", () => {
  test("maps ISO codes to regional indicators", async () => {
    const { countryFlag } = await import("./flags.js");
    expect(countryFlag("JP")).toBe("🇯🇵");
    expect(countryFlag("us")).toBe("🇺🇸");
    expect(countryFlag("XYZ")).toBe("");
  });
});


describe("renderLookup", () => {
  const classix = [
    { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" },
    { name: "Beijing", timezone: "Asia/Shanghai", country: "CN" },
    { name: "Bangkok", timezone: "Asia/Bangkok", country: "TH" },
    { name: "Bucharest", timezone: "Europe/Bucharest", country: "RO" },
    { name: "London", timezone: "Europe/London", country: "GB" },
    { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", country: "AR" },
    { name: "Los Angeles", timezone: "America/Los_Angeles", country: "US" },
  ];
  const ref = DateTime.fromISO("2026-09-08T00:00", { zone: "UTC" });

  // Flags are two regional-indicator code points: 2 rendered columns but
  // 4 in JS string length. Normalize before measuring columns.
  const columns = (line: string) =>
    line.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "XX").length;

  test("compact lines stay within 32 columns", () => {
    const lines = renderLookup(ref, classix);
    for (const line of lines) {
      expect(columns(line)).toBeLessThanOrEqual(32);
    }
  });

  test("compact header and rows carry weekday + day", () => {
    const lines = renderLookup(ref, classix);
    expect(lines[1]).toBe("Tue 8 Sep 2026, 00:00 UTC");
    expect(lines).toContain("🇯🇵 Tokyo         Tue 8 09:00");
    // Behind UTC: previous day, weekday and date differ from the header.
    expect(lines).toContain("🇦🇷 Buenos Aires  Mon 7 21:00");
    expect(lines).toContain("🇺🇸 Los Angeles   Mon 7 17:00");
  });

  test("13-character city is cut to 12", () => {
    const lines = renderLookup(ref, [
      { name: "San Francisco", timezone: "America/Los_Angeles", country: "US" },
    ]);
    expect(lines.some((l) => l.includes("San Francisc "))).toBe(true);
    expect(lines.some((l) => l.includes("San Francisco"))).toBe(false);
  });

  test("short field overrides truncation", () => {
    const lines = renderLookup(ref, [
      { name: "San Francisco", timezone: "America/Los_Angeles", country: "US", short: "SF" },
      { name: "Los Angeles", timezone: "America/Los_Angeles", country: "US", short: "LA" },
    ]);
    expect(lines).toContain("🇺🇸 SF  Mon 7 17:00");
    expect(lines).toContain("🇺🇸 LA  Mon 7 17:00");
  });

  test("--wide keeps the existing layout", () => {
    const lines = renderLookup(ref, classix, { wide: true });
    expect(lines[1]).toBe("00:00 UTC — Tue 2026-09-08");
    expect(lines).toContain("🇯🇵 Tokyo         GMT+9  09:00  Tue 2026-09-08");
    // No truncation and no compact day column in wide mode.
    expect(lines.some((l) => l.includes("Buenos Aires"))).toBe(true);
  });
});
