import React from "react";
import { Box, Text } from "ink";
import type { TimezoneRowData } from "../types/index.js";
import { useTheme } from "../hooks/useTheme.js";
import { CityInfoPanel } from "./CityInfoPanel.js";
import { HourCell } from "./HourCell.js";

interface Props {
  row: TimezoneRowData;
  isSelected: boolean;
  isHome: boolean;
  panelWidth: number;
  maxCells: number;
  use24h: boolean;
}

function TimezoneRowInner({
  row,
  isSelected,
  isHome,
  panelWidth,
  maxCells,
  use24h,
}: Props) {
  const t = useTheme();
  const visibleHours = row.hours.slice(0, maxCells);

  return (
    <Box>
      <Text color={isSelected ? t.accent[1] : t.base[0]}>
        {isSelected ? "▎" : " "}
      </Text>
      <CityInfoPanel row={row} isSelected={isSelected} isHome={isHome} width={panelWidth} />
      <Box>
        {visibleHours.map((hour, i) => (
          <HourCell key={i} hour={hour} use24h={use24h} />
        ))}
      </Box>
    </Box>
  );
}

export const TimezoneRow = React.memo(TimezoneRowInner);
