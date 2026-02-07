import React from "react";
import { Box, Text } from "ink";
import type { AppMode } from "../types/index.js";
import { useTheme } from "../hooks/useTheme.js";

interface Hint {
  key: string;
  label: string;
}

const gridHints: Hint[] = [
  { key: "a", label: "Add" },
  { key: "d", label: "Del" },
  { key: "←→", label: "Slide" },
  { key: "S-↑↓", label: "Move" },
  { key: "r", label: "Reset" },
  { key: "t", label: "12/24h" },
  { key: "c", label: "Theme" },
  { key: "H", label: "Home" },
  { key: "?", label: "Help" },
  { key: "q", label: "Quit" },
];

const searchHints: Hint[] = [
  { key: "↑↓", label: "Navigate" },
  { key: "⏎", label: "Select" },
  { key: "Esc", label: "Cancel" },
];

const confirmHints: Hint[] = [
  { key: "y", label: "Confirm" },
  { key: "n", label: "Cancel" },
];

const helpHints: Hint[] = [
  { key: "Esc", label: "Close" },
];

function getHints(mode: AppMode): Hint[] {
  switch (mode) {
    case "grid": return gridHints;
    case "search": return searchHints;
    case "confirmDelete": return confirmHints;
    case "help": return helpHints;
  }
}

export function HintBar({ mode, updateAvailable }: { mode: AppMode; updateAvailable?: boolean }) {
  const t = useTheme();
  let hints = getHints(mode);

  // Add update hint if update is available and in grid mode
  if (mode === "grid" && updateAvailable) {
    hints = [...hints.slice(0, -1), { key: "u", label: "Update" }, hints[hints.length - 1]];
  }

  return (
    <Box paddingX={1} marginTop={1} gap={2}>
      {hints.map((hint) => (
        <Text key={hint.label}>
          <Text color={t.primary[1]}>{hint.key}</Text>
          <Text color={t.primary[0]}> {hint.label}</Text>
        </Text>
      ))}
    </Box>
  );
}
