import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "../hooks/useTheme.js";

interface Props {
  offsetMinutes: number;
  columns: number;
}

export function TimeSliderBar({ offsetMinutes, columns }: Props) {
  const t = useTheme();
  const hours = offsetMinutes / 60;

  const maxOffset = 24;
  const sliderWidth = Math.max(columns - 8, 20);
  const center = Math.floor(sliderWidth / 2);
  const pos = Math.round(center + (hours / maxOffset) * center);
  const clampedPos = Math.max(0, Math.min(sliderWidth - 1, pos));

  const left = "─".repeat(clampedPos);
  const right = "─".repeat(sliderWidth - clampedPos - 1);

  return (
    <Box paddingX={2} marginTop={1}>
      <Text color={t.base[2]}>{left}</Text>
      <Text color={offsetMinutes === 0 ? t.dawn[1] : t.dawn[2]} bold>│</Text>
      <Text color={t.base[2]}>{right}</Text>
    </Box>
  );
}
