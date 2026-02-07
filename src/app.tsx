import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, useApp, useInput } from "ink";
import type { AppMode, City } from "./types/index.js";
import { themes } from "./data/themes.js";
import { ThemeContext, useTheme } from "./hooks/useTheme.js";
import { useClock } from "./hooks/useClock.js";
import { useReferenceTime } from "./hooks/useReferenceTime.js";
import { useTimezoneData } from "./hooks/useTimezoneData.js";
import { useCityList } from "./hooks/useCityList.js";
import { useConfig } from "./hooks/useConfig.js";
import { useTerminalSize } from "./hooks/useTerminalSize.js";
import { defaultCities, getHomeCity } from "./data/cities.js";
import { TimelineGrid } from "./components/TimelineGrid.js";
import { StatusBar } from "./components/StatusBar.js";
import { TimeSliderBar } from "./components/TimeSliderBar.js";
import { HintBar } from "./components/HintBar.js";
import { SearchOverlay } from "./components/SearchOverlay.js";

const PANEL_WIDTH = 22;
const CELL_WIDTH = 3;

export function App() {
  const { exit } = useApp();
  const [mode, setMode] = useState<AppMode>("grid");
  const [selectedRow, setSelectedRow] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [use24h, setUse24h] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const { columns } = useTerminalSize();

  const theme = themes[themeIndex];
  const homeCity = useMemo(() => getHomeCity(), []);

  const now = useClock();
  const { referenceTime, offsetMinutes, slideHour, slideDay, reset } =
    useReferenceTime(now);

  const { cities, setCities, addCity, removeCity, moveCity } =
    useCityList(defaultCities);

  useConfig(cities, setCities);

  // Display list: optionally prepend home city
  const displayCities = useMemo(() => {
    if (!showHome) return cities;
    // Don't duplicate if home is already in the user list
    const filtered = cities.filter(
      (c) => !(c.timezone === homeCity.timezone && c.name === homeCity.name),
    );
    return [homeCity, ...filtered];
  }, [showHome, cities, homeCity]);

  const homeOffset = showHome ? 1 : 0;

  const rows = useTimezoneData(referenceTime, displayCities, homeCity.timezone, use24h);
  const maxCells = Math.min(24, Math.floor((columns - PANEL_WIDTH - 4) / CELL_WIDTH));

  useInput(
    (input, key) => {
      if (mode !== "grid") return;

      if (key.shift && key.upArrow) {
        const userIdx = selectedRow - homeOffset;
        if (userIdx >= 1) {
          moveCity(userIdx, -1);
          setSelectedRow((prev) => prev - 1);
        }
        return;
      }
      if (key.shift && key.downArrow) {
        const userIdx = selectedRow - homeOffset;
        if (userIdx >= 0 && userIdx < cities.length - 1) {
          moveCity(userIdx, 1);
          setSelectedRow((prev) => prev + 1);
        }
        return;
      }
      if (key.shift && key.leftArrow) { slideDay(-1); return; }
      if (key.shift && key.rightArrow) { slideDay(1); return; }

      if (key.upArrow || input === "k") {
        setSelectedRow((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow || input === "j") {
        setSelectedRow((prev) => Math.min(displayCities.length - 1, prev + 1));
        return;
      }
      if (key.leftArrow || input === "h") { slideHour(-1); return; }
      if (key.rightArrow || input === "l") { slideHour(1); return; }

      if (input === "a") { setMode("search"); return; }
      if (input === "d") {
        // Can't delete the home row
        if (showHome && selectedRow === 0) return;
        if (displayCities.length <= homeOffset + 1) return;
        setMode("confirmDelete");
        return;
      }
      if (input === "r") { reset(); return; }
      if (input === "t") { setUse24h((prev) => !prev); return; }
      if (input === "c") { setThemeIndex((prev) => (prev + 1) % themes.length); return; }
      if (input === "H") {
        setShowHome((prev) => !prev);
        setSelectedRow(0);
        return;
      }
      if (input === "?") { setMode("help"); return; }
      if (input === "q") { exit(); return; }
    },
    { isActive: mode === "grid" },
  );

  useInput(
    (input, key) => {
      if (mode !== "confirmDelete") return;
      if (input === "y") {
        const userIdx = selectedRow - homeOffset;
        removeCity(userIdx);
        setSelectedRow((prev) => Math.min(prev, Math.max(0, displayCities.length - 2)));
        setMode("grid");
        return;
      }
      if (input === "n" || key.escape) { setMode("grid"); }
    },
    { isActive: mode === "confirmDelete" },
  );

  useInput(
    (_input, key) => {
      if (mode !== "help") return;
      if (key.escape) { setMode("grid"); }
    },
    { isActive: mode === "help" },
  );

  const handleSearchSelect = useCallback(
    (city: City) => { addCity(city); setMode("grid"); },
    [addCity],
  );

  const handleSearchCancel = useCallback(() => { setMode("grid"); }, []);

  return (
    <ThemeContext.Provider value={theme}>
      <Box flexDirection="column" width={columns}>
        <StatusBar
          referenceTime={referenceTime}
          offsetMinutes={offsetMinutes}
          columns={columns}
          use24h={use24h}
        />

        {mode === "search" ? (
          <SearchOverlay
            isActive
            onSelect={handleSearchSelect}
            onCancel={handleSearchCancel}
          />
        ) : mode === "help" ? (
          <HelpOverlay />
        ) : (
          <>
            <TimelineGrid
              rows={rows}
              selectedRow={selectedRow}
              panelWidth={PANEL_WIDTH}
              maxCells={maxCells}
              use24h={use24h}
              homeIndex={showHome ? 0 : -1}
            />
            {mode === "confirmDelete" && (
              <Box paddingX={2} marginTop={1}>
                <Text color={theme.primary[1]}>
                  Delete{" "}
                  <Text bold color={theme.accent[2]}>
                    {displayCities[selectedRow]?.name}
                  </Text>
                  ?{" "}
                  <Text color={theme.primary[0]}>(y/n)</Text>
                </Text>
              </Box>
            )}
          </>
        )}

        <TimeSliderBar offsetMinutes={offsetMinutes} columns={columns} />
        <HintBar mode={mode} />
      </Box>
    </ThemeContext.Provider>
  );
}

function HelpOverlay() {
  const t = useTheme();
  const keys = [
    ["↑/k  ↓/j", "Select timezone row"],
    ["←/h  →/l", "Slide reference time ±1h"],
    ["S-←  S-→", "Slide ±1 day"],
    ["S-↑  S-↓", "Reorder city up/down"],
    ["a", "Add city"],
    ["d", "Delete selected city"],
    ["r", "Reset to now"],
    ["t", "Toggle 12/24 hour clock"],
    ["c", "Cycle theme"],
    ["H", "Toggle home timezone"],
    ["q", "Quit"],
  ];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={t.base[2]}
      paddingX={2}
      paddingY={1}
      marginLeft={2}
    >
      <Text bold color={t.accent[1]}>
        󰋗 Keyboard Shortcuts
      </Text>
      <Text> </Text>
      {keys.map(([key, desc]) => (
        <Text key={key}>
          <Text bold color={t.accent[2]}>
            {key!.padEnd(10)}
          </Text>
          <Text color={t.primary[1]}>{desc}</Text>
        </Text>
      ))}
      <Text> </Text>
      <Text color={t.primary[0]}>Press Esc to close</Text>
    </Box>
  );
}
