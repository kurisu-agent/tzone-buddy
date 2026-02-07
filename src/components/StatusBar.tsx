import React from "react";
import { Box, Text } from "ink";
import { DateTime } from "luxon";
import { useTheme } from "../hooks/useTheme.js";

interface Props {
  referenceTime: DateTime;
  offsetMinutes: number;
  columns: number;
  use24h: boolean;
}

export function StatusBar({ referenceTime, offsetMinutes, columns, use24h }: Props) {
  const t = useTheme();
  const refLabel =
    offsetMinutes === 0
      ? "NOW"
      : `${offsetMinutes > 0 ? "+" : ""}${Math.floor(offsetMinutes / 60)}h${
          offsetMinutes % 60 !== 0
            ? `${Math.abs(offsetMinutes % 60)}m`
            : ""
        }`;

  const timeFmt = use24h ? "HH:mm" : "h:mm a";
  const dateStr = referenceTime.toFormat(`ccc, LLL d yyyy  ${timeFmt}`);

  return (
    <Box width={columns} paddingX={1} marginBottom={1}>
      <Box flexGrow={1}>
        <Text bold color={t.accent[1]}>
          󰥔 tzone-buddy
        </Text>
        <Text color={t.primary[0]}>{"  "}{dateStr}</Text>
      </Box>
      <Text bold color={offsetMinutes === 0 ? t.dawn[1] : t.dawn[2]}>
        {refLabel}
      </Text>
    </Box>
  );
}
