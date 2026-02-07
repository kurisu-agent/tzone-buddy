import { useMemo } from "react";
import { DateTime } from "luxon";
import type { City, TimezoneRowData } from "../types/index.js";
import { computeRowData } from "../lib/timezone.js";

export function useTimezoneData(
  referenceTime: DateTime,
  cities: City[],
): TimezoneRowData[] {
  return useMemo(
    () => cities.map((city) => computeRowData(referenceTime, city)),
    [referenceTime.toMillis(), cities],
  );
}
