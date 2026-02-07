import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { defaultCities } from "../data/cities.js";
import type { AppConfig } from "../types/index.js";

function getConfigDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(xdg, "tzone-buddy");
}

function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function loadConfig(): AppConfig {
  const path = getConfigPath();
  if (existsSync(path)) {
    try {
      const data = JSON.parse(readFileSync(path, "utf-8"));
      if (data.version === 1 && Array.isArray(data.cities)) {
        return data as AppConfig;
      }
    } catch {
      // Fall through to defaults
    }
  }
  return {
    version: 1,
    homeTimezone: getSystemTimezone(),
    cities: [...defaultCities],
  };
}

export function saveConfig(config: AppConfig): void {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2) + "\n");
}
