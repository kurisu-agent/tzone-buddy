import { useCallback, useState } from "react";
import type { City } from "../types/index.js";

export function useCityList(initialCities: City[]) {
  const [cities, setCities] = useState<City[]>(initialCities);

  const addCity = useCallback((city: City) => {
    setCities((prev) => {
      if (prev.some((c) => c.name === city.name && c.timezone === city.timezone))
        return prev;
      return [...prev, city];
    });
  }, []);

  const removeCity = useCallback((index: number) => {
    setCities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveCity = useCallback((index: number, direction: 1 | -1) => {
    setCities((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }, []);

  return { cities, setCities, addCity, removeCity, moveCity };
}
