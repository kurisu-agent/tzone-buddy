import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { City } from "../types/index.js";
import { useTheme } from "../hooks/useTheme.js";
import { searchCities } from "../lib/search.js";

interface Props {
  isActive: boolean;
  onSelect: (city: City) => void;
  onCancel: () => void;
}

export function SearchOverlay({ isActive, onSelect, onCancel }: Props) {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const results = searchCities(query);

  useInput(
    (input, key) => {
      if (!isActive) return;

      if (key.escape) { onCancel(); return; }
      if (key.return) {
        if (results.length > 0) onSelect(results[selectedIndex]);
        return;
      }
      if (key.upArrow) { setSelectedIndex((prev) => Math.max(0, prev - 1)); return; }
      if (key.downArrow) { setSelectedIndex((prev) => Math.min(results.length - 1, prev + 1)); return; }
      if (key.backspace || key.delete) { setQuery((prev) => prev.slice(0, -1)); setSelectedIndex(0); return; }
      if (input && !key.ctrl && !key.meta) { setQuery((prev) => prev + input); setSelectedIndex(0); }
    },
    { isActive },
  );

  if (!isActive) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={t.base[2]}
      paddingX={1}
      width={50}
      marginLeft={2}
    >
      <Text bold color={t.accent[1]}>
        󰍉 Search City
      </Text>
      <Box>
        <Text color={t.primary[0]}>{"❯ "}</Text>
        <Text color={t.primary[2]}>{query}</Text>
        <Text color={t.primary[0]}>▌</Text>
      </Box>
      <Text color={t.base[2]}>{"─".repeat(46)}</Text>
      {results.map((city, i) => (
        <Text key={`${city.name}-${city.timezone}`}>
          <Text color={i === selectedIndex ? t.accent[1] : t.base[2]}>
            {i === selectedIndex ? "❯" : " "}
          </Text>
          <Text
            bold={i === selectedIndex}
            color={i === selectedIndex ? t.accent[1] : t.primary[2]}
          >
            {" "}{city.name}
          </Text>
          <Text color={t.primary[0]}>
            {" "}{city.country} · {city.timezone}
          </Text>
        </Text>
      ))}
      {results.length === 0 && <Text color={t.primary[0]}>No results</Text>}
    </Box>
  );
}
