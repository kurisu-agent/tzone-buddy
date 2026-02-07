#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { App } from "./app.js";
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
  tzone-buddy              Start the TUI application
  tzone-buddy --version    Show version
  tzone-buddy --help       Show this help

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

render(<App />);
