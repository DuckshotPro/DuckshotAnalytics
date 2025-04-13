import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
}

export function formatPercentage(value: number): string {
  return value.toFixed(1) + "%";
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatDateWithTime(date: Date): string {
  return format(date, "MMM d, yyyy, h:mm a");
}

export function getGrowthColor(value: number): string {
  return value >= 0 ? "text-green-500" : "text-red-500";
}

export function getGrowthIcon(value: number): string {
  return value >= 0 ? "up" : "down";
}
