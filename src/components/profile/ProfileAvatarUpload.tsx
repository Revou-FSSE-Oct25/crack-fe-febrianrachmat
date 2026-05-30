"use client";

import { ProfileAvatar } from "@/components/ProfileAvatar";
import { btnOutline, btnSecondary } from "@/components/ui/page-shell";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/contexts/toast-context";
import { useMyAvatarUrl } from "@/hooks/use-my-avatar-url";
import { ApiRequestError } from "@/lib/api/client";
import { uploadMyAvatar } from "@/lib/api/users";
import type { UserProfile } from "@/lib/api/types";
import { useRef, useState } from "react";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type ProfileAvatarUploadProps = {
  profile: UserProfile | null;
  displayName: string;
  onUpdated: (profile: UserProfile) => void;
};

export function ProfileAvatarUpload({
  profile,
  displayName,
  onUpdated,
}: ProfileAvatarUploadProps) {
  const toast = useToast();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const avatarSrc = useMyAvatarUrl(profile?.avatarUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error(t("profile.avatar.formatError"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("profile.avatar.sizeError"));
      return;
    }

    setUploading(true);
    try {
      const updated = await uploadMyAvatar(file);
      onUpdated(updated);
      toast.success(t("profile.avatar.uploadSuccess"));
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : t("profile.avatar.uploadError"),
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
      <ProfileAvatar
        fullName={displayName}
        size="lg"
        imageSrc={avatarSrc}
      />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`${btnSecondary} min-h-[40px] text-sm`}
        >
          {uploading
            ? t("profile.avatar.uploading")
            : t("profile.avatar.change")}
        </button>
        <p className="text-xs text-slate-500 max-w-[14rem] text-center sm:text-left">
          {t("profile.avatar.hint")}
        </p>
        {profile?.avatarUrl ? (
          <button
            type="button"
            className={`${btnOutline} min-h-[36px] text-xs`}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {t("profile.avatar.update")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
