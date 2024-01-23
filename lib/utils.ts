// Dieser Code gehört zur Konfiguration von ShadCn. Wurde automatisch beim initialisieren angelegt
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Dieser Code gehört zur Konfiguration von ShadCn. Wurde automatisch beim initialisieren angelegt
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hilfsfunktion, um aus einem Datum einen Timestamp zu generieren.
// Gibt den Timestamp als String zurück.
// Mit Chad GPT erstellt
export function getTimestamp(createdAt: Date): string {
  const now = new Date();
  const timeDifference = now - createdAt;

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

// Diese Hilfsfunktion wandelt Big Numbers in eine lesbare Form um:
// 1.000.000 -> 1M
// 1.000 -> 1k
// Mit Chad GPT erstellt
export function formatBigNumber(number: number): string {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "k";
  } else {
    return number.toString();
  }
}
