"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMe } from "@/hooks/use-auth";
import { getToken } from "@/lib/auth";

export function useRequireAuth() {
  const router = useRouter();
  const me = useMe();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/auth/login");
      return;
    }
    if (me.error) router.replace("/auth/login");
  }, [me.error, router]);

  return me;
}
