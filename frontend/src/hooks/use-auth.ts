"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { clearAuth, storeAuth, storeUser } from "@/lib/auth";
import type { AuthResponse, User } from "@/types/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<User>("/users/me"),
    retry: false
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload), auth: false }),
    onSuccess: (auth) => {
      storeAuth(auth);
      queryClient.setQueryData(["me"], auth.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string; display_name: string; invitation_code: string }) =>
      api<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload), auth: false }),
    onSuccess: (auth) => {
      storeAuth(auth);
      queryClient.setQueryData(["me"], auth.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { display_name: string; current_password?: string; new_password?: string }) =>
      api<User>("/users/me", { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: (user) => {
      storeUser(user);
      queryClient.setQueryData(["me"], user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });
}

export function logout() {
  clearAuth();
  window.location.href = "/auth/login";
}
