import type {
    AuthResponse,
    LoginPayload,
    OtpGeneratePayload,
    OtpResponse,
    OtpVerifyPayload,
    SignupPayload,
    User,
} from "@/types/auth";
import { api, authHeaders } from "./api";

export interface UsernameAvailabilityResponse {
  available?: boolean;
}

type ApiUser = Partial<User> & {
  _id?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
};

function normalizeUser(data: ApiUser): User {
  return {
    ...data,
    id: data.id ?? data._id ?? "",
    firstName: data.firstName ?? data.first_name,
    lastName: data.lastName ?? data.last_name,
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse & ApiUser>(
    "/auth/login",
    payload,
  );
  return {
    ...data,
    user:
      data.user || data.id || data._id
        ? normalizeUser(data.user ?? data)
        : undefined,
  };
}

export async function getCurrentUser(token: string): Promise<User> {
  const { data } = await api.get<ApiUser>("/auth/me", {
    headers: authHeaders(token),
  });
  return normalizeUser(data);
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

export async function forgotPasswordRequest(
  email: string,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { email: email.trim().toLowerCase() },
  );
  return data;
}

export async function resetPasswordRequest(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/reset-password", {
    token: token.trim(),
    password,
    confirmPassword,
  });
  return data;
}
