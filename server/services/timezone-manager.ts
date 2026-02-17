/**
 * Timezone Management
 * 
 * Handles timezone conversions for scheduled posts.
 * Ensures posts are published at the correct local time regardless of server timezone.
 */

import { logger } from "../logger";

/**
 * Common timezone mappings
 */
export const TIMEZONES = {
    // US Timezones
    "America/New_York": { offset: -5, dst: true, label: "Eastern Time (ET)" },
    "America/Chicago": { offset: -6, dst: true, label: "Central Time (CT)" },
    "America/Denver": { offset: -7, dst: true, label: "Mountain Time (MT)" },
    "America/Los_Angeles": { offset: -8, dst: true, label: "Pacific Time (PT)" },
    "America/Phoenix": { offset: -7, dst: false, label: "Arizona Time" },
    "America/Anchorage": { offset: -9, dst: true, label: "Alaska Time (AKT)" },
    "Pacific/Honolulu": { offset: -10, dst: false, label: "Hawaii Time (HT)" },

    // European Timezones
    "Europe/London": { offset: 0, dst: true, label: "British Time (GMT/BST)" },
    "Europe/Paris": { offset: 1, dst: true, label: "Central European Time (CET)" },
    "Europe/Berlin": { offset: 1, dst: true, label: "Central European Time (CET)" },
    "Europe/Rome": { offset: 1, dst: true, label: "Central European Time (CET)" },

    // Asian Timezones
    "Asia/Tokyo": { offset: 9, dst: false, label: "Japan Standard Time (JST)" },
    "Asia/Shanghai": { offset: 8, dst: false, label: "China Standard Time (CST)" },
    "Asia/Dubai": { offset: 4, dst: false, label: "Gulf Standard Time (GST)" },
    "Asia/Kolkata": { offset: 5.5, dst: false, label: "India Standard Time (IST)" },

    // Other
    "Australia/Sydney": { offset: 10, dst: true, label: "Australian Eastern Time (AET)" },
    "UTC": { offset: 0, dst: false, label: "Coordinated Universal Time (UTC)" },
};

/**
 * Convert local time to UTC
 */
export function toUTC(localDate: Date, timezone: string): Date {
    try {
        // Use Intl.DateTimeFormat to get the timezone offset
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const parts = formatter.formatToParts(localDate);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value || "0";

        const year = parseInt(getPart("year"));
        const month = parseInt(getPart("month")) - 1; // 0-indexed
        const day = parseInt(getPart("day"));
        const hour = parseInt(getPart("hour"));
        const minute = parseInt(getPart("minute"));
        const second = parseInt(getPart("second"));

        // Create date in the specified timezone
        const tzDate = new Date(Date.UTC(year, month, day, hour, minute, second));

        // Get the offset by comparing with local interpretation
        const localInterpretation = new Date(year, month, day, hour, minute, second);
        const offset = localInterpretation.getTime() - localDate.getTime();

        // Apply offset to get UTC
        return new Date(localDate.getTime() - offset);
    } catch (error: any) {
        logger.error(`Error converting to UTC for timezone ${timezone}:`, error);
        // Fallback: assume input is already UTC
        return new Date(localDate);
    }
}

/**
 * Convert UTC to local time
 */
export function toLocal(utcDate: Date, timezone: string): Date {
    try {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const parts = formatter.formatToParts(utcDate);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value || "0";

        const year = parseInt(getPart("year"));
        const month = parseInt(getPart("month")) - 1;
        const day = parseInt(getPart("day"));
        const hour = parseInt(getPart("hour"));
        const minute = parseInt(getPart("minute"));
        const second = parseInt(getPart("second"));

        return new Date(year, month, day, hour, minute, second);
    } catch (error: any) {
        logger.error(`Error converting to local for timezone ${timezone}:`, error);
        return new Date(utcDate);
    }
}

/**
 * Get current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
    return toLocal(new Date(), timezone);
}

/**
 * Format time for display in a specific timezone
 */
export function formatInTimezone(
    date: Date,
    timezone: string,
    options: Intl.DateTimeFormatOptions = {}
): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string): number {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Validate timezone string
 */
export function isValidTimezone(timezone: string): boolean {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get all available timezones (simplified list)
 */
export function getAvailableTimezones(): Array<{
    value: string;
    label: string;
    offset: number;
    dst: boolean;
}> {
    return Object.entries(TIMEZONES).map(([value, info]) => ({
        value,
        label: info.label,
        offset: info.offset,
        dst: info.dst,
    }));
}

/**
 * Parse timezone-aware date string
 */
export function parseDateWithTimezone(
    dateString: string,
    timezone: string
): Date {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${dateString}`);
    }

    // If the date string includes timezone info, use it
    if (dateString.includes("Z") || dateString.includes("+") || /[+-]\d{2}:\d{2}$/.test(dateString)) {
        return date;
    }

    // Otherwise, treat as local time in the specified timezone
    return toUTC(date, timezone);
}

/**
 * Calculate time until scheduled post in user's timezone
 */
export function getTimeUntilScheduled(
    scheduledFor: Date,
    timezone: string
): {
    days: number;
    hours: number;
    minutes: number;
    totalMinutes: number;
    humanReadable: string;
} {
    const now = getCurrentTimeInTimezone(timezone);
    const totalMinutes = Math.max(0, Math.floor((scheduledFor.getTime() - now.getTime()) / (1000 * 60)));

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    let humanReadable = "";

    if (days > 0) {
        humanReadable = `${days}d ${hours}h`;
    } else if (hours > 0) {
        humanReadable = `${hours}h ${minutes}m`;
    } else {
        humanReadable = `${minutes}m`;
    }

    return {
        days,
        hours,
        minutes,
        totalMinutes,
        humanReadable,
    };
}

/**
 * Check if a time is within business hours for a timezone
 */
export function isBusinessHours(
    date: Date,
    timezone: string,
    start: number = 9, // 9 AM
    end: number = 17   // 5 PM
): boolean {
    const localTime = toLocal(date, timezone);
    const hour = localTime.getHours();

    return hour >= start && hour < end;
}

/**
 * Suggest optimal posting time based on timezone
 */
export function suggestOptimalPostingTime(
    timezone: string,
    preferredHours: number[] = [9, 12, 17, 20] // 9 AM, 12 PM, 5 PM, 8 PM
): Date {
    const now = getCurrentTimeInTimezone(timezone);
    const currentHour = now.getHours();

    // Find next preferred hour
    const nextHour = preferredHours.find(h => h > currentHour) || preferredHours[0];

    const suggested = new Date(now);
    suggested.setHours(nextHour, 0, 0, 0);

    // If we wrapped to next day, add a day
    if (nextHour <= currentHour) {
        suggested.setDate(suggested.getDate() + 1);
    }

    return toUTC(suggested, timezone);
}

export const TimezoneManager = {
    toUTC,
    toLocal,
    getCurrentTimeInTimezone,
    formatInTimezone,
    getTimezoneOffset,
    isValidTimezone,
    getAvailableTimezones,
    parseDateWithTimezone,
    getTimeUntilScheduled,
    isBusinessHours,
    suggestOptimalPostingTime,
};
