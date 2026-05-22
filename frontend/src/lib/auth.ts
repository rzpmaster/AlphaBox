import type { AuthResponse, User } from "@/types/api";

const TOKEN_KEY = "alphabox.token";
const USER_KEY = "alphabox.user";
const AVATAR_KEY_PREFIX = "alphabox.avatar.";

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

export function storeUser(user: User): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getAvatarUrl(userId: number): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(`${AVATAR_KEY_PREFIX}${userId}`) ?? "";
}

export function storeAvatarUrl(userId: number, avatarUrl: string): void {
  window.localStorage.setItem(`${AVATAR_KEY_PREFIX}${userId}`, avatarUrl);
}
