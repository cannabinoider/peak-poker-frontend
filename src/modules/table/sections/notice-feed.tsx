"use client";

import { useEffect } from "react";

import { Icon } from "@/modules/table/components/icons";
import { NOTICE_MS } from "@/modules/table/constants";
import { useNoticeFeed } from "@/modules/table/hooks/use-notice-feed";
import type { Notice } from "@/modules/table/types";

const NoticeItem = ({
  notice,
  onDone,
}: {
  notice: Notice;
  onDone: (id: number) => void;
}) => {
  useEffect(() => {
    const t = setTimeout(() => onDone(notice.id), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice.id, onDone]);
  return (
    <li className="flex animate-slide-up items-center gap-2.5 rounded-2xl border border-glass bg-black/80 px-4 py-3 text-sm text-white backdrop-blur">
      <Icon name="campaign" size={20} className="shrink-0 text-gold" />
      <span className="min-w-0 flex-1">{notice.text}</span>
    </li>
  );
};

/** New table announcements ("Bina rebought · 2nd buy-in"), shown for a few seconds. */
export const NoticeFeed = () => {
  const { notices, dismiss } = useNoticeFeed();
  return (
    <ul
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-[max(64px,calc(env(safe-area-inset-top)+52px))] z-40 mx-auto flex max-w-sm flex-col gap-2">
      {notices.map((n) => (
        <NoticeItem key={n.id} notice={n} onDone={dismiss} />
      ))}
    </ul>
  );
};
