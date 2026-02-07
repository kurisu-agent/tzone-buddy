#!/usr/bin/env node

// This script generates a mock screenshot of what tzone-buddy looks like
// using ANSI escape codes and terminal-kit

const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Catppuccin Mocha theme colors
  bg: '\x1b[48;2;30;30;46m',
  surface: '\x1b[48;2;49;50;68m',
  text: '\x1b[38;2;205;214;244m',
  subtext: '\x1b[38;2;166;173;200m',
  accent: '\x1b[38;2;245;194;231m',
  blue: '\x1b[38;2;137;180;250m',
  green: '\x1b[38;2;166;227;161m',
  peach: '\x1b[38;2;250;179;135m',
  mauve: '\x1b[38;2;203;166;247m',
  yellow: '\x1b[38;2;249;226;175m',
  red: '\x1b[38;2;243;139;168m',
  teal: '\x1b[38;2;148;226;213m',

  // Box drawing
  boxLight: '\x1b[38;2;88;91;112m',
};

// Box drawing characters
const box = {
  h: '─',
  v: '│',
  tl: '╭',
  tr: '╮',
  bl: '╰',
  br: '╯',
};

// Time data
const now = new Date('2024-02-07T14:30:00Z');
const cities = [
  { name: '🏠 San Francisco', offset: -8, abbr: 'PST' },
  { name: 'New York', offset: -5, abbr: 'EST', selected: true },
  { name: 'London', offset: 0, abbr: 'GMT' },
  { name: 'Paris', offset: 1, abbr: 'CET' },
  { name: 'Dubai', offset: 4, abbr: 'GST' },
  { name: 'Tokyo', offset: 9, abbr: 'JST' },
];

function getHourColor(hour) {
  if (hour >= 6 && hour < 9) return colors.yellow;  // Dawn
  if (hour >= 9 && hour < 17) return colors.green;  // Business hours
  if (hour >= 17 && hour < 21) return colors.peach; // Evening
  return colors.dim + colors.subtext;  // Night
}

function formatHour(hour, is24h = false) {
  if (is24h) return String(hour).padStart(2, '0');
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return String(h).padStart(2, ' ');
}

function generateScreen() {
  const width = 80;
  const lines = [];

  // Clear screen and reset
  lines.push('\x1b[2J\x1b[H');

  // Status bar
  lines.push(colors.bg + colors.accent + colors.bold + ' 󰥔 tzone-buddy' + colors.reset);
  lines.push(colors.bg + colors.text + '  Wed, Feb 7 2024  2:30 PM' + colors.reset);
  lines.push(colors.bg + colors.green + colors.bold + '                                                                    NOW' + colors.reset);
  lines.push('');

  // Timeline header (hours)
  let headerLine = '                      ';
  for (let i = 0; i < 12; i++) {
    const hour = (6 + i) % 24;
    headerLine += getHourColor(hour) + formatHour(hour) + ' ' + colors.reset;
  }
  lines.push(headerLine);

  // City rows
  cities.forEach((city, idx) => {
    const localHour = (now.getUTCHours() + city.offset + 24) % 24;
    const startHour = 6; // Start display at 6 AM

    let line = '';

    // Selection indicator
    if (city.selected) {
      line += colors.accent + '▶ ' + colors.reset;
    } else {
      line += '  ';
    }

    // City name and time
    const cityTime = new Date(now.getTime() + city.offset * 3600000);
    const timeStr = cityTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    // City label (20 chars width)
    const cityLabel = city.name.padEnd(13) + ' ' + timeStr.padStart(7);

    if (idx === 0) {
      line += colors.blue + cityLabel + colors.reset;
    } else if (city.selected) {
      line += colors.bold + colors.text + cityLabel + colors.reset;
    } else {
      line += colors.subtext + cityLabel + colors.reset;
    }

    // Hour cells
    for (let i = 0; i < 12; i++) {
      const hour = (startHour + i) % 24;
      const isCurrentHour = hour === localHour;

      if (isCurrentHour) {
        line += colors.bg + getHourColor(hour) + colors.bold + ' ● ' + colors.reset;
      } else {
        line += colors.boxLight + ' · ' + colors.reset;
      }
    }

    lines.push(line);
  });

  // Time slider bar
  lines.push('');
  lines.push(colors.boxLight + '  ' + '─'.repeat(20) + colors.green + '●' + colors.boxLight + '─'.repeat(55) + colors.reset);

  // Hint bar
  lines.push('');
  const hints = [
    ['a', 'Add'],
    ['d', 'Del'],
    ['←→', 'Slide'],
    ['S-↑↓', 'Move'],
    ['r', 'Reset'],
    ['t', '12/24h'],
    ['c', 'Theme'],
    ['?', 'Help'],
    ['q', 'Quit']
  ];

  let hintLine = ' ';
  hints.forEach(([key, label]) => {
    hintLine += colors.blue + key + colors.reset + colors.subtext + ' ' + label + '  ' + colors.reset;
  });
  lines.push(hintLine);

  return lines.join('\n');
}

// Generate and output the screenshot
const screenshot = generateScreen();
console.log(screenshot);

// Also save to file for reference
fs.writeFileSync('screenshot_ansi.txt', screenshot);
console.log('\n\nScreenshot saved to screenshot_ansi.txt');