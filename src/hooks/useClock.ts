import { useEffect, useState } from "react";
import { DateTime } from "luxon";

export function useClock(): DateTime {
  const [now, setNow] = useState(() => DateTime.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(DateTime.now());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
}
