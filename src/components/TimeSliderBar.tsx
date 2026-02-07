import React from "react";
import { Box, Text } from "ink";

interface Props {
  offsetMinutes: number;
  columns: number;
}

export function TimeSliderBar({ offsetMinutes, columns }: Props) {
  const hours = offsetMinutes / 60;
  const label =
    offsetMinutes === 0
      ? "● NOW"
      : `${hours > 0 ? "+" : ""}${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`;

  // Visual slider position: map offset to a range
  const maxOffset = 24;
  const sliderWidth = Math.max(columns - 6, 20);
  const center = Math.floor(sliderWidth / 2);
  const pos = Math.round(center + (hours / maxOffset) * center);
  const clampedPos = Math.max(0, Math.min(sliderWidth - 1, pos));

  const bar = "─".repeat(clampedPos) + "│" + "─".repeat(sliderWidth - clampedPos - 1);

  return (
    <Box paddingLeft={1} paddingRight={1} flexDirection="column">
      <Text dimColor>
        <Text color="#60a5fa">󰒮</Text>
        {" "}
        <Text>{bar}</Text>
        {" "}
        <Text color="#60a5fa">󰒭</Text>
      </Text>
      <Box justifyContent="center" width={columns - 2}>
        <Text bold color={offsetMinutes === 0 ? "#4ade80" : "#f59e0b"}>
          {label}
        </Text>
      </Box>
    </Box>
  );
}
