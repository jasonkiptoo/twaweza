import { api, authHeaders } from "./api";
import type {
  AuthResponse,
  LoginPayload,
  OtpGeneratePayload,
  OtpResponse,
  OtpVerifyPayload,
  SignupPayload,
  User,
} from "@/types/auth";

export interface UsernameAvailabilityResponse {
  available?: boolean;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function getCurrentUser(token: string): Promise<User> {
  const { data } = await api.get<User>("/auth/me", {
    headers: authHeaders(token),
  });
  return data;
}

export async function signup(payload: SignupPayload) {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function generateOtp(
  payload: OtpGeneratePayload,
  token?: string,
): Promise<OtpResponse> {
  const { data } = await api.post<OtpResponse>(
    "/auth/generate-otp",
    payload,
    token ? { headers: authHeaders(token) } : undefined,
  );
  return data;
}

export async function verifyOtp(
  payload: OtpVerifyPayload,
  token?: string,
): Promise<OtpResponse> {
  const { data } = await api.post<OtpResponse>(
    "/otp/verify",
    payload,
    token ? { headers: authHeaders(token) } : undefined,
  );
  return data;
}

export async function verifyGroupCode(code: string) {
  const { data } = await api.post("/auth/verify-group-by-code", {
    code: code.trim().toUpperCase(),
  });
  return data;
}

export async function checkUsername(
  username: string,
): Promise<UsernameAvailabilityResponse> {
  const { data } = await api.get<UsernameAvailabilityResponse>(
    "/auth/check-username",
    { params: { username } },
  );
  return data;
}
