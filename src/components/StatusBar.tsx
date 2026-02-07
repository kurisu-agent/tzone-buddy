import React from "react";
import { Box, Text } from "ink";

interface Props {
  offsetMinutes: number;
  columns: number;
}

export function StatusBar({ offsetMinutes, columns }: Props) {
  const refLabel =
    offsetMinutes === 0
      ? "NOW"
      : `${offsetMinutes > 0 ? "+" : ""}${Math.floor(offsetMinutes / 60)}h${
          offsetMinutes % 60 !== 0
            ? `${Math.abs(offsetMinutes % 60)}m`
            : ""
        }`;

  return (
    <Box
      width={columns}
      justifyContent="space-between"
      borderStyle="single"
      borderBottom
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      paddingLeft={1}
      paddingRight={1}
    >
      <Text bold color="#60a5fa">
        󰥔 tzone-buddy
      </Text>
      <Text>
        Reference:{" "}
        <Text bold color={offsetMinutes === 0 ? "#4ade80" : "#f59e0b"}>
          {refLabel}
        </Text>
      </Text>
    </Box>
  );
}
