"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { AdminUser, InvitationCode, User } from "@/types/api";

export function useInvitationCodes() {
  return useQuery({
    queryKey: ["admin", "invitation-codes"],
    queryFn: () => api<InvitationCode[]>("/admin/invitation-codes")
  });
}

export function useCreateInvitationCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { count: number }) =>
      api<InvitationCode[]>("/admin/invitation-codes", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "invitation-codes"] })
  });
}

export function useDeleteInvitationCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/invitation-codes/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "invitation-codes"] })
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<AdminUser[]>("/admin/users")
  });
}

export function usePromoteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api<User>(`/admin/users/${userId}/promote-admin`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api<User>(`/admin/users/${userId}/ban`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api<User>(`/admin/users/${userId}/unban`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}
