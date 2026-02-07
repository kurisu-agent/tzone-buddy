import React from "react";
import { Box } from "ink";
import type { TimezoneRowData } from "../types/index.js";
import { TimezoneRow } from "./TimezoneRow.js";

interface Props {
  rows: TimezoneRowData[];
  selectedRow: number;
  cellWidth: number;
  panelWidth: number;
  maxCells: number;
}

export function TimelineGrid({
  rows,
  selectedRow,
  cellWidth,
  panelWidth,
  maxCells,
}: Props) {
  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <TimezoneRow
          key={`${row.city.name}-${row.city.timezone}`}
          row={row}
          isSelected={i === selectedRow}
          cellWidth={cellWidth}
          panelWidth={panelWidth}
          maxCells={maxCells}
        />
      ))}
    </Box>
  );
}
