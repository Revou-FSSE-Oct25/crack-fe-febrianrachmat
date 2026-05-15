"use client";

import {
  fetchMyAvatarObjectUrl,
  hasUserAvatar,
  isExternalAvatarUrl,
} from "@/lib/api/users";
import { useEffect, useState } from "react";

export function useMyAvatarUrl(avatarUrl: string | null | undefined) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!hasUserAvatar(avatarUrl)) {
      queueMicrotask(() => setSrc(null));
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void fetchMyAvatarObjectUrl(avatarUrl as string)
      .then((url) => {
        if (cancelled) {
          if (!isExternalAvatarUrl(url)) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = isExternalAvatarUrl(url) ? null : url;
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarUrl]);

  return src;
}
