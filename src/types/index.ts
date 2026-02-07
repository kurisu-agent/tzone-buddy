export interface City {
  name: string;
  timezone: string;
  country: string;
}

export interface HourData {
  hour: number;
  period: TimePeriod;
  isCurrent: boolean;
  label: string;
}

export type TimePeriod = "night" | "morning" | "business" | "evening";

export type AppMode = "grid" | "search" | "help" | "confirmDelete";

export interface AppConfig {
  version: number;
  homeTimezone: string;
  cities: City[];
}

export interface TimezoneRowData {
  city: City;
  currentTime: string;
  abbreviation: string;
  dayOffset: string;
  hours: HourData[];
}
