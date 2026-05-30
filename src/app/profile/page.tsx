"use client";

import { PatientMedicalCard } from "@/components/profile/PatientMedicalCard";
import { ProfileActivitySummary } from "@/components/profile/ProfileActivitySummary";
import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";
import { ProfileDangerZone } from "@/components/profile/ProfileDangerZone";
import {
  AlertBanner,
  btnOutline,
  btnPrimary,
  btnSecondary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
  StatusChip,
  widePageShell,
} from "@/components/ui/page-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { getMyPhysiotherapistProfile } from "@/lib/api/physiotherapist-me";
import type { UserProfile } from "@/lib/api/types";
import {
  changePassword,
  getMyProfile,
  updateMyProfile,
} from "@/lib/api/users";
import { therapistVerificationStatusMeta } from "@/lib/status-meta";
import {
  validateChangePassword,
  validateProfileUpdate,
} from "@/lib/validation";
import Link from "next/link";
import { useEffect, useState } from "react";

const labelClass = "block text-sm font-medium mb-1 text-slate-700";
const inputReadOnly = `${inputBase} cursor-not-allowed bg-slate-50 text-slate-600`;

function roleLabel(role: string, t: (key: string) => string): string {
  switch (role) {
    case "ADMIN":
      return t("profile.role.admin");
    case "PATIENT":
      return t("profile.role.patient");
    case "PHYSIOTHERAPIST":
      return t("profile.role.physiotherapist");
    default:
      return role;
  }
}

function formatProfileDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

type PtSummary = {
  verificationStatus?: string;
  bio?: string;
};

