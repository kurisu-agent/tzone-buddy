import type { City } from "../types/index.js";

export const cities: City[] = [
  // North America
  { name: "New York", timezone: "America/New_York", country: "US" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "US" },
  { name: "Chicago", timezone: "America/Chicago", country: "US" },
  { name: "Denver", timezone: "America/Denver", country: "US" },
  { name: "Phoenix", timezone: "America/Phoenix", country: "US" },
  { name: "Anchorage", timezone: "America/Anchorage", country: "US" },
  { name: "Honolulu", timezone: "Pacific/Honolulu", country: "US" },
  { name: "Toronto", timezone: "America/Toronto", country: "CA" },
  { name: "Vancouver", timezone: "America/Vancouver", country: "CA" },
  { name: "Montreal", timezone: "America/Montreal", country: "CA" },
  { name: "Edmonton", timezone: "America/Edmonton", country: "CA" },
  { name: "Winnipeg", timezone: "America/Winnipeg", country: "CA" },
  { name: "Halifax", timezone: "America/Halifax", country: "CA" },
  { name: "St. John's", timezone: "America/St_Johns", country: "CA" },
  { name: "Mexico City", timezone: "America/Mexico_City", country: "MX" },
  { name: "Cancún", timezone: "America/Cancun", country: "MX" },
  { name: "San Juan", timezone: "America/Puerto_Rico", country: "PR" },
  { name: "Detroit", timezone: "America/Detroit", country: "US" },
  { name: "Houston", timezone: "America/Chicago", country: "US" },
  { name: "San Francisco", timezone: "America/Los_Angeles", country: "US" },
  { name: "Seattle", timezone: "America/Los_Angeles", country: "US" },
  { name: "Miami", timezone: "America/New_York", country: "US" },
  { name: "Atlanta", timezone: "America/New_York", country: "US" },
  { name: "Boston", timezone: "America/New_York", country: "US" },
  { name: "Dallas", timezone: "America/Chicago", country: "US" },
  { name: "Minneapolis", timezone: "America/Chicago", country: "US" },
  { name: "Philadelphia", timezone: "America/New_York", country: "US" },
  { name: "Washington DC", timezone: "America/New_York", country: "US" },

  // Central & South America
  { name: "São Paulo", timezone: "America/Sao_Paulo", country: "BR" },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", country: "AR" },
  { name: "Santiago", timezone: "America/Santiago", country: "CL" },
  { name: "Lima", timezone: "America/Lima", country: "PE" },
  { name: "Bogotá", timezone: "America/Bogota", country: "CO" },
  { name: "Caracas", timezone: "America/Caracas", country: "VE" },
  { name: "Havana", timezone: "America/Havana", country: "CU" },
  { name: "Panama City", timezone: "America/Panama", country: "PA" },
  { name: "Montevideo", timezone: "America/Montevideo", country: "UY" },
  { name: "Quito", timezone: "America/Guayaquil", country: "EC" },
  { name: "La Paz", timezone: "America/La_Paz", country: "BO" },
  { name: "Asunción", timezone: "America/Asuncion", country: "PY" },
  { name: "Rio de Janeiro", timezone: "America/Sao_Paulo", country: "BR" },

  // Europe
  { name: "London", timezone: "Europe/London", country: "GB" },
  { name: "Paris", timezone: "Europe/Paris", country: "FR" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "DE" },
  { name: "Madrid", timezone: "Europe/Madrid", country: "ES" },
  { name: "Rome", timezone: "Europe/Rome", country: "IT" },
  { name: "Amsterdam", timezone: "Europe/Amsterdam", country: "NL" },
  { name: "Brussels", timezone: "Europe/Brussels", country: "BE" },
  { name: "Zurich", timezone: "Europe/Zurich", country: "CH" },
  { name: "Vienna", timezone: "Europe/Vienna", country: "AT" },
  { name: "Stockholm", timezone: "Europe/Stockholm", country: "SE" },
  { name: "Oslo", timezone: "Europe/Oslo", country: "NO" },
  { name: "Copenhagen", timezone: "Europe/Copenhagen", country: "DK" },
  { name: "Helsinki", timezone: "Europe/Helsinki", country: "FI" },
  { name: "Warsaw", timezone: "Europe/Warsaw", country: "PL" },
  { name: "Prague", timezone: "Europe/Prague", country: "CZ" },
  { name: "Budapest", timezone: "Europe/Budapest", country: "HU" },
  { name: "Bucharest", timezone: "Europe/Bucharest", country: "RO" },
  { name: "Athens", timezone: "Europe/Athens", country: "GR" },
  { name: "Istanbul", timezone: "Europe/Istanbul", country: "TR" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "RU" },
  { name: "Dublin", timezone: "Europe/Dublin", country: "IE" },
  { name: "Lisbon", timezone: "Europe/Lisbon", country: "PT" },
  { name: "Edinburgh", timezone: "Europe/London", country: "GB" },
  { name: "Munich", timezone: "Europe/Berlin", country: "DE" },
  { name: "Barcelona", timezone: "Europe/Madrid", country: "ES" },
  { name: "Milan", timezone: "Europe/Rome", country: "IT" },
  { name: "Kyiv", timezone: "Europe/Kyiv", country: "UA" },
  { name: "Belgrade", timezone: "Europe/Belgrade", country: "RS" },
  { name: "Sofia", timezone: "Europe/Sofia", country: "BG" },
  { name: "Tallinn", timezone: "Europe/Tallinn", country: "EE" },
  { name: "Riga", timezone: "Europe/Riga", country: "LV" },
  { name: "Vilnius", timezone: "Europe/Vilnius", country: "LT" },
  { name: "Reykjavik", timezone: "Atlantic/Reykjavik", country: "IS" },

  // Middle East
  { name: "Dubai", timezone: "Asia/Dubai", country: "AE" },
  { name: "Riyadh", timezone: "Asia/Riyadh", country: "SA" },
  { name: "Tehran", timezone: "Asia/Tehran", country: "IR" },
  { name: "Doha", timezone: "Asia/Qatar", country: "QA" },
  { name: "Kuwait City", timezone: "Asia/Kuwait", country: "KW" },
  { name: "Tel Aviv", timezone: "Asia/Jerusalem", country: "IL" },
  { name: "Amman", timezone: "Asia/Amman", country: "JO" },
  { name: "Beirut", timezone: "Asia/Beirut", country: "LB" },
  { name: "Baghdad", timezone: "Asia/Baghdad", country: "IQ" },
  { name: "Muscat", timezone: "Asia/Muscat", country: "OM" },

  // Africa
  { name: "Cairo", timezone: "Africa/Cairo", country: "EG" },
  { name: "Lagos", timezone: "Africa/Lagos", country: "NG" },
  { name: "Nairobi", timezone: "Africa/Nairobi", country: "KE" },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", country: "ZA" },
  { name: "Cape Town", timezone: "Africa/Johannesburg", country: "ZA" },
  { name: "Casablanca", timezone: "Africa/Casablanca", country: "MA" },
  { name: "Accra", timezone: "Africa/Accra", country: "GH" },
  { name: "Addis Ababa", timezone: "Africa/Addis_Ababa", country: "ET" },
  { name: "Dar es Salaam", timezone: "Africa/Dar_es_Salaam", country: "TZ" },
  { name: "Tunis", timezone: "Africa/Tunis", country: "TN" },
  { name: "Algiers", timezone: "Africa/Algiers", country: "DZ" },
  { name: "Kinshasa", timezone: "Africa/Kinshasa", country: "CD" },

  // South Asia
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Delhi", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Bangalore", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Chennai", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Kolkata", timezone: "Asia/Kolkata", country: "IN" },
  { name: "Karachi", timezone: "Asia/Karachi", country: "PK" },
  { name: "Lahore", timezone: "Asia/Karachi", country: "PK" },
  { name: "Dhaka", timezone: "Asia/Dhaka", country: "BD" },
  { name: "Colombo", timezone: "Asia/Colombo", country: "LK" },
  { name: "Kathmandu", timezone: "Asia/Kathmandu", country: "NP" },

  // East & Southeast Asia
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" },
  { name: "Osaka", timezone: "Asia/Tokyo", country: "JP" },
  { name: "Shanghai", timezone: "Asia/Shanghai", country: "CN" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "CN" },
  { name: "Hong Kong", timezone: "Asia/Hong_Kong", country: "HK" },
  { name: "Taipei", timezone: "Asia/Taipei", country: "TW" },
  { name: "Seoul", timezone: "Asia/Seoul", country: "KR" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "SG" },
  { name: "Bangkok", timezone: "Asia/Bangkok", country: "TH" },
  { name: "Ho Chi Minh City", timezone: "Asia/Ho_Chi_Minh", country: "VN" },
  { name: "Hanoi", timezone: "Asia/Ho_Chi_Minh", country: "VN" },
  { name: "Jakarta", timezone: "Asia/Jakarta", country: "ID" },
  { name: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", country: "MY" },
  { name: "Manila", timezone: "Asia/Manila", country: "PH" },
  { name: "Yangon", timezone: "Asia/Yangon", country: "MM" },
  { name: "Phnom Penh", timezone: "Asia/Phnom_Penh", country: "KH" },

  // Central Asia
  { name: "Almaty", timezone: "Asia/Almaty", country: "KZ" },
  { name: "Tashkent", timezone: "Asia/Tashkent", country: "UZ" },
  { name: "Tbilisi", timezone: "Asia/Tbilisi", country: "GE" },
  { name: "Baku", timezone: "Asia/Baku", country: "AZ" },
  { name: "Yerevan", timezone: "Asia/Yerevan", country: "AM" },

  // Oceania
  { name: "Sydney", timezone: "Australia/Sydney", country: "AU" },
  { name: "Melbourne", timezone: "Australia/Melbourne", country: "AU" },
  { name: "Brisbane", timezone: "Australia/Brisbane", country: "AU" },
  { name: "Perth", timezone: "Australia/Perth", country: "AU" },
  { name: "Adelaide", timezone: "Australia/Adelaide", country: "AU" },
  { name: "Auckland", timezone: "Pacific/Auckland", country: "NZ" },
  { name: "Wellington", timezone: "Pacific/Auckland", country: "NZ" },
  { name: "Fiji", timezone: "Pacific/Fiji", country: "FJ" },
  { name: "Guam", timezone: "Pacific/Guam", country: "GU" },
];

export const defaultCities: City[] = [
  { name: "London", timezone: "Europe/London", country: "GB" },
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" },
];

/** Look up the system timezone in the city DB, or synthesize a city from the IANA id. */
export function getHomeCity(): City {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = cities.find((c) => c.timezone === tz);
  if (match) return { ...match };
  // Derive a readable name from the IANA id: "America/New_York" → "New York"
  const name = tz.split("/").pop()!.replace(/_/g, " ");
  return { name, timezone: tz, country: "" };
}
