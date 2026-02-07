import { createContext, useContext } from "react";
import type { Theme } from "../data/themes.js";
import { themes } from "../data/themes.js";

export const ThemeContext = createContext<Theme>(themes[0]);

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
