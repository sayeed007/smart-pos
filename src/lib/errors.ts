import type { ApiError } from "@/types";

export function getErrorMessage(
  error: unknown,
  fallback = "An error occurred",
): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const apiError = error as ApiError;
    return (
      apiError.response?.data?.message ||
      apiError.response?.data?.error ||
      apiError.message ||
      fallback
    );
  }

  return fallback;
}
