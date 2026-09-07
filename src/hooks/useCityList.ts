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

  const removeCity = useCallback((city: City) => {
    setCities((prev) =>
      prev.filter((c) => !(c.name === city.name && c.timezone === city.timezone)),
    );
  }, []);

  return { cities, setCities, addCity, removeCity };
}
