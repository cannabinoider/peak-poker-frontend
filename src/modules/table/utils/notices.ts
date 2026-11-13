import type { Notice } from "../types.ts";

/** Newest notice id, or null if there are none. */
export const newestNoticeId = (notices: readonly Notice[]) =>
  notices.length === 0 ? null : notices[notices.length - 1].id;

/**
 * Notices that arrived since `seen` (don't replay old ones on join: a null
 * `seen` means "nothing seen yet", which shows nothing).
 */
export const freshNotices = (notices: readonly Notice[], seen: number | null) =>
  seen === null ? [] : notices.filter((n) => n.id > seen);
