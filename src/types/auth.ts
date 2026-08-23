export interface User {
  id: string;
  _id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  otpVerified?: boolean;
  group?: Group | string;
}

export interface Group {
  id: string;
  _id?: string;
  name?: string;
  code?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: User;
}

export interface OtpResponse {
  message?: string;
  success?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  [key: string]: unknown;
}

export interface OtpGeneratePayload {
  email: string;
}

export interface OtpVerifyPayload {
  email: string;
  otp: string;
}

export type AuthStatus =
  "uninitialized" | "hydrating" | "authenticated" | "unauthenticated";

export function hasRole(user: User | undefined, role: string): boolean {
  return user?.role?.toLowerCase() === role.toLowerCase();
}

export function isAdmin(user: User | undefined): boolean {
  return hasRole(user, "Admin");
}
