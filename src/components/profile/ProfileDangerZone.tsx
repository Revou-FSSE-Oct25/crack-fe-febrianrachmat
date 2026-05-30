"use client";

import {
  AlertBanner,
  btnOutline,
  cardSurface,
} from "@/components/ui/page-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api/client";
import { deactivateMyAccount } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { useState } from "react";

const labelClass = "block text-sm font-medium mb-1 text-slate-700";

type ProfileDangerZoneProps = {
  enabled: boolean;
};

export function ProfileDangerZone({ enabled }: ProfileDangerZoneProps) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  async function handleDeactivate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const confirmWord = t("profile.danger.confirmWord");
    if (confirmText.trim().toUpperCase() !== confirmWord.toUpperCase()) {
      setError(
        `${t("profile.danger.confirmErrorPrefix")}${confirmWord}${t(
          "profile.danger.confirmErrorSuffix",
        )}`,
      );
      return;
    }
    if (password.length < 8) {
      setError(t("profile.danger.passwordMin"));
      return;
    }

    setLoading(true);
    try {
      const res = await deactivateMyAccount({ currentPassword: password });
      toast.success(res.message);
      logout();
      router.replace("/login");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("profile.danger.deactivateError"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleDeactivate}
      className={`${cardSurface} mx-auto max-w-lg space-y-4 border-red-100`}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-red-900">
          {t("profile.danger.title")}
        </h2>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {t("profile.danger.desc")}
        </p>
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <div>
        <label htmlFor="deactivate-password" className={labelClass}>
          {t("profile.password.current")}
        </label>
        <PasswordInput
          id="deactivate-password"
          value={password}
          onChange={setPassword}
          placeholder={t("profile.danger.passwordPlaceholder")}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label htmlFor="deactivate-confirm" className={labelClass}>
          {`${t("profile.danger.typeLabelPrefix")}${t(
            "profile.danger.confirmWord",
          )}`}
        </label>
        <input
          id="deactivate-confirm"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={t("profile.danger.confirmWord")}
          autoComplete="off"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`${btnOutline} min-h-[44px] w-full justify-center border-red-200 text-red-800 hover:bg-red-50 sm:w-auto`}
      >
        {loading
          ? t("profile.danger.processing")
          : t("profile.danger.deactivateBtn")}
      </button>
    </form>
  );
}
