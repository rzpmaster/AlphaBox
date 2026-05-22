"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { FeedItem, Leader, Post, Signal, Subscription, SubscriptionWithLeader } from "@/types/api";

export function useLeaders() {
  return useQuery({ queryKey: ["leaders"], queryFn: () => api<Leader[]>("/leaders", { auth: false }) });
}

export function useLeader(id: string | number) {
  return useQuery({ queryKey: ["leaders", id], queryFn: () => api<Leader>(`/leaders/${id}`, { auth: false }) });
}

export function useMyLeaderProfile() {
  return useQuery({
    queryKey: ["my-leader-profile"],
    queryFn: () => api<Leader>("/leaders/me/profile"),
    retry: false
  });
}

export function useCreateLeaderProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { handle: string; headline: string; bio: string; strategy: string; risk_level: string; subscription_price: string; monthly_price: string; yearly_price: string }) =>
      api<Leader>("/leaders/me", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leader-profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaders"] });
    }
  });
}

export function useUpdateLeaderProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { handle: string; headline: string; bio: string; strategy: string; risk_level: string; subscription_price: string; monthly_price: string; yearly_price: string }) =>
      api<Leader>("/leaders/me/profile", { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leader-profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaders"] });
    }
  });
}

export function useLeaderPosts(id: string | number) {
  return useQuery({
    queryKey: ["leader-posts", id],
    queryFn: () => api<Post[]>(`/content/leaders/${id}/posts`, { auth: false })
  });
}

export function usePost(id: string | number) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => api<Post>(`/content/posts/${id}`)
  });
}

export function useLeaderSignals(id: string | number) {
  return useQuery({
    queryKey: ["leader-signals", id],
    queryFn: () => api<Signal[]>(`/content/leaders/${id}/signals`, { auth: false })
  });
}

export function useSignal(id: string | number) {
  return useQuery({
    queryKey: ["signals", id],
    queryFn: () => api<Signal>(`/content/signals/${id}`)
  });
}

export function useMyPosts() {
  return useQuery({
    queryKey: ["my-posts"],
    queryFn: () => api<Post[]>("/content/me/posts"),
    retry: false
  });
}

export function useMySignals() {
  return useQuery({
    queryKey: ["my-signals"],
    queryFn: () => api<Signal[]>("/content/me/signals"),
    retry: false
  });
}

export function useSubscriptions() {
  return useQuery({ queryKey: ["subscriptions"], queryFn: () => api<SubscriptionWithLeader[]>("/subscriptions") });
}

export function useSubscription(leaderId: string | number) {
  return useQuery({
    queryKey: ["subscriptions", leaderId],
    queryFn: () => api<Subscription>(`/subscriptions/${leaderId}`),
    retry: false
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { leaderId: number; billing_period: "monthly" | "yearly" }) =>
      api<Subscription>(`/subscriptions/${payload.leaderId}`, { method: "POST", body: JSON.stringify({ billing_period: payload.billing_period }) }),
    onSuccess: (_subscription, payload) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", payload.leaderId] });
    }
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaderId: number) => api<void>(`/subscriptions/${leaderId}`, { method: "DELETE" }),
    onSuccess: (_result, leaderId) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", leaderId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });
}

export function useFeed() {
  return useQuery({ queryKey: ["feed"], queryFn: () => api<FeedItem[]>("/content/feed") });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; body: string }) =>
      api<Post>("/content/posts", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-posts"] })
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; title: string; body: string }) =>
      api<Post>(`/content/posts/${payload.id}`, { method: "PATCH", body: JSON.stringify({ title: payload.title, body: payload.body }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });
}

export function useCreateSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      symbol: string;
      code?: string;
      side: "long" | "short" | "watch";
      thesis: string;
      entry?: string;
      target?: string;
      stop_loss?: string;
      timeframe: string;
    }) => {
      const body = {
        ...payload,
        code: payload.code?.trim() || null,
        entry: payload.entry || null,
        target: payload.target || null,
        stop_loss: payload.stop_loss || null
      };
      return api<Signal>("/content/signals", { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-signals"] })
  });
}

export function useUpdateSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: number;
      symbol: string;
      code?: string | null;
      side: "long" | "short" | "watch";
      thesis: string;
      entry?: string | null;
      target?: string | null;
      stop_loss?: string | null;
      timeframe: string;
    }) => {
      const body = {
        symbol: payload.symbol,
        code: payload.code?.trim() || null,
        side: payload.side,
        thesis: payload.thesis,
        entry: payload.entry || null,
        target: payload.target || null,
        stop_loss: payload.stop_loss || null,
        timeframe: payload.timeframe
      };
      return api<Signal>(`/content/signals/${payload.id}`, { method: "PATCH", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-signals"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });
}

export function useArchiveSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; current_price: string }) =>
      api<Signal>(`/content/signals/${payload.id}/archive`, { method: "POST", body: JSON.stringify({ current_price: payload.current_price }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-signals"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => api<void>(`/content/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-posts"] })
  });
}

export function useDeleteSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (signalId: number) => api<void>(`/content/signals/${signalId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-signals"] })
  });
}
