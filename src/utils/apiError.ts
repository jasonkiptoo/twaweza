import axios from "axios";
import type { ApiError, ApiErrorDetail } from "@/types/api";

export function parseApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      details: [],
      isNetworkError: false,
      isAuthError: false,
    };
  }

  const data = error.response?.data as
    | { message?: string; error?: string; details?: ApiErrorDetail[] }
    | undefined;
  const status = error.response?.status;
  const details = Array.isArray(data?.details) ? data.details : [];
  const detailMessage =
    details.find((detail) => detail.msg || detail.message)?.msg ??
    details.find((detail) => detail.message)?.message;

  return {
    message:
      error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : (detailMessage ??
          data?.error ??
          data?.message ??
          (error.request
            ? "Unable to connect. Check your internet connection."
            : "Something went wrong. Please try again.")),
    status,
    details,
    isNetworkError: !error.response,
    isAuthError: status === 401 || status === 403,
  };
}

export function getApiErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

export function normalizeApiError(error: unknown): ApiError {
  return parseApiError(error);
}

export function getApiErrorDetails(error: unknown): ApiErrorDetail[] {
  return parseApiError(error).details;
}
