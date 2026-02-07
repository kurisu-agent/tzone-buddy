export interface Theme {
  name: string;
  base: [string, string, string];     // bg → surface → elevated
  primary: [string, string, string];  // dim → mid → bright text
  accent: [string, string, string];   // subtle → mid → vivid
  dawn: [string, string, string];     // morning → business → peak
  dusk: [string, string, string];     // night → evening → twilight
}

export const themes: Theme[] = [
  {
    name: "Catppuccin Mocha",
    base:    ["#11111b", "#1e1e2e", "#313244"],
    primary: ["#6c7086", "#a6adc8", "#cdd6f4"],
    accent:  ["#585b70", "#89b4fa", "#cba6f7"],
    dawn:    ["#74c7ec", "#a6e3a1", "#f9e2af"],
    dusk:    ["#45475a", "#7f849c", "#b4befe"],
  },
  {
    name: "Catppuccin Latte",
    base:    ["#eff1f5", "#ccd0da", "#bcc0cc"],
    primary: ["#9ca0b0", "#6c6f85", "#4c4f69"],
    accent:  ["#acb0be", "#1e66f5", "#8839ef"],
    dawn:    ["#209fb5", "#40a02b", "#df8e1d"],
    dusk:    ["#bcc0cc", "#8c8fa1", "#7287fd"],
  },
  {
    name: "Dracula",
    base:    ["#21222c", "#282a36", "#383a4c"],
    primary: ["#6272a4", "#bfbfbf", "#f8f8f2"],
    accent:  ["#44475a", "#8be9fd", "#bd93f9"],
    dawn:    ["#69c3ff", "#50fa7b", "#f1fa8c"],
    dusk:    ["#2d2f3f", "#6272a4", "#d6acff"],
  },
  {
    name: "Nord",
    base:    ["#2e3440", "#3b4252", "#434c5e"],
    primary: ["#4c566a", "#d8dee9", "#eceff4"],
    accent:  ["#616e88", "#81a1c1", "#b48ead"],
    dawn:    ["#88c0d0", "#a3be8c", "#ebcb8b"],
    dusk:    ["#3b4252", "#616e88", "#c2a5cf"],
  },
  {
    name: "Tokyo Night",
    base:    ["#16161e", "#1a1b26", "#24283b"],
    primary: ["#565f89", "#a9b1d6", "#c0caf5"],
    accent:  ["#3b4261", "#7aa2f7", "#bb9af7"],
    dawn:    ["#7dcfff", "#9ece6a", "#e0af68"],
    dusk:    ["#292e42", "#565f89", "#c3a6ff"],
  },
  {
    name: "Gruvbox Dark",
    base:    ["#1d2021", "#282828", "#3c3836"],
    primary: ["#665c54", "#d5c4a1", "#ebdbb2"],
    accent:  ["#504945", "#83a598", "#d3869b"],
    dawn:    ["#83a598", "#b8bb26", "#fabd2f"],
    dusk:    ["#3c3836", "#7c6f64", "#e2a5b1"],
  },
];
