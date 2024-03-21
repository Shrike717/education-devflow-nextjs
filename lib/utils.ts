// This code belongs to the configuration of ShadCn. Was created automatically during initialization
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import qs from "query-string";
import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";

// This code belongs to the configuration of ShadCn. Was created automatically during initialization
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} // This is a library to parse and stringify URL query strings

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

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

// This function checks the curreent URL. Maybe we have some filters, categories etc.
// It keeps all of those and only updates the key we are interested in while keeping the rest.
export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  // First we want to get access to the current URL:
  const currentUrl = qs.parse(params);

  // Then we want to set the new value for the key we are updating:
  currentUrl[key] = value;

  // Then we want to stringify and return the new URL:
  return qs.stringifyUrl(
    {
      url: window.location.pathname, // Here we first get the base pathname
      query: currentUrl, // Then we add the query
    },
    { skipNull: true } // This is to skip null values
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

// This function checks the current URL. Maybe we have some filters, categories etc.
// It rremoves the key of the query when we delete the values in the local search bar.
export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  // First we want to get access to the current URL:
  const currentUrl = qs.parse(params);

  // Then we want to remove the keys we are not interested in:
  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  // Then we want to stringify and return the new URL:
  return qs.stringifyUrl(
    {
      url: window.location.pathname, // Here we first get the base pathname
      query: currentUrl, // Then we add the query
    },
    { skipNull: true } // This is to skip null values
  );
};

interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}

// This function checks how many badges the user has and returns the badge counts.
export const assignBadges = (params: BadgeParam) => {
  // First we have to create an object which stores the badge type and the count of the badge initially:
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  // Then we need to destruct the criteria from the params:
  const { criteria } = params;

  // Then we need to iterate over the criteria and assign the badge counts:
  criteria.forEach((item) => {
    // First we need to get the type and the count of the badge:
    const { type, count } = item;

    // Then we want to figure out the badge levels. BADGE_CRITERIA is an object that stores the badge criteria for each type:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badgeLevels: any = BADGE_CRITERIA[type];

    // Then we want to iterate over the badge levels and assign the badge counts:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });

  // Finally we want to return the badge counts:
  return badgeCounts;
};
