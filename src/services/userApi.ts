import { api, authHeaders } from "./api";
import type { User } from "@/types/auth";

export async function getCurrentUser(token: string): Promise<User> {
  const { data } = await api.get<User>("/auth/me", {
    headers: authHeaders(token),
  });
  return data;
}

export async function getUserSummary(token: string) {
  const { data } = await api.get("/auth/user-summary", {
    headers: authHeaders(token),
  });
  return data;
}
