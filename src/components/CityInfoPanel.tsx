import React from "react";
import { Box, Text } from "ink";
import type { TimezoneRowData } from "../types/index.js";

interface Props {
  row: TimezoneRowData;
  isSelected: boolean;
  width: number;
}

function CityInfoPanelInner({ row, isSelected, width }: Props) {
  const indicator = isSelected ? "󰁔" : " ";
  const dayStr = row.dayOffset ? row.dayOffset : "";

  return (
    <Box flexDirection="column" width={width}>
      <Text>
        <Text color={isSelected ? "#22c55e" : undefined} bold={isSelected}>
          {indicator}
        </Text>
        <Text color={isSelected ? "#22c55e" : "#e2e8f0"} bold>
          {" 󰗵 "}
          {row.city.name}
        </Text>
      </Text>
      <Text dimColor>
        {"  "}
        {row.abbreviation} {row.currentTime}
        {dayStr ? <Text color="#f59e0b">{dayStr}</Text> : null}
      </Text>
    </Box>
  );
}

export const CityInfoPanel = React.memo(CityInfoPanelInner);
