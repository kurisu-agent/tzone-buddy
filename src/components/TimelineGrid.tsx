import React from "react";
import { Box } from "ink";
import type { TimezoneRowData } from "../types/index.js";
import { TimezoneRow } from "./TimezoneRow.js";

interface Props {
  rows: TimezoneRowData[];
  selectedRow: number;
  panelWidth: number;
  maxCells: number;
  use24h: boolean;
  homeIndex: number;
}

export function TimelineGrid({
  rows,
  selectedRow,
  panelWidth,
  maxCells,
  use24h,
  homeIndex,
}: Props) {
  return (
    <Box flexDirection="column" gap={1}>
      {rows.map((row, i) => (
        <TimezoneRow
          key={`${row.city.name}-${row.city.timezone}`}
          row={row}
          isSelected={i === selectedRow}
          isHome={i === homeIndex}
          panelWidth={panelWidth}
          maxCells={maxCells}
          use24h={use24h}
        />
      ))}
    </Box>
  );
}
