import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export // Helper to get available dates on the server (today + next 3 non-Sunday days)
const getAvailableDatesServer = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  for (let i = 0; i < 4; i++) {
    // Loop for today and next 3 days (total 4)
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Check if it's not a Sunday (Sunday is 0)
    if (date.getDay() !== 0) {
      dates.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    } else {
      // If it's a Sunday, we still want 4 valid days, so decrement 'i' to skip Sunday
      i--;
    }
  }
  return dates;
};
