import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a duration in seconds into a human-readable string (e.g., 1h 30m 15s).
 * If the value is 0, returns "0s".
 */
export function formatDuration(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  if (absSeconds === 0) return "0s";
  
  const days = Math.floor(absSeconds / 86400);
  const hours = Math.floor((absSeconds % 86400) / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = Math.floor(absSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  const formatted = parts.join(" ");
  return seconds < 0 ? `-${formatted}` : formatted;
}

/**
 * Checks if a unit string represents a time-based unit.
 */
export function isTimeUnit(unit: string): boolean {
  const timeUnits = [
    "second", "seconds", "sec", "s", 
    "minute", "minutes", "min", "m", 
    "hour", "hours", "hr", "h", 
    "day", "days", "d",
    "week", "weeks", "w",
    "month", "months", "mo",
    "year", "years", "y"
  ];
  return timeUnits.includes(unit.toLowerCase());
}

/**
 * Gets the multiplier to convert a unit down to seconds, resolving through the hierarchy.
 */
export function getMultiplier(unit: string, hierarchy: Record<string, Record<string, number>> = {}): number {
  const TIME_UNITS: Record<string, number> = {
    second: 1, seconds: 1, sec: 1, s: 1,
    minute: 60, minutes: 60, min: 60, m: 60,
    hour: 3600, hours: 3600, hr: 3600, h: 3600,
    day: 86400, days: 86400, d: 86400,
    week: 604800, weeks: 604800, w: 604800,
    month: 2592000, months: 2592000, mo: 2592000, // 30 days
    year: 31536000, years: 31536000, y: 31536000 // 365 days
  };

  const lower = unit.toLowerCase();
  if (TIME_UNITS[lower]) return TIME_UNITS[lower];

  const resolve = (u: string, visited = new Set<string>()): number => {
    if (TIME_UNITS[u.toLowerCase()]) return TIME_UNITS[u.toLowerCase()];
    if (visited.has(u)) return 0;
    visited.add(u);
    
    const convs = hierarchy[u];
    if (!convs) return 0;
    
    for (const [next, mult] of Object.entries(convs)) {
      const res = resolve(next, visited);
      if (res > 0) return (mult as number) * res;
    }
    return 0;
  };

  return resolve(unit);
}

/**
 * Converts a value from seconds back to a target unit using the provided hierarchy.
 */
export function convertFromSeconds(seconds: number, targetUnit: string, hierarchy: Record<string, Record<string, number>> = {}): number {
  const mult = getMultiplier(targetUnit, hierarchy);
  return mult > 0 ? seconds / mult : seconds;
}

/**
 * Formats a timezone offset in minutes to a human-friendly string (e.g., GMT +05:30).
 */
export function formatTimezoneOffset(offsetMinutes: number): string {
  const absOffset = Math.abs(offsetMinutes);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  const sign = offsetMinutes >= 0 ? "+" : "-";
  return `GMT ${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Parses a human-friendly timezone string back to minutes.
 * Supports format: GMT +05:30 or +05:30 or 05:30
 */
export function parseTimezoneOffset(formatted: string): number | null {
  const regex = /(?:GMT\s*)?([+-])?(\d{1,2}):(\d{2})/;
  const match = formatted.match(regex);
  if (!match) return null;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = parseInt(match[2]);
  const minutes = parseInt(match[3]);
  return sign * (hours * 60 + minutes);
}

/**
 * Calculates the current logical date based on timezone offset and day start hour.
 */
export function getLogicalDate(offsetMinutes: number, dayStartHour: number): string {
  const now = new Date();
  // Adjust to the user's local time based on the offset stored in DB
  // offsetMinutes is minutes from UTC (e.g. 330 for IST)
  const localTime = new Date(now.getTime() + (offsetMinutes * 60000));
  
  // If the local hour is before the day start hour, it's logically "yesterday"
  if (localTime.getUTCHours() < dayStartHour) {
    localTime.setUTCDate(localTime.getUTCDate() - 1);
  }
  
  return localTime.toISOString().split('T')[0];
}
