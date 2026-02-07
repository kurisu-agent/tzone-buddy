import { useEffect, useRef } from "react";
import type { City, AppConfig } from "../types/index.js";
import { loadConfig, saveConfig } from "../lib/config.js";

export function useConfig(
  cities: City[],
  setCities: (cities: City[]) => void,
): void {
  const config = useRef<AppConfig>(loadConfig());
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const loaded = loadConfig();
      config.current = loaded;
      if (loaded.cities.length > 0) {
        setCities(loaded.cities);
      }
    }
  }, [setCities]);

  // Auto-save when cities change (only the user list, not home)
  useEffect(() => {
    if (!initialized.current) return;
    const newConfig: AppConfig = {
      ...config.current,
      cities,
    };
    config.current = newConfig;
    saveConfig(newConfig);
  }, [cities]);
}
