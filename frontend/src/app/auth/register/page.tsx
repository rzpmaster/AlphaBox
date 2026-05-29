"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
  const [form, setForm] = useState({ email: "", password: "", confirm_password: "", display_name: "", invitation_code: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordError("");
    if (form.password !== form.confirm_password) {
      setPasswordError(t("passwordMismatch"));
      return;
    }
    if (!acceptedTerms) return;
    const { confirm_password: _confirmPassword, ...payload } = form;
    await register.mutateAsync(payload);
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
          <Input type="password" placeholder={t("confirmPassword")} value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} required />
          <Input placeholder={t("invitationCode")} value={form.invitation_code} onChange={(event) => setForm({ ...form, invitation_code: event.target.value })} required />
          <label className="flex items-start gap-3 rounded-md border border-line bg-[#08120f] p-3 text-sm text-slate-300">
            <input
              checked={acceptedTerms}
              className="mt-1 h-4 w-4 accent-mint"
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
              type="checkbox"
            />
            <span>
              {t("agreeToTermsPrefix")}{" "}
              <Link className="font-medium text-mint hover:text-[#8affcc]" href="/terms">
                {t("userAgreement")}
              </Link>
            </span>
          </label>
          {passwordError && <p className="text-sm text-redsignal">{passwordError}</p>}
          {register.error && <p className="text-sm text-redsignal">{register.error.message}</p>}
          <Button className="w-full" disabled={register.isPending || !acceptedTerms}>
            {t("createAccount")}
          </Button>
        </form>
      </Card>
    </main>
  );
}
