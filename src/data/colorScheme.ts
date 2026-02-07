import type { TimePeriod } from "../types/index.js";

export const periodColors: Record<TimePeriod, { bg: string; fg: string }> = {
  night: { bg: "#1a1b4b", fg: "#6366f1" },
  morning: { bg: "#1e3a5f", fg: "#60a5fa" },
  business: { bg: "#14532d", fg: "#4ade80" },
  evening: { bg: "#3b0764", fg: "#c084fc" },
};

export const currentHourColor = { bg: "#ca8a04", fg: "#000000" };

export const selectedRowBorder = "#22c55e";

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
