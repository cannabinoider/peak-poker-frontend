"use client";

import { GoldButton } from "@/lib/components/button";
import { RelieveBankerButton } from "@/modules/table/components/relieve-banker";
import { useGameStore } from "@/modules/table/state/game-store";

import { HourglassIcon, PlayIcon } from "../components/icons";
import { MIN_PLAYERS } from "../constants";
import type { Me, Room } from "../types";
import { lobbyRoles } from "../utils";

/** Banker: Start game (needs 2+ players). Everyone else: waiting for the banker. */
export const StartSection = ({ room, me }: { room: Room; me: Me }) => {
  const startGame = useGameStore((s) => s.startGame);
  const { isBanker, canStart, banker } = lobbyRoles(room, me);

  if (isBanker) {
    return (
      <GoldButton icon={<PlayIcon />} disabled={!canStart} onClick={startGame}>
        {room.seats.length >= MIN_PLAYERS
          ? "Start game"
          : "Waiting for at least 2 players"}
      </GoldButton>
    );
  }
  return (
    <div className="flex w-full flex-col gap-2">
      <div
        role="status"
        className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border border-glass bg-glass px-4 py-2 text-center">
        <p className="flex items-center gap-2 font-semibold">
          <HourglassIcon className="size-[18px] text-gold" />
          Waiting for the banker to start
        </p>
        {banker && <p className="text-xs text-dim">{banker.name} is the banker</p>}
      </div>
      <RelieveBankerButton bankerAway={room.bankerAway} />
    </div>
  );
};
