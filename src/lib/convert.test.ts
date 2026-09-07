import { describe, expect, test } from "bun:test";
import { parseTimeArg, resolveZone } from "./convert.js";

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
