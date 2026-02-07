import React, { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import type { City } from "../types/index.js";
import { searchCities } from "../lib/search.js";

interface Props {
  isActive: boolean;
  onSelect: (city: City) => void;
  onCancel: () => void;
}

export function SearchOverlay({ isActive, onSelect, onCancel }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const results = searchCities(query);

  useInput(
    (input, key) => {
      if (!isActive) return;

      if (key.escape) {
        onCancel();
        return;
      }

      if (key.return) {
        if (results.length > 0) {
          onSelect(results[selectedIndex]);
        }
        return;
      }

      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }

      if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(results.length - 1, prev + 1));
        return;
      }

      if (key.backspace || key.delete) {
        setQuery((prev) => prev.slice(0, -1));
        setSelectedIndex(0);
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setQuery((prev) => prev + input);
        setSelectedIndex(0);
      }
    },
    { isActive },
  );

  if (!isActive) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#60a5fa"
      paddingX={1}
      width={50}
    >
      <Text bold color="#60a5fa">
        󰍉 Search City
      </Text>
      <Box>
        <Text color="#60a5fa">{"❯ "}</Text>
        <Text>{query}</Text>
        <Text color="#60a5fa">▌</Text>
      </Box>
      <Text dimColor>{"─".repeat(46)}</Text>
      {results.map((city, i) => (
        <Text key={`${city.name}-${city.timezone}`}>
          <Text color={i === selectedIndex ? "#22c55e" : undefined}>
            {i === selectedIndex ? "❯" : " "}
          </Text>
          <Text bold={i === selectedIndex} color={i === selectedIndex ? "#22c55e" : undefined}>
            {" "}
            {city.name}
          </Text>
          <Text dimColor>
            {" "}
            {city.country} · {city.timezone}
          </Text>
        </Text>
      ))}
      {results.length === 0 && <Text dimColor>No results</Text>}
    </Box>
  );
}
