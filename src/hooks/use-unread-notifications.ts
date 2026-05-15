"use client";

import { getUnreadNotificationCount } from "@/lib/api/notifications";
import { onUnreadRefreshRequested } from "@/lib/notifications/unread-refresh";
import { useAuth } from "@/contexts/auth-context";
import { useCallback, useEffect, useState } from "react";

const POLL_MS = 60_000;

async function fetchUnreadCount(): Promise<number> {
  const { unreadCount } = await getUnreadNotificationCount();
  return unreadCount;
}

export function useUnreadNotifications() {
  const { user, isReady } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // Keep last known count on transient errors.
    }
  }, [user]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      queueMicrotask(() => setUnreadCount(0));
      return;
    }

    let cancelled = false;

    const load = () => {
      void fetchUnreadCount()
        .then((count) => {
          if (!cancelled) setUnreadCount(count);
        })
        .catch(() => {
          // Keep last known count on transient errors.
        });
    };

    load();
    const interval = setInterval(load, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isReady, user]);

  useEffect(() => {
    if (!user) return;
    return onUnreadRefreshRequested(() => {
      void fetchUnreadCount()
        .then((count) => setUnreadCount(count))
        .catch(() => {
          // Keep last known count on transient errors.
        });
    });
  }, [user]);

  return { unreadCount, refresh };
}
