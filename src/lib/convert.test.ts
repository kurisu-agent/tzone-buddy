import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import { parseTimeArg, renderLookup, resolveZone } from "./convert.js";

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
