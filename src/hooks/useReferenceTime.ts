import { useCallback, useState } from "react";
import { DateTime } from "luxon";

export function useReferenceTime(now: DateTime) {
  const [offsetMinutes, setOffsetMinutes] = useState(0);

  const referenceTime = now.plus({ minutes: offsetMinutes });

  const slideHour = useCallback((direction: 1 | -1) => {
    setOffsetMinutes((prev) => prev + direction * 60);
  }, []);

  const slideQuarter = useCallback((direction: 1 | -1) => {
    setOffsetMinutes((prev) => prev + direction * 15);
  }, []);

  const reset = useCallback(() => {
    setOffsetMinutes(0);
  }, []);

  return { referenceTime, offsetMinutes, slideHour, slideQuarter, reset };
}
