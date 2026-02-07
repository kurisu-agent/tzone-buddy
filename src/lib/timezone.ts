import { DateTime } from "luxon";
import { getTimePeriod } from "../data/colorScheme.js";
import type { City, HourData, TimezoneRowData } from "../types/index.js";

export function getTimeInZone(
  referenceTime: DateTime,
  timezone: string,
): DateTime {
  return referenceTime.setZone(timezone);
}

export function formatTime(dt: DateTime, use24h: boolean): string {
  return use24h ? dt.toFormat("HH:mm") : dt.toFormat("h:mm a");
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

/**
 * Compute 24 hour cells aligned to the home timezone's day.
 * Each column represents the same absolute moment across all rows.
 * The "now" column index is the home timezone's current hour.
 */
export function computeAlignedHours(
  referenceTime: DateTime,
  homeTimezone: string,
  targetTimezone: string,
): HourData[] {
  const homeZoned = referenceTime.setZone(homeTimezone);
  const homeCurrentHour = homeZoned.hour;
  const homeStartOfDay = homeZoned.startOf("day");

  return Array.from({ length: 24 }, (_, i) => {
    const absoluteTime = homeStartOfDay.plus({ hours: i });
    const targetTime = absoluteTime.setZone(targetTimezone);
    const hour = targetTime.hour;
    return {
      hour,
      period: getTimePeriod(hour),
      isCurrent: i === homeCurrentHour,
      label: String(hour),
    };
  });
}

export function computeRowData(
  referenceTime: DateTime,
  city: City,
  homeTimezone: string,
  use24h: boolean,
): TimezoneRowData {
  const zoned = getTimeInZone(referenceTime, city.timezone);
  return {
    city,
    currentTime: formatTime(zoned, use24h),
    abbreviation: getAbbreviation(zoned),
    dayOffset: getDayOffset(referenceTime, zoned),
    hours: computeAlignedHours(referenceTime, homeTimezone, city.timezone),
  };
}
