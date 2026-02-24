import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateUUID(): Promise<string> {
  // 1. First try native crypto
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 2. Fallback to API
  try {
    const response = await fetch("/api/uuid");
    if (response.ok) {
      const data = await response.json();
      if (data.uuid) {
        return data.uuid;
      }
    }
  } catch (error) {
    console.error(
      "Failed to fetch UUID from API, falling back to Math.random",
      error,
    );
  }

  // 3. Last fallback (Math.random)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
