import axios from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) useAuthStore.getState().clearAuth();
    return Promise.reject(error);
  },
);

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getArrayResponse<T>(
  payload: unknown,
  keys: string[] = ["results", "data", "items"],
): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of keys)
    if (Array.isArray(record[key])) return record[key] as T[];
  return [];
}
