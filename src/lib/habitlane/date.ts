import { WEEKDAYS, type Weekday } from "@/lib/habitlane/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcNoon(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function shiftDate(dateStr: string, offset: number): string {
  const date = toUtcNoon(dateStr);
  date.setUTCDate(date.getUTCDate() + offset);
  return formatDate(date);
}

export function daysBetween(startDate: string, endDate: string): number {
  return Math.round((toUtcNoon(endDate).getTime() - toUtcNoon(startDate).getTime()) / DAY_MS);
}

export function compareDates(left: string, right: string): number {
  return daysBetween(left, right);
}

export function getWeekday(dateStr: string): Weekday {
  const index = toUtcNoon(dateStr).getUTCDay();
  return WEEKDAYS[(index + 6) % 7];
}

export function getPacificDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function formatLongDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(toUtcNoon(dateStr));
}

export function getRelativeLabel(targetDate: string, referenceDate: string): string {
  const distance = compareDates(referenceDate, targetDate);

  if (distance === 0) {
    return "Today";
  }

  if (distance === 1) {
    return "Tomorrow";
  }

  if (distance === -1) {
    return "Yesterday";
  }

  return formatLongDate(targetDate);
}
