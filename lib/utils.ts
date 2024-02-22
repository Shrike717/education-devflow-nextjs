// This code belongs to the configuration of ShadCn. Was created automatically during initialization
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This code belongs to the configuration of ShadCn. Was created automatically during initialization
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to generate a timestamp from a date.
// Returns the timestamp as a string.
// Created with Chat GPT:
export function getTimestamp(createdAt: Date): string {
  const now = new Date();
  const timeDifference = now.getTime() - createdAt.getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }
}

// This helper function converts Big Numbers into a readable form:
// 1.000.000 -> 1M
// 1.000 -> 1k
// Created with Chat GPT:
export function formatBigNumber(number: number): string {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "k";
  } else {
    return number.toString();
  }
}

// This function gets a date object and returns a joined date string (Month, Year)
// Created with Chat GPT:
export function getJoinedDate(date: Date): string {
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}
