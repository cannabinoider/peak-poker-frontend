"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";
import { listRoomSessions, type RoomSession } from "@/modules/session/session-storage";

import { MoreIcon } from "../components/icons";
import { RoomActionsSheet } from "../components/room-actions-sheet";

const joinedLabel = (joinedAt: number) =>
  new Date(joinedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** Rooms this device has joined (from localStorage), newest first. */
export const YourRooms = () => {
  const [rooms, setRooms] = useState<RoomSession[]>([]);
  const [menuFor, setMenuFor] = useState<RoomSession | null>(null);

  // localStorage only exists in the browser, so read it after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, read once after mount
    setRooms(listRoomSessions());
  }, []);

  if (rooms.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="your-rooms-title">
      <SectionTitle id="your-rooms-title">{`Your rooms · ${rooms.length}`}</SectionTitle>
      <ul className="grid gap-2.5 md:grid-cols-2 md:gap-3">
        {rooms.map((r) => (
          <li key={r.code} className="relative">
            <Link
              href={`/r/${r.code}`}
              className="block rounded-panel outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
              <Glass
                blur={false}
                className="flex items-center gap-4 pr-16 transition-colors hover:bg-white/[0.11]">
                <span className="tabular text-lg font-black tracking-[3px] text-gold">
                  {r.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-text">
                    {r.isOwner ? `Hosting as ${r.name}` : `Playing as ${r.name}`}
                  </span>
                  <span className="block text-xs text-dim">{`Joined ${joinedLabel(r.joinedAt)}`}</span>
                </span>
              </Glass>
            </Link>
            <button
              type="button"
              aria-label={`More options for room ${r.code}`}
              aria-haspopup="dialog"
              onClick={() => setMenuFor(r)}
              className="absolute right-1.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-dim outline-none transition-colors hover:bg-white/[0.08] hover:text-text focus-visible:ring-2 focus-visible:ring-gold/60 [&>svg]:size-5">
              <MoreIcon />
            </button>
          </li>
        ))}
      </ul>
      <RoomActionsSheet
        room={menuFor}
        onClose={() => setMenuFor(null)}
        onRemoved={(code) => {
          setMenuFor(null);
          setRooms((list) => list.filter((x) => x.code !== code));
        }}
      />
    </section>
  );
};
