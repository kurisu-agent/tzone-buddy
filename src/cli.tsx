#!/usr/bin/env bun

// Ensure DEV is never true in production to avoid react-devtools-core import
if (process.env.DEV === 'true') {
  delete process.env.DEV;
}

import React from "react";
import { render } from "ink";
import { App } from "./app.js";
import { runPrintMode } from "./lib/convert.js";
import packageJson from "../package.json";

// Check for version flag
const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(`tzone-buddy v${packageJson.version}`);
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`tzone-buddy v${packageJson.version}
Terminal-based World Time Buddy TUI

Usage:
  tzone-buddy                        Start the TUI application
  tzone-buddy <time> [zone]          Print configured cities at the given time
  tzone-buddy <time> <date> [zone]   Same, on a given date (either order)
  tzone-buddy <date> [zone]          Same, at the current time of day
  tzone-buddy now [zone]             Same, at the current time
  tzone-buddy <time> --wide          Full layout (zone abbrevs, ISO dates)
                                     (zone defaults to UTC; fuzzy matching
                                     works, e.g. "Japan", "Thailand", "tokyo")
  tzone-buddy --version              Show version
  tzone-buddy --help                 Show this help

Times: 0700, 07:00, 7, 7:30pm, now
Dates: 2026-09-15, 09-15, 15sep, sep 15, today, tomorrow, fri, +3d, -1w

Examples:
  tzone-buddy 0700 UTC
  tzone-buddy 7:30pm Japan
  tzone-buddy 1400 Thailand
  tzone-buddy 0900 tomorrow new york
  tzone-buddy 2026-09-15 1830 Japan
  tzone-buddy fri 1000 London
  tzone-buddy now
  tzone-buddy now --wide

Keyboard shortcuts:
  a         Add city
  d         Delete city
  ↑/↓       Navigate cities
  ←/→       Slide time
  c         Cycle themes
  u         Update (when available)
  ?         Show help
  q         Quit

More info: https://github.com/kurisu-agent/tzone-buddy`);
  process.exit(0);
}

const positional = args.filter((a) => !a.startsWith("-"));
if (positional.length > 0) {
  process.exit(runPrintMode(positional, { wide: args.includes("--wide") }));
}

render(<App />);
