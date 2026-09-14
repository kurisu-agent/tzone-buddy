import type { DateTime } from "luxon";
import type { City } from "../types/index.js";

export function cityKey(city: City): string {
  return `${city.name}|${city.timezone}`;
}

/**
 * Rows the grid shows: the home city first, then the rest sorted by UTC
 * offset (furthest in the future first), minus any keys hidden for this
 * session. Hiding is never written to the config.
 */
export function visibleCities(
  cities: City[],
  homeCity: City,
  hidden: ReadonlySet<string>,
  referenceTime: DateTime,
): City[] {
  const home = cityKey(homeCity);
  const others = cities
    .filter((c) => cityKey(c) !== home && !hidden.has(cityKey(c)))
    .sort(
      (a, b) =>
        referenceTime.setZone(b.timezone).offset -
        referenceTime.setZone(a.timezone).offset,
    );
  return hidden.has(home) ? others : [homeCity, ...others];
}
