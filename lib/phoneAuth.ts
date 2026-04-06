"use client";

// Client-side phone auth utilities
// Token stored in localStorage, session validated via Convex query

const TOKEN_KEY = "wearify_auth_token";
const USER_KEY = "wearify_auth_user";

export type AuthUser = {
  phone: string;
  name: string;
  role: string;
  storeId?: string;
  tailorId?: string;
  storeName?: string;
  customerId?: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function formatPhone(raw: string): string {
  // Strip non-digits
  let digits = raw.replace(/\D/g, "");
  // Remove leading 91 if user typed it
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }
  // Limit to 10 digits
  return digits.slice(0, 10);
}

export function fullPhone(digits: string): string {
  return `+91${digits}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && /^[6-9]/.test(digits);
}
