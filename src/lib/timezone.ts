import { DateTime } from "luxon";
import { getTimePeriod } from "../data/colorScheme.js";
import type { City, HourData, TimezoneRowData } from "../types/index.js";

export function getNow(): DateTime {
  return DateTime.now();
}

export function getTimeInZone(
  referenceTime: DateTime,
  timezone: string,
): DateTime {
  return referenceTime.setZone(timezone);
}

export function formatTime(dt: DateTime): string {
  return dt.toFormat("h:mm a");
}

export function getAbbreviation(dt: DateTime): string {
  return dt.toFormat("ZZZZ") || dt.toFormat("ZZ");
}

export function getDayOffset(reference: DateTime, zoned: DateTime): string {
  const refDay = reference.startOf("day");
  const zonedDay = zoned.startOf("day");
  const diff = zonedDay.diff(refDay, "days").days;
  const rounded = Math.round(diff);
  if (rounded === 0) return "";
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

export function computeHours(
  referenceTime: DateTime,
  timezone: string,
): HourData[] {
  const zoned = referenceTime.setZone(timezone);
  const currentHour = zoned.hour;
  const startOfDay = zoned.startOf("day");

  return Array.from({ length: 24 }, (_, i) => {
    const hourDt = startOfDay.plus({ hours: i });
    const hour = hourDt.hour;
    const isPM = hour >= 12;
    const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      hour,
      period: getTimePeriod(hour),
      isCurrent: hour === currentHour,
      label: `${display}${isPM ? "p" : "a"}`,
    };
  });
}

export function computeRowData(
  referenceTime: DateTime,
  city: City,
): TimezoneRowData {
  const zoned = getTimeInZone(referenceTime, city.timezone);
  return {
    city,
    currentTime: formatTime(zoned),
    abbreviation: getAbbreviation(zoned),
    dayOffset: getDayOffset(referenceTime, zoned),
    hours: computeHours(referenceTime, city.timezone),
  };
}
