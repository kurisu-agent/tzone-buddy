import React from "react";
import { Box, Text } from "ink";
import type { AppMode } from "../types/index.js";

interface Hint {
  key: string;
  label: string;
  keyColor: string;
}

const gridHints: Hint[] = [
  { key: " a ", label: "Add", keyColor: "#22c55e" },
  { key: " d ", label: "Delete", keyColor: "#ef4444" },
  { key: " ←→ ", label: "Slide", keyColor: "#06b6d4" },
  { key: " r ", label: "Reset", keyColor: "#eab308" },
  { key: " ? ", label: "Help", keyColor: "#3b82f6" },
  { key: " q ", label: "Quit", keyColor: "#ef4444" },
];

const searchHints: Hint[] = [
  { key: " ↑↓ ", label: "Navigate", keyColor: "#06b6d4" },
  { key: " Enter ", label: "Select", keyColor: "#22c55e" },
  { key: " Esc ", label: "Cancel", keyColor: "#ef4444" },
];

const confirmDeleteHints: Hint[] = [
  { key: " y ", label: "Confirm", keyColor: "#ef4444" },
  { key: " n ", label: "Cancel", keyColor: "#22c55e" },
];

const helpHints: Hint[] = [
  { key: " Esc ", label: "Close", keyColor: "#ef4444" },
];

function getHints(mode: AppMode): Hint[] {
  switch (mode) {
    case "grid":
      return gridHints;
    case "search":
      return searchHints;
    case "confirmDelete":
      return confirmDeleteHints;
    case "help":
      return helpHints;
  }
}

export function HintBar({ mode }: { mode: AppMode }) {
  const hints = getHints(mode);

  return (
    <Box paddingLeft={1}>
      {hints.map((hint, i) => (
        <React.Fragment key={hint.label}>
          {i > 0 && <Text dimColor> › </Text>}
          <Text backgroundColor={hint.keyColor} color="#000000" bold>
            {hint.key}
          </Text>
          <Text dimColor> {hint.label}</Text>
        </React.Fragment>
      ))}
    </Box>
  );
}
