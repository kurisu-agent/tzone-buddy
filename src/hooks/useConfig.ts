import { useEffect, useRef } from "react";
import type { City, AppConfig } from "../types/index.js";
import { loadConfig, saveConfig } from "../lib/config.js";

export function useConfig(
  cities: City[],
  setCities: (cities: City[]) => void,
): { config: AppConfig } {
  const config = useRef<AppConfig>(loadConfig());
  const initialized = useRef(false);

  // Load config on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const loaded = loadConfig();
      config.current = loaded;
      setCities(loaded.cities);
    }
  }, [setCities]);

  // Auto-save when cities change
  useEffect(() => {
    if (!initialized.current) return;
    const newConfig: AppConfig = {
      ...config.current,
      cities,
    };
    config.current = newConfig;
    saveConfig(newConfig);
  }, [cities]);

  return { config: config.current };
}
