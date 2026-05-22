"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const register = useRegister();
  const [form, setForm] = useState({ email: "", password: "", display_name: "", invitation_code: "" });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await register.mutateAsync(form);
    router.push("/app");
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("registerByInvitation")}</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input placeholder={t("displayName")} value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} required />
          <Input type="email" placeholder={t("email")} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <Input type="password" placeholder={t("password")} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <Input placeholder={t("invitationCode")} value={form.invitation_code} onChange={(event) => setForm({ ...form, invitation_code: event.target.value })} required />
          {register.error && <p className="text-sm text-redsignal">{register.error.message}</p>}
          <Button className="w-full" disabled={register.isPending}>
            {t("createAccount")}
          </Button>
        </form>
      </Card>
    </main>
  );
}
