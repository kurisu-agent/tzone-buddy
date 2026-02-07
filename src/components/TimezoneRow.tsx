import React from "react";
import { Box } from "ink";
import type { TimezoneRowData } from "../types/index.js";
import { CityInfoPanel } from "./CityInfoPanel.js";
import { HourCell } from "./HourCell.js";

interface Props {
  row: TimezoneRowData;
  isSelected: boolean;
  cellWidth: number;
  panelWidth: number;
  maxCells: number;
}

function TimezoneRowInner({
  row,
  isSelected,
  cellWidth,
  panelWidth,
  maxCells,
}: Props) {
  const visibleHours = row.hours.slice(0, maxCells);

  return (
    <Box
      borderStyle={isSelected ? "single" : undefined}
      borderColor={isSelected ? "#22c55e" : undefined}
      borderLeft={isSelected}
      borderRight={false}
      borderTop={false}
      borderBottom={false}
    >
      <CityInfoPanel row={row} isSelected={isSelected} width={panelWidth} />
      <Box>
        {visibleHours.map((hour, i) => (
          <HourCell key={i} hour={hour} cellWidth={cellWidth} />
        ))}
      </Box>
    </Box>
  );
}

export const TimezoneRow = React.memo(TimezoneRowInner);
