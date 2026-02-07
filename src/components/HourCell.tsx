import React from "react";
import { Text } from "ink";
import type { HourData } from "../types/index.js";
import type { TimePeriod } from "../types/index.js";
import { useTheme } from "../hooks/useTheme.js";
import type { Theme } from "../data/themes.js";

function periodColor(t: Theme, period: TimePeriod): string {
  switch (period) {
    case "night":    return t.dusk[0];
    case "morning":  return t.dawn[0];
    case "business": return t.dawn[1];
    case "evening":  return t.dusk[1];
  }
}

interface Props {
  hour: HourData;
  use24h: boolean;
}

function HourCellInner({ hour, use24h }: Props) {
  const t = useTheme();

  let label: string;
  if (use24h) {
    label = String(hour.hour).padStart(2, "0");
  } else {
    const display = hour.hour === 0 ? 12 : hour.hour > 12 ? hour.hour - 12 : hour.hour;
    label = String(display).padStart(2);
  }

  const color = hour.isCurrent ? t.accent[2] : periodColor(t, hour.period);

  return (
    <Text color={color} bold={hour.isCurrent}>
      {label}{" "}
    </Text>
  );
}

export const HourCell = React.memo(HourCellInner);
