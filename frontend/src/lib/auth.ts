import type { AuthResponse, User } from "@/types/api";

const TOKEN_KEY = "alphabox.token";
const USER_KEY = "alphabox.user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(USER_KEY);
  return value ? (JSON.parse(value) as User) : null;
}

export function storeAuth(auth: AuthResponse): void {
  window.localStorage.setItem(TOKEN_KEY, auth.access_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuth(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
