import { describe, expect, test } from "bun:test";
import { DateTime } from "luxon";
import { cityKey, visibleCities } from "./visible.js";

const home = { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" };
const london = { name: "London", timezone: "Europe/London", country: "GB" };
const la = { name: "Los Angeles", timezone: "America/Los_Angeles", country: "US" };
const cities = [london, la, home];
const ref = DateTime.fromISO("2026-09-08T00:00", { zone: "UTC" });

describe("visibleCities", () => {
  test("home first, others by offset, nothing hidden", () => {
    expect(visibleCities(cities, home, new Set(), ref).map((c) => c.name)).toEqual([
      "Tokyo",
      "London",
      "Los Angeles",
    ]);
  });

  test("hidden keys drop out without touching the input", () => {
    const hidden = new Set([cityKey(london)]);
    expect(visibleCities(cities, home, hidden, ref).map((c) => c.name)).toEqual([
      "Tokyo",
      "Los Angeles",
    ]);
    expect(cities).toHaveLength(3);
  });

  test("the home row can be hidden too", () => {
    const hidden = new Set([cityKey(home)]);
    expect(visibleCities(cities, home, hidden, ref).map((c) => c.name)).toEqual([
      "London",
      "Los Angeles",
    ]);
  });
});
