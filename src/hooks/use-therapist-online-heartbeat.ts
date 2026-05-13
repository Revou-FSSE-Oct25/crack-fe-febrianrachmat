"use client";

import { postPhysiotherapistOnlineHeartbeat } from "@/lib/api/physiotherapist-me";
import { useEffect } from "react";

const INTERVAL_MS = 60_000;

/**
 * While enabled, pings POST /physiotherapists/me/online immediately and then
 * every 60s so the therapist appears in patient browse when "online now" is
 * selected. Failures are ignored (tab may be offline).
 */
export function useTherapistOnlineHeartbeat(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const ping = () => {
      void postPhysiotherapistOnlineHeartbeat().catch(() => {
        /* ignore */
      });
    };

    ping();
    const id = window.setInterval(ping, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [enabled]);
}
