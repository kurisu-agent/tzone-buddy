import React from "react";
import { Box, Text } from "ink";
import type { TimezoneRowData } from "../types/index.js";
import { useTheme } from "../hooks/useTheme.js";

interface Props {
  row: TimezoneRowData;
  isSelected: boolean;
  isHome: boolean;
  width: number;
}

function CityInfoPanelInner({ row, isSelected, isHome, width }: Props) {
  const t = useTheme();
  const nameWidth = width - 6;
  const name = row.city.name.length > nameWidth
    ? row.city.name.slice(0, nameWidth)
    : row.city.name.padEnd(nameWidth);

  const dayStr = row.dayOffset || "";

  const nameColor = isSelected ? t.accent[1] : isHome ? t.dawn[2] : t.primary[2];
  const icon = isHome ? " 󰋜 " : isSelected ? " 󰁔 " : "   ";
  const iconColor = isHome ? t.dawn[2] : isSelected ? t.accent[1] : t.base[2];

  return (
    <Box flexDirection="column" width={width} marginRight={1}>
      <Text>
        <Text color={iconColor}>{icon}</Text>
        <Text color={nameColor} bold={isSelected || isHome}>
          {name}
        </Text>
      </Text>
      <Text>
        {"   "}
        <Text color={t.primary[0]}>
          {row.abbreviation} {row.currentTime}
        </Text>
        {dayStr ? <Text color={t.dawn[2]}>{dayStr}</Text> : null}
      </Text>
    </Box>
  );
}

export const CityInfoPanel = React.memo(CityInfoPanelInner);
