"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useState } from "react";
import { Activity, AlertTriangle, Archive, Check, ChevronDown, FilePlus2, Pencil, RadioTower, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateLeaderProfile,
  useDeletePost,
  useDeleteSignal,
  useMyLeaderProfile,
  useMyPosts,
  useMySignals,
  useUpdateLeaderProfile
} from "@/hooks/use-leaders";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatDateTime } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n";
import { formatStrategyTags, parseStrategyTags } from "@/lib/strategy-tags";

const riskLevelOptions = ["Low", "Medium", "High"] as const;
const iconButtonClass = "!h-8 !w-8 min-w-0 rounded border-line/80 bg-panel/80 !p-0 text-slate-300 hover:border-mint/60 hover:text-mint";
const archiveIconButtonClass = "!h-8 !w-8 min-w-0 rounded border border-gold/50 bg-gold/15 !p-0 text-gold shadow-sm shadow-gold/10 hover:border-gold/80 hover:bg-gold/20";
const dangerIconButtonClass = "!h-8 !w-8 min-w-0 rounded border border-redsignal/60 bg-redsignal/15 !p-0 text-redsignal shadow-sm shadow-redsignal/10 hover:border-redsignal hover:bg-redsignal/25";

function riskBadgeClassName(riskLevel: string) {
  if (riskLevel === "Low") return "border-mint/40 bg-mint/10 text-mint";
  if (riskLevel === "High") return "border-redsignal/50 bg-redsignal/10 text-redsignal";
  return "border-gold/50 bg-gold/10 text-gold";
}

