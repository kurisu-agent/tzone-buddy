import type { TimePeriod } from "../types/index.js";

export const periodIcons: Record<TimePeriod, string> = {
  night: "󰖔",
  morning: "󰖜",
  business: "󰖙",
  evening: "󰖛",
};

export function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 0 && hour < 6) return "night";
  if (hour >= 6 && hour < 9) return "morning";
  if (hour >= 9 && hour < 17) return "business";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
