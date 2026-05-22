"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await login.mutateAsync({ email, password });
    router.push("/app");
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("login")}</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input type="email" placeholder={t("email")} value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input type="password" placeholder={t("password")} value={password} onChange={(event) => setPassword(event.target.value)} required />
          {login.error && <p className="text-sm text-redsignal">{login.error.message}</p>}
          <Button className="w-full" disabled={login.isPending}>
            {t("enterAlphaBox")}
          </Button>
        </form>
      </Card>
    </main>
  );
}