function formatReturnRate(value: string | null) {
  if (!value) return "";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatSignalPrice(value: string | null) {
  if (!value) return "";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return value;
  return numericValue.toFixed(2);
}

function formatCurrency(value: string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return `¥${value}`;
  return `¥${numericValue.toFixed(2)}`;
}

function StrategyTagInput({
  placeholder,
  tags,
  onChange
}: {
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addDraftTags(value: string) {
    const nextTags = parseStrategyTags(value);
    if (nextTags.length === 0) return;
    onChange(Array.from(new Set([...tags, ...nextTags])));
    setDraft("");
  }

  function removeTag(tagToRemove: string) {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    addDraftTags(draft);
  }

  return (
    <div className="rounded-md border border-line bg-[#08120f] p-2 transition focus-within:border-mint">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex h-8 items-center gap-1 rounded bg-panel2 px-2 text-xs text-slate-200">
            {tag}
            <button
              type="button"
              className="rounded text-slate-500 transition hover:text-redsignal"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <Input
          className="h-8 min-w-36 flex-1 border-0 bg-transparent px-1 focus:border-0"
          placeholder={placeholder}
          value={draft}
          onBlur={() => addDraftTags(draft)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}

function RiskLevelSelect({
  label,
  value,
  isOpen,
  onOpenChange,
  onChange,
  formatLabel
}: {
  label: string;
  value: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChange: (value: string) => void;
  formatLabel: (value: string) => string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex h-11 w-full items-center justify-between rounded-md border border-line bg-[#08120f] px-3 text-left text-sm text-slate-100 outline-none transition hover:border-mint/50 focus:border-mint"
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <span className="text-slate-500">{label}</span>
          <span>{formatLabel(value)}</span>
        </span>
        <ChevronDown className={isOpen ? "rotate-180 text-mint transition" : "text-slate-500 transition"} size={16} />
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-line bg-panel shadow-xl shadow-ink/50" role="listbox" aria-label={label}>
          {riskLevelOptions.map((riskLevel) => (
            <button
              key={riskLevel}
              type="button"
              role="option"
              aria-selected={value === riskLevel}
              className="flex h-10 w-full items-center justify-between px-3 text-left text-sm text-slate-100 transition hover:bg-panel2"
              onClick={() => {
                onChange(riskLevel);
                onOpenChange(false);
              }}
            >
              <span>{formatLabel(riskLevel)}</span>
              {value === riskLevel && <Check className="text-mint" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionPriceFields({
  title,
  monthlyLabel,
  yearlyLabel,
  monthlyValue,
  yearlyValue,
  onMonthlyChange,
  onYearlyChange
}: {
  title: string;
  monthlyLabel: string;
  yearlyLabel: string;
  monthlyValue: string;
  yearlyValue: string;
  onMonthlyChange: (value: string) => void;
  onYearlyChange: (value: string) => void;
}) {
  return (
    <div className="sm:col-span-2 rounded-md border border-line bg-[#08120f] p-3">
      <p className="text-sm font-medium text-slate-200">{title}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-400">{monthlyLabel}</span>
          <Input aria-label={monthlyLabel} min={0} step="0.01" type="number" value={monthlyValue} onChange={(event) => onMonthlyChange(event.target.value)} required />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-400">{yearlyLabel}</span>
          <Input aria-label={yearlyLabel} min={0} step="0.01" type="number" value={yearlyValue} onChange={(event) => onYearlyChange(event.target.value)} required />
        </label>
      </div>
    </div>
  );
}

export default function LeaderStudioPage() {
  const { locale, t } = useI18n();
  useRequireAuth();
  const profile = useMyLeaderProfile();
  const posts = useMyPosts();
  const signals = useMySignals();
  const createProfile = useCreateLeaderProfile();
  const updateProfile = useUpdateLeaderProfile();
  const deletePost = useDeletePost();
  const deleteSignal = useDeleteSignal();
  const [pendingDeletion, setPendingDeletion] = useState<{ type: "post" | "signal"; id: number } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreateRiskMenuOpen, setIsCreateRiskMenuOpen] = useState(false);
  const [isEditRiskMenuOpen, setIsEditRiskMenuOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [acceptedLeaderTerms, setAcceptedLeaderTerms] = useState(false);
  const [form, setForm] = useState({
    handle: "",
    headline: "",
    bio: "",
    strategies: [] as string[],
    risk_level: "Medium",
    subscription_price: "0.00",
    monthly_price: "0.00",
    yearly_price: "0.00"
  });
  const [profileForm, setProfileForm] = useState({
    handle: "",
    headline: "",
    bio: "",
    strategies: [] as string[],
    risk_level: "",
    subscription_price: "0.00",
    monthly_price: "0.00",
    yearly_price: "0.00"
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!acceptedLeaderTerms) return;
    const { strategies, ...payload } = form;
    await createProfile.mutateAsync({ ...payload, strategy: formatStrategyTags(strategies) });
  }

  function startEditingProfile() {
    if (!profile.data) return;
    setProfileMessage("");
    setProfileForm({
      handle: profile.data.handle,
      headline: profile.data.headline,
      bio: profile.data.bio,
      strategies: parseStrategyTags(profile.data.strategy),
      risk_level: profile.data.risk_level,
      subscription_price: profile.data.subscription_price,
      monthly_price: profile.data.monthly_price,
      yearly_price: profile.data.yearly_price
    });
    setIsEditingProfile(true);
  }

  async function onUpdateProfile(event: FormEvent) {
    event.preventDefault();
    setProfileMessage("");
    const { strategies, ...payload } = profileForm;
    await updateProfile.mutateAsync({ ...payload, strategy: formatStrategyTags(strategies) });
    setProfileMessage(t("profileUpdated"));
    setIsEditingProfile(false);
  }

  function riskLevelLabel(value: string) {
    if (value === "Low") return t("riskLow");
    if (value === "High") return t("riskHigh");
    return t("riskMedium");
  }

  function confirmDeletion() {
    if (!pendingDeletion) return;
    if (pendingDeletion.type === "post") {
      deletePost.mutate(pendingDeletion.id, { onSuccess: () => setPendingDeletion(null) });
      return;
    }
    deleteSignal.mutate(pendingDeletion.id, { onSuccess: () => setPendingDeletion(null) });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">{t("leaderStudio")}</p>
      <h1 className="mt-3 text-3xl font-semibold">{t("publishMarketIntelligence")}</h1>

      {!profile.data && (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold">{t("createLeaderProfile")}</h2>
          <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder={t("handle")} value={form.handle} onChange={(event) => setForm({ ...form, handle: event.target.value })} required />
              <StrategyTagInput placeholder={t("strategy")} tags={form.strategies} onChange={(strategies) => setForm({ ...form, strategies })} />
              <Input className="sm:col-span-2" placeholder={t("headline")} value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} required />
              <RiskLevelSelect
                label={t("riskLevel")}
                value={form.risk_level}
                isOpen={isCreateRiskMenuOpen}
                onOpenChange={setIsCreateRiskMenuOpen}
                onChange={(riskLevel) => setForm({ ...form, risk_level: riskLevel })}
                formatLabel={riskLevelLabel}
              />
              <SubscriptionPriceFields
                title={t("subscriptionPrice")}
                monthlyLabel={t("monthlyPrice")}
                yearlyLabel={t("yearlyPrice")}
                monthlyValue={form.monthly_price}
                yearlyValue={form.yearly_price}
                onMonthlyChange={(value) => setForm({ ...form, monthly_price: value, subscription_price: value })}
                onYearlyChange={(value) => setForm({ ...form, yearly_price: value })}
              />
            </div>
            <Textarea placeholder={t("bioMethodology")} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} required />
            <label className="flex items-start gap-3 rounded-md border border-gold/45 bg-gold/10 p-3 text-sm leading-6 text-slate-300">
              <input
                checked={acceptedLeaderTerms}
                className="mt-1 h-4 w-4 accent-mint"
                onChange={(event) => setAcceptedLeaderTerms(event.target.checked)}
                required
                type="checkbox"
              />
              <span>{t("agreeToLeaderTerms")}</span>
            </label>
            {createProfile.error && <p className="text-sm text-redsignal">{createProfile.error.message}</p>}
            <Button className="w-fit" disabled={createProfile.isPending || form.strategies.length === 0 || !acceptedLeaderTerms}>{t("createProfile")}</Button>
          </form>
        </Card>
      )}

      {profile.data && !isEditingProfile && (
        <Card className="mt-8 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-mint">@{profile.data.handle}</p>
              <h2 className="mt-2 text-xl font-semibold">{profile.data.headline}</h2>
              <p className="mt-2 text-sm text-slate-400">{profile.data.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                {parseStrategyTags(profile.data.strategy).map((tag) => (
                  <span key={tag} className="rounded bg-panel2 px-2 py-1">{tag}</span>
                ))}
                <span className={`rounded border px-2 py-1 font-semibold ${riskBadgeClassName(profile.data.risk_level)}`}>
                  {t("risk")}: {riskLevelLabel(profile.data.risk_level)}
                </span>
                {profile.data.is_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-mint/50 bg-mint/10 px-3 py-1 font-bold text-mint">
                    <span className="size-1.5 rounded-full bg-mint" />
                    {t("siteVerified")}
                  </span>
                ) : (
                  <span className="rounded-full border border-line bg-panel2 px-3 py-1 font-semibold text-slate-400">{t("unverifiedLeader")}</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded border border-line bg-[#08120f] px-3 py-1.5 text-slate-300">
                  {t("monthly")}: <span className="font-mono text-mint">{formatCurrency(profile.data.monthly_price)}</span>
                </span>
                <span className="rounded border border-line bg-[#08120f] px-3 py-1.5 text-slate-300">
                  {t("yearly")}: <span className="font-mono text-mint">{formatCurrency(profile.data.yearly_price)}</span>
                </span>
              </div>
              {profileMessage && <p className="mt-3 text-sm text-mint">{profileMessage}</p>}
            </div>
            <Button className="w-fit shrink-0" variant="ghost" onClick={startEditingProfile}>
              {t("editProfile")}
            </Button>
          </div>
        </Card>
      )}

      {profile.data && isEditingProfile && (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold">{t("editProfile")}</h2>
          <form className="mt-5 grid gap-4" onSubmit={onUpdateProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder={t("handle")} value={profileForm.handle} onChange={(event) => setProfileForm({ ...profileForm, handle: event.target.value })} required />
              <StrategyTagInput placeholder={t("strategy")} tags={profileForm.strategies} onChange={(strategies) => setProfileForm({ ...profileForm, strategies })} />
              <Input className="sm:col-span-2" placeholder={t("headline")} value={profileForm.headline} onChange={(event) => setProfileForm({ ...profileForm, headline: event.target.value })} required />
              <RiskLevelSelect
                label={t("riskLevel")}
                value={profileForm.risk_level}
                isOpen={isEditRiskMenuOpen}
                onOpenChange={setIsEditRiskMenuOpen}
                onChange={(riskLevel) => setProfileForm({ ...profileForm, risk_level: riskLevel })}
                formatLabel={riskLevelLabel}
              />
              <SubscriptionPriceFields
                title={t("subscriptionPrice")}
                monthlyLabel={t("monthlyPrice")}
                yearlyLabel={t("yearlyPrice")}
                monthlyValue={profileForm.monthly_price}
                yearlyValue={profileForm.yearly_price}
                onMonthlyChange={(value) => setProfileForm({ ...profileForm, monthly_price: value, subscription_price: value })}
                onYearlyChange={(value) => setProfileForm({ ...profileForm, yearly_price: value })}
              />
            </div>
            <Textarea placeholder={t("bioMethodology")} value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} required />
            {updateProfile.error && <p className="text-sm text-redsignal">{updateProfile.error.message}</p>}
            <div className="flex flex-wrap gap-3">
              <Button disabled={updateProfile.isPending || profileForm.strategies.length === 0}>{t("saveProfile")}</Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)} disabled={updateProfile.isPending}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link className="rounded-lg border border-line bg-panel p-6 hover:border-mint/50" href="/leader/posts/new">
          <FilePlus2 className="text-gold" />
          <h2 className="mt-4 text-xl font-semibold">{t("newPost")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("newPostCopy")}</p>
          <Button className="mt-5" variant="ghost">{t("openEditor")}</Button>
        </Link>
        <Link className="rounded-lg border border-line bg-panel p-6 hover:border-mint/50" href="/leader/signals/new">
          <RadioTower className="text-mint" />
          <h2 className="mt-4 text-xl font-semibold">{t("newSignal")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("newSignalCopy")}</p>
          <Button className="mt-5" variant="ghost">{t("openTicket")}</Button>
        </Link>
      </div>

      {profile.data && (
        <section className="mt-10">
          <div className="mb-5">
            <div className="flex items-center gap-2 text-mint">
              <Activity size={18} />
              <p className="text-sm font-semibold uppercase tracking-[0.22em]">{t("myActivity")}</p>
            </div>
            <p className="mt-2 text-sm text-slate-400">{t("manageActivityCopy")}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-lg font-semibold">{t("publishedPosts")}</h2>
              <div className="mt-4 space-y-3">
                {posts.data?.map((post) => (
                  <div key={post.id} className="relative rounded-md border border-line bg-[#08120f] p-4 pr-24">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-100">{post.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{post.body}</p>
                        <time className="mt-3 block text-xs text-slate-500">{formatDateTime(post.created_at, locale)}</time>
                    </div>
                    <div className="absolute right-3 top-3 flex gap-2">
                        <Link href={`/leader/posts/${post.id}/edit?lang=${locale}`}>
                          <Button className={iconButtonClass} variant="ghost" aria-label={t("edit")} title={t("edit")}>
                            <Pencil size={15} />
                          </Button>
                        </Link>
                        <Button
                          className={dangerIconButtonClass}
                          variant="ghost"
                          aria-label={t("remove")}
                          title={t("remove")}
                          disabled={deletePost.isPending}
                          onClick={() => setPendingDeletion({ type: "post", id: post.id })}
                        >
                          <Trash2 size={15} />
                        </Button>
                    </div>
                  </div>
                ))}
                {posts.data?.length === 0 && <p className="text-sm text-slate-500">{t("noPublishedPosts")}</p>}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold">{t("publishedSignals")}</h2>
              <div className="mt-4 space-y-3">
                {signals.data?.map((signal) => (
                  <div key={signal.id} className="relative min-h-[190px] rounded-md border border-line bg-[#08120f] p-4 pr-32">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-100">{signal.symbol}</h3>
                          {signal.code && <span className="rounded border border-line/70 bg-panel/60 px-2 py-1 font-mono text-xs text-slate-300">{signal.code}</span>}
                          <span className="rounded bg-panel2 px-2 py-1 text-xs uppercase text-mint">{t(signal.side)}</span>
                          {signal.is_archived && <span className="rounded bg-gold/15 px-2 py-1 text-xs text-gold">{t("archived")}</span>}
                          {signal.timeframe && <span className="text-xs text-slate-500">{signal.timeframe}</span>}
                        </div>
                        {signal.thesis && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{signal.thesis}</p>}
                        <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                          <div className="flex items-center justify-between gap-3 rounded border border-line/60 bg-panel/40 px-2 py-1.5">
                            <span className="text-slate-500">{t("entry")}</span>
                            <span className="min-w-16 text-right font-mono text-slate-200">{formatSignalPrice(signal.entry)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded border border-line/60 bg-panel/40 px-2 py-1.5">
                            <span className="text-slate-500">{t("target")}</span>
                            <span className="min-w-16 text-right font-mono text-slate-200">{formatSignalPrice(signal.target)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded border border-line/60 bg-panel/40 px-2 py-1.5">
                            <span className="text-slate-500">{t("currentPrice")}</span>
                            <span className="min-w-16 text-right font-mono text-slate-200">{formatSignalPrice(signal.exit_price)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded border border-line/60 bg-panel/40 px-2 py-1.5">
                            <span className="text-slate-500">{t("returnRate")}</span>
                            <span className={signal.return_rate ? "min-w-16 text-right font-mono text-mint" : "min-w-16 text-right font-mono text-slate-200"}>{formatReturnRate(signal.return_rate)}</span>
                          </div>
                        </div>
                        <time className="mt-3 block text-xs text-slate-500">{formatDateTime(signal.created_at, locale)}</time>
                    </div>
                    <div className="absolute right-3 top-3 flex gap-2">
                        {!signal.is_archived && (
                          <>
                            <Link href={`/leader/signals/${signal.id}/edit?lang=${locale}`}>
                              <Button className={iconButtonClass} variant="ghost" aria-label={t("edit")} title={t("edit")}>
                                <Pencil size={15} />
                              </Button>
                            </Link>
                            <Link href={`/leader/signals/${signal.id}/archive?lang=${locale}`}>
                              <Button className={archiveIconButtonClass} variant="ghost" aria-label={t("archiveSignal")} title={t("archiveSignal")}>
                                <Archive size={15} />
                              </Button>
                            </Link>
                          </>
                        )}
                        <Button
                          className={dangerIconButtonClass}
                          variant="ghost"
                          aria-label={t("remove")}
                          title={t("remove")}
                          disabled={deleteSignal.isPending}
                          onClick={() => setPendingDeletion({ type: "signal", id: signal.id })}
                        >
                          <Trash2 size={15} />
                        </Button>
                    </div>
                  </div>
                ))}
                {signals.data?.length === 0 && <p className="text-sm text-slate-500">{t("noPublishedSignals")}</p>}
              </div>
            </Card>
          </div>
        </section>
      )}

      {pendingDeletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-5 shadow-2xl shadow-redsignal/10">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-redsignal/15 text-redsignal">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{t("confirmDeletionTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {pendingDeletion.type === "post" ? t("confirmDeletePost") : t("confirmDeleteSignal")}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button className="min-w-20" variant="ghost" onClick={() => setPendingDeletion(null)} disabled={deletePost.isPending || deleteSignal.isPending}>
                {t("cancel")}
              </Button>
              <Button className="min-w-20" variant="danger" onClick={confirmDeletion} disabled={deletePost.isPending || deleteSignal.isPending}>
                {t("remove")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