function RoleHubCard({
  role,
  ptSummary,
}: {
  role: string;
  ptSummary: PtSummary | null;
}) {
  const { t } = useLanguage();
  if (role === "PHYSIOTHERAPIST") {
    const verification = ptSummary?.verificationStatus;
    const vMeta = verification
      ? therapistVerificationStatusMeta(verification)
      : null;

    return (
      <div className={`${cardSurface} mx-auto max-w-lg space-y-4`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              {t("profile.ptHub.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {t("profile.ptHub.desc")}
            </p>
          </div>
          {vMeta ? (
            <StatusChip label={vMeta.label} tone={vMeta.tone} />
          ) : null}
        </div>
        {ptSummary?.bio ? (
          <p className="text-sm text-slate-700 line-clamp-3 border-t border-slate-100 pt-3">
            {ptSummary.bio}
          </p>
        ) : (
          <p className="text-sm text-slate-500 border-t border-slate-100 pt-3">
            {t("profile.ptHub.noBio")}
          </p>
        )}
        <Link
          href="/physiotherapist/profile"
          className={`${btnPrimary} inline-flex min-h-[44px] items-center justify-center`}
        >
          {t("profile.ptHub.manage")}
        </Link>
      </div>
    );
  }

  if (role === "ADMIN") {
    const adminLinks = [
      { href: "/admin/dashboard", label: t("profile.adminHub.dashboard") },
      {
        href: "/admin/physiotherapists",
        label: t("profile.adminHub.verifyPt"),
      },
      { href: "/admin/categories", label: t("profile.adminHub.categories") },
      {
        href: "/admin/reviews",
        label: t("profile.adminHub.reviewModeration"),
      },
      {
        href: "/admin/notifications",
        label: t("profile.adminHub.notifications"),
      },
    ];

    return (
      <div className={`${cardSurface} mx-auto max-w-lg space-y-4`}>
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            {t("profile.adminHub.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            {t("profile.adminHub.desc")}
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {adminLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${btnOutline} flex min-h-[44px] w-full items-center justify-center px-4 text-center text-sm`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

export default function ProfilePage() {
  const { user, isReady, logout, syncUserFromProfile } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [ptSummary, setPtSummary] = useState<PtSummary | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyProfile()
      .then((p) => {
        if (!cancelled) {
          setProfile(p);
          setFullName(p.fullName);
          setPhoneNumber(p.phoneNumber ?? "");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : t("profile.error.loadProfile"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, user, t]);

  useEffect(() => {
    if (!isReady || user?.role !== "PHYSIOTHERAPIST") return;
    let cancelled = false;
    getMyPhysiotherapistProfile()
      .then((raw) => {
        if (cancelled) return;
        const r = raw as Record<string, unknown>;
        setPtSummary({
          verificationStatus:
            typeof r.verificationStatus === "string"
              ? r.verificationStatus
              : undefined,
          bio: typeof r.bio === "string" ? r.bio : undefined,
        });
      })
      .catch(() => {
        if (!cancelled) setPtSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.role]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (!user) {
    return <SignInRequired message={t("profile.signInRequired")} />;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setError(null);
    const validation = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setChangingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg(res.message || t("profile.password.changeSuccess"));
      toast.success(t("profile.password.changeSuccess"));
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("profile.error.changePassword"),
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(null);
    setError(null);
    const validation = validateProfileUpdate({ fullName, phoneNumber });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });
      setProfile(updated);
      syncUserFromProfile(updated);
      setSavedMsg(t("profile.saved"));
      toast.success(t("profile.toast.profileUpdated"));
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("profile.error.save"),
      );
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.fullName ?? user.fullName;

  return (
    <main className={`${widePageShell} space-y-8 pb-16`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          {profile ? (
            <ProfileAvatarUpload
              profile={profile}
              displayName={displayName}
              onUpdated={(updated) => {
                setProfile(updated);
                syncUserFromProfile(updated);
              }}
            />
          ) : (
            <div
              className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-slate-200"
              aria-hidden
            />
          )}
          <PageHeader
            eyebrow={t("profile.eyebrow")}
            title={displayName}
            description={
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-900 ring-1 ring-teal-100">
                {roleLabel(user.role, t)}
              </span>
            }
          />
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/bookings"
            className={`${btnSecondary} min-h-[44px] justify-center text-center sm:min-w-[9rem]`}
          >
            {t("profile.nav.booking")}
          </Link>
          <Link
            href="/transactions"
            className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[9rem]`}
          >
            {t("profile.nav.transactions")}
          </Link>
          {user.role === "PATIENT" ? (
            <Link
              href="/reviews"
              className={`${btnOutline} min-h-[44px] justify-center px-5 text-center sm:min-w-[9rem]`}
            >
              {t("profile.nav.myReviews")}
            </Link>
          ) : null}
        </div>
      </div>

      {loading && !profile ? (
        <div className={`${cardSurface} mx-auto max-w-lg animate-pulse space-y-4`}>
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
      ) : (
        <>
          {error ? (
            <AlertBanner variant="error" className="max-w-lg mx-auto">
              {error}
            </AlertBanner>
          ) : null}
          {savedMsg ? (
            <AlertBanner variant="success" className="max-w-lg mx-auto">
              {savedMsg}
            </AlertBanner>
          ) : null}
          {passwordMsg ? (
            <AlertBanner variant="success" className="max-w-lg mx-auto">
              {passwordMsg}
            </AlertBanner>
          ) : null}

          <RoleHubCard role={user.role} ptSummary={ptSummary} />

          <ProfileActivitySummary enabled={Boolean(profile)} />

          <PatientMedicalCard enabled={user.role === "PATIENT"} />

          {profile ? (
            <div className={`${cardSurface} mx-auto max-w-lg`}>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                {t("profile.accountInfo.title")}
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">
                    {t("profile.accountInfo.joined")}
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {formatProfileDate(profile.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">
                    {t("profile.accountInfo.updated")}
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {formatProfileDate(profile.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <form
            onSubmit={handleSave}
            className={`${cardSurface} mx-auto max-w-lg space-y-6`}
          >
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                {t("profile.personal.title")}
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {t("profile.personal.desc")}
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="profile-email" className={labelClass}>
                    {t("profile.field.email")}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    readOnly
                    className={inputReadOnly}
                    value={profile?.email ?? user.email}
                    aria-readonly
                  />
                </div>
                <div>
                  <label htmlFor="profile-fullName" className={labelClass}>
                    {t("profile.field.fullName")}
                  </label>
                  <input
                    id="profile-fullName"
                    required
                    minLength={3}
                    className={inputBase}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("profile.placeholder.fullName")}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className={labelClass}>
                    {t("profile.field.phone")}
                  </label>
                  <input
                    id="profile-phone"
                    className={inputBase}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t("profile.placeholder.phone")}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                disabled={saving || loading}
                className={`${btnPrimary} min-h-[44px] justify-center sm:min-w-[10rem]`}
              >
                {saving ? t("profile.btn.saving") : t("profile.btn.save")}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className={`${btnSecondary} min-h-[44px] justify-center sm:min-w-[8rem]`}
              >
                {t("profile.btn.logout")}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleChangePassword}
            className={`${cardSurface} mx-auto max-w-lg space-y-6`}
          >
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                {t("profile.password.title")}
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {t("profile.password.desc")}
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="current-password" className={labelClass}>
                    {t("profile.password.current")}
                  </label>
                  <PasswordInput
                    id="current-password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder={t("profile.password.currentPlaceholder")}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className={labelClass}>
                    {t("profile.password.new")}
                  </label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={t("profile.password.newPlaceholder")}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className={labelClass}>
                    {t("profile.password.confirm")}
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={t("profile.password.confirmPlaceholder")}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={changingPassword}
                className={`${btnOutline} min-h-[44px] justify-center sm:min-w-[10rem]`}
              >
                {changingPassword
                  ? t("profile.btn.saving")
                  : t("profile.password.title")}
              </button>
            </div>
          </form>

          <ProfileDangerZone
            enabled={
              user.role === "PATIENT" || user.role === "PHYSIOTHERAPIST"
            }
          />
        </>
      )}
    </main>
  );
}
