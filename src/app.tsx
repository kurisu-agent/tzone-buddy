import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import type { AppMode, City } from "./types/index.js";
import { useClock } from "./hooks/useClock.js";
import { useReferenceTime } from "./hooks/useReferenceTime.js";
import { useTimezoneData } from "./hooks/useTimezoneData.js";
import { useCityList } from "./hooks/useCityList.js";
import { useConfig } from "./hooks/useConfig.js";
import { useTerminalSize } from "./hooks/useTerminalSize.js";
import { defaultCities } from "./data/cities.js";
import { TimelineGrid } from "./components/TimelineGrid.js";
import { StatusBar } from "./components/StatusBar.js";
import { TimeSliderBar } from "./components/TimeSliderBar.js";
import { HintBar } from "./components/HintBar.js";
import { SearchOverlay } from "./components/SearchOverlay.js";

const PANEL_WIDTH = 22;

export function App() {
  const { exit } = useApp();
  const [mode, setMode] = useState<AppMode>("grid");
  const [selectedRow, setSelectedRow] = useState(0);
  const { columns, cellWidth } = useTerminalSize();

  const now = useClock();
  const { referenceTime, offsetMinutes, slideHour, slideQuarter, reset } =
    useReferenceTime(now);

  const { cities, setCities, addCity, removeCity, moveCity } =
    useCityList(defaultCities);

  useConfig(cities, setCities);

  const rows = useTimezoneData(referenceTime, cities);
  const maxCells = Math.min(24, Math.floor((columns - PANEL_WIDTH - 2) / cellWidth));

  // Grid mode keyboard handler
  useInput(
    (input, key) => {
      if (mode !== "grid") return;

      // Navigation
      if (key.upArrow || input === "k") {
        setSelectedRow((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow || input === "j") {
        setSelectedRow((prev) => Math.min(cities.length - 1, prev + 1));
        return;
      }

      // Time sliding
      if (key.leftArrow || input === "h") {
        if (key.shift) slideQuarter(-1);
        else slideHour(-1);
        return;
      }
      if (key.rightArrow || input === "l") {
        if (key.shift) slideQuarter(1);
        else slideHour(1);
        return;
      }

      // Reorder cities
      if (key.shift && key.upArrow) {
        moveCity(selectedRow, -1);
        setSelectedRow((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.shift && key.downArrow) {
        moveCity(selectedRow, 1);
        setSelectedRow((prev) => Math.min(cities.length - 1, prev + 1));
        return;
      }

      // Actions
      if (input === "a") {
        setMode("search");
        return;
      }
      if (input === "d" && cities.length > 0) {
        setMode("confirmDelete");
        return;
      }
      if (input === "r") {
        reset();
        return;
      }
      if (input === "?") {
        setMode("help");
        return;
      }
      if (input === "q") {
        exit();
        return;
      }
    },
    { isActive: mode === "grid" },
  );

  // Confirm delete handler
  useInput(
    (input, key) => {
      if (mode !== "confirmDelete") return;

      if (input === "y") {
        removeCity(selectedRow);
        setSelectedRow((prev) => Math.min(prev, cities.length - 2));
        setMode("grid");
        return;
      }
      if (input === "n" || key.escape) {
        setMode("grid");
        return;
      }
    },
    { isActive: mode === "confirmDelete" },
  );

  // Help handler
  useInput(
    (_input, key) => {
      if (mode !== "help") return;
      if (key.escape) {
        setMode("grid");
      }
    },
    { isActive: mode === "help" },
  );

  const handleSearchSelect = useCallback(
    (city: City) => {
      addCity(city);
      setMode("grid");
    },
    [addCity],
  );

  const handleSearchCancel = useCallback(() => {
    setMode("grid");
  }, []);

  return (
    <Box flexDirection="column" width={columns}>
      <StatusBar offsetMinutes={offsetMinutes} columns={columns} />

      {mode === "search" ? (
        <SearchOverlay
          isActive={mode === "search"}
          onSelect={handleSearchSelect}
          onCancel={handleSearchCancel}
        />
      ) : mode === "help" ? (
        <HelpOverlay />
      ) : mode === "confirmDelete" ? (
        <Box paddingX={1}>
          <Text>
            Delete{" "}
            <Text bold color="#ef4444">
              {cities[selectedRow]?.name}
            </Text>
            ? (y/n)
          </Text>
        </Box>
      ) : (
        <TimelineGrid
          rows={rows}
          selectedRow={selectedRow}
          cellWidth={cellWidth}
          panelWidth={PANEL_WIDTH}
          maxCells={maxCells}
        />
      )}

      <TimeSliderBar offsetMinutes={offsetMinutes} columns={columns} />
      <HintBar mode={mode} />
    </Box>
  );
}

function HelpOverlay() {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#3b82f6"
      paddingX={2}
      paddingY={1}
    >
      <Text bold color="#3b82f6">
        󰋗 Keyboard Shortcuts
      </Text>
      <Text> </Text>
      <Text>
        <Text bold color="#06b6d4">↑/k ↓/j</Text>
        {"   "}Select timezone row
      </Text>
      <Text>
        <Text bold color="#06b6d4">←/h →/l</Text>
        {"   "}Slide reference time ±1h
      </Text>
      <Text>
        <Text bold color="#06b6d4">Shift+←→</Text>
        {"  "}Slide ±15min
      </Text>
      <Text>
        <Text bold color="#06b6d4">Shift+↑↓</Text>
        {"  "}Reorder city
      </Text>
      <Text>
        <Text bold color="#22c55e">a</Text>
        {"          "}Add city
      </Text>
      <Text>
        <Text bold color="#ef4444">d</Text>
        {"          "}Delete selected city
      </Text>
      <Text>
        <Text bold color="#eab308">r</Text>
        {"          "}Reset to now
      </Text>
      <Text>
        <Text bold color="#ef4444">q</Text>
        {"          "}Quit
      </Text>
      <Text> </Text>
      <Text dimColor>Press Esc to close</Text>
    </Box>
  );
}
