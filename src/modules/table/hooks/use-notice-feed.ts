"use client";

import { useCallback, useEffect, useState } from "react";

import { useGameStore } from "@/modules/table/state/game-store";
import type { Notice } from "@/modules/table/types";
import { freshNotices, newestNoticeId } from "@/modules/table/utils/notices";

const MAX_SHOWN = 3;

/**
 * Table announcements ("Bina rebought · 2nd buy-in") that arrive while the
 * table is open; old ones aren't replayed on join.
 */
export const useNoticeFeed = () => {
  const [shown, setShown] = useState<Notice[]>([]);

  useEffect(() => {
    let seen: number | null =
      newestNoticeId(useGameStore.getState().room?.notices ?? []) ?? 0;
    return useGameStore.subscribe((s) => {
      const notices = s.room?.notices ?? [];
      const fresh = freshNotices(notices, seen);
      seen = newestNoticeId(notices) ?? seen;
      if (fresh.length > 0) {
        setShown((prev) => [...prev, ...fresh].slice(-MAX_SHOWN));
      }
    });
  }, []);

  const dismiss = useCallback(
    (id: number) => setShown((prev) => prev.filter((n) => n.id !== id)),
    [],
  );
  return { notices: shown, dismiss };
};
