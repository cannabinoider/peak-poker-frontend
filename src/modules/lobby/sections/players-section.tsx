"use client";

import { useState } from "react";

import { SectionTitle } from "@/lib/components/section-title";
import { useGameStore } from "@/modules/table/state/game-store";

import { MakeBankerSheet } from "../components/make-banker-sheet";
import { PlayerChip } from "../components/player-chip";
import type { Me, Room, Seat } from "../types";
import { lobbyRoles } from "../utils";

/** Seated players; the owner or banker taps one to make them the banker. */
export const PlayersSection = ({ room, me }: { room: Room; me: Me }) => {
  const makeBanker = useGameStore((s) => s.makeBanker);
  const [picked, setPicked] = useState<Seat | null>(null);
  const [open, setOpen] = useState(false);
  const { canPickBanker } = lobbyRoles(room, me);
  const seats = [...room.seats].sort((a, b) => a.seat - b.seat);

  return (
    <section className="pt-5">
      <SectionTitle>
        Players · {seats.length}/{room.maxSeats}
      </SectionTitle>
      {canPickBanker && (
        <p className="pb-3 text-faint">Tap a player to make them the banker</p>
      )}
      <ul className="flex flex-wrap gap-3.5">
        {seats.map((s) => (
          <li key={s.seat}>
            <PlayerChip
              seat={s}
              isYou={s.seat === me.seat}
              onPick={
                canPickBanker && !s.isBanker
                  ? () => {
                      setPicked(s);
                      setOpen(true);
                    }
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
      <MakeBankerSheet
        open={open}
        seat={picked}
        onClose={() => setOpen(false)}
        onConfirm={(seat) => {
          makeBanker(seat);
          setOpen(false);
        }}
      />
    </section>
  );
};
