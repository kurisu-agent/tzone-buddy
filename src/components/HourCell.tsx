import React from "react";
import { Text } from "ink";
import type { HourData } from "../types/index.js";
import { periodColors, currentHourColor } from "../data/colorScheme.js";

interface Props {
  hour: HourData;
  cellWidth: number;
}

function HourCellInner({ hour, cellWidth }: Props) {
  const colors = hour.isCurrent ? currentHourColor : periodColors[hour.period];
  const display = hour.hour === 0 ? 12 : hour.hour > 12 ? hour.hour - 12 : hour.hour;
  const label =
    cellWidth >= 3
      ? String(display).padStart(2) + (hour.hour >= 12 ? "p" : "a")
      : String(display).padStart(2);

  return (
    <Text backgroundColor={colors.bg} color={colors.fg}>
      {label}
    </Text>
  );
}

export const HourCell = React.memo(HourCellInner);
