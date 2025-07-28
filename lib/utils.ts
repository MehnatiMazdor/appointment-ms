import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get available dates on the server (today + next 3 non-Sunday days)
// export const getAvailableDatesServer = (): string[] => {
//   const dates: string[] = [];
//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // Normalize to start of day

//   for (let i = 0; i < 4; i++) {
//     // Loop for today and next 3 days (total 4)
//     const date = new Date(today);
//     date.setDate(today.getDate() + i);

//     // Check if it's not a Sunday (Sunday is 0)
//     if (date.getDay() !== 0) {
//       dates.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
//     } else {
//       // If it's a Sunday, we still want 4 valid days, so decrement 'i' to skip Sunday
//       i--;
//     }
//   }
//   return dates;
// };

  // export const getAvailableDatesServer = () => {
  //   const dates: string[] = []
  //   const today = new Date()

  //   // Set to local timezone to avoid date shifting issues
  //   today.setHours(0, 0, 0, 0)

  //   for (let i = 0; i < 10; i++) {
  //     const date = new Date(today)
  //     date.setDate(today.getDate() + i)

  //     // Skip Sundays (0 = Sunday)
  //     if (date.getDay() !== 0) {
  //       // Format as YYYY-MM-DD in local timezone
  //       const year = date.getFullYear()
  //       const month = String(date.getMonth() + 1).padStart(2, "0")
  //       const day = String(date.getDate()).padStart(2, "0")
  //       dates.push(`${year}-${month}-${day}`)
  //     }

  //     // Stop when we have 4 valid dates
  //     if (dates.length >= 2) break
  //   }

  //   return dates
  // }

export const getAvailableDatesServer = () => {
    const dates: string[] = [];
    // Use UTC methods to avoid timezone issues
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);  // Normalize to UTC midnight

    for (let i = 0; i < 2; i++) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() + i);

        // Skip Sundays (0 = Sunday)
        if (date.getUTCDay() !== 0) {
            // Format as YYYY-MM-DD using UTC values
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            dates.push(`${year}-${month}-${day}`);
        }

        if (dates.length >= 2) break;
    }

    return dates;
}