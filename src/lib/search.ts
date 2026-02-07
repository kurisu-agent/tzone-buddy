import Fuse from "fuse.js";
import { cities } from "../data/cities.js";
import type { City } from "../types/index.js";

const fuse = new Fuse(cities, {
  keys: ["name", "country", "timezone"],
  threshold: 0.4,
  includeScore: true,
});

export function searchCities(query: string): City[] {
  if (!query.trim()) return cities.slice(0, 10);
  return fuse.search(query, { limit: 10 }).map((r) => r.item);
}
