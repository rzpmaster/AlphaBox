"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { AdminSubscription, AdminUser, InvitationCode, User } from "@/types/api";

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

export function useRevokeAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api<User>(`/admin/users/${userId}/revoke-admin`, { method: "POST" }),
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

export function useVerifyLeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaderId: number) => api<AdminUser>(`/admin/leaders/${leaderId}/verify`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["leaders"] });
    }
  });
}

export function useUnverifyLeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaderId: number) => api<AdminUser>(`/admin/leaders/${leaderId}/unverify`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["leaders"] });
    }
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => api<AdminSubscription[]>("/admin/subscriptions")
  });
}

export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; status: "pending" | "paid" | "cancelled" | "expired" }) =>
      api<AdminSubscription>(`/admin/subscriptions/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: payload.status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/subscriptions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });
}
