"use client";

import {
  adminPageShell,
  AdminBreadcrumb,
  AlertBanner,
  btnPrimary,
  cardSurface,
  inputBase,
  PageHeader,
  PageLoading,
  SignInRequired,
} from "@/components/ui/page-shell";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { actionSuccessWithNotify } from "@/lib/notifications/action-feedback";
import { ApiRequestError } from "@/lib/api/client";
import {
  validateBroadcast,
  validateDirectNotification,
} from "@/lib/validation";
import {
  broadcastNotification,
  sendNotificationToUser,
} from "@/lib/api/notifications";
import Link from "next/link";
import { useState } from "react";

export default function AdminNotificationsPage() {
  const { user, isReady } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [userBody, setUserBody] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    const title = broadcastTitle.trim();
    const body = broadcastBody.trim();
    const validation = validateBroadcast({ title, body });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setBroadcastLoading(true);
    setError(null);
    try {
      await broadcastNotification({ title, body });
      actionSuccessWithNotify(toast, t("notif.broadcastSuccess"));
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("notif.broadcastError"),
      );
    } finally {
      setBroadcastLoading(false);
    }
  }

  async function handleSendToUser(e: React.FormEvent) {
    e.preventDefault();
    const uid = userId.trim();
    const title = userTitle.trim();
    const body = userBody.trim();
    const validation = validateDirectNotification({
      userId: uid,
      title,
      body,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setSendLoading(true);
    setError(null);
    try {
      await sendNotificationToUser(uid, { title, body });
      actionSuccessWithNotify(toast, t("notif.sendUserSuccess"));
      setUserTitle("");
      setUserBody("");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : t("notif.sendError"),
      );
    } finally {
      setSendLoading(false);
    }
  }

  if (!isReady) {
    return <PageLoading label={t("notif.loading")} />;
  }

  if (!user) {
    return (
      <SignInRequired message={t("notif.adminSignInRequired")} />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className={adminPageShell}>
        <div className={`${cardSurface} max-w-lg space-y-4`}>
          <PageHeader
            eyebrow={t("notif.adminEyebrow")}
            title={t("notif.accessDenied")}
            description={t("notif.accessDeniedDesc")}
          />
          <Link
            href="/"
            className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            {t("notif.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={adminPageShell}>
      <AdminBreadcrumb />

      <PageHeader
        eyebrow={t("notif.adminEyebrow")}
        title={t("notif.title")}
        description={t("notif.adminDescription")}
      />

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("notif.broadcastHeading")}
        </h2>
        <form onSubmit={handleBroadcast} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("notif.fieldTitle")}
            </label>
            <input
              className={inputBase}
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("notif.fieldBody")}
            </label>
            <textarea
              className={`${inputBase} min-h-[90px] resize-y`}
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={broadcastLoading}
            className={`${btnPrimary} min-h-[44px]`}
          >
            {broadcastLoading ? t("notif.sending") : t("notif.sendBroadcast")}
          </button>
        </form>
      </section>

      <section className={`${cardSurface} space-y-4`}>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("notif.sendUserHeading")}
        </h2>
        <form onSubmit={handleSendToUser} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("notif.fieldUserId")}
            </label>
            <input
              className={`${inputBase} font-mono text-xs`}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={t("notif.userIdPlaceholder")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("notif.fieldTitle")}
            </label>
            <input
              className={inputBase}
              value={userTitle}
              onChange={(e) => setUserTitle(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">
              {t("notif.fieldBody")}
            </label>
            <textarea
              className={`${inputBase} min-h-[90px] resize-y`}
              value={userBody}
              onChange={(e) => setUserBody(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <button type="submit" disabled={sendLoading} className={`${btnPrimary} min-h-[44px]`}>
            {sendLoading ? t("notif.sending") : t("notif.sendUser")}
          </button>
        </form>
      </section>
    </main>
  );
}
