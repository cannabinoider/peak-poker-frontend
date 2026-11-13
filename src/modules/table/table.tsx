"use client";

import { useState } from "react";

import { LedgerSheet } from "@/modules/ledger";
import { RulesSheet } from "@/modules/rules";
import { WinnerCelebration } from "@/modules/table/components/winner-celebration";
import { BottomPanel } from "@/modules/table/sections/bottom-panel";
import { MenuSheet } from "@/modules/table/sections/menu-sheet";
import { NoticeFeed } from "@/modules/table/sections/notice-feed";
import { SeatActionsSheet } from "@/modules/table/sections/seat-actions-sheet";
import { TableArea } from "@/modules/table/sections/table-area";
import { TopBar } from "@/modules/table/sections/top-bar";
import { useGameStore } from "@/modules/table/state/game-store";
import { seatOf } from "@/modules/table/utils/room";
import type { Win } from "@/modules/table/utils/sound-events";

type OpenSheet = "rules" | "ledger" | "menu" | null;

/**
 * The poker table once the game has started (port of the Flutter
 * `TableScreen`): top bar, the oval felt with everyone's seats, and your cards
 * and controls at the bottom. Reads everything from the game store.
 */
export const Table = ({ win }: { win: Win | null }) => {
  const room = useGameStore((s) => s.room);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [managed, setManaged] = useState<number | null>(null);

  if (!room) {
    return null;
  }
  const managedSeat = managed === null ? null : (seatOf(room, managed) ?? null);
  const close = () => setSheet(null);

  return (
    <main className="mx-auto flex h-dvh max-h-dvh w-full max-w-3xl flex-col overflow-hidden pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:max-w-none lg:overflow-y-auto lg:overflow-x-hidden">
      <TopBar
        room={room}
        onRules={() => setSheet("rules")}
        onLedger={() => setSheet("ledger")}
        onMenu={() => setSheet("menu")}
      />
      <div className="relative flex min-h-[200px] flex-1 flex-col lg:min-h-0">
        <TableArea room={room} onSeatTap={(s) => setManaged(s.seat)} />
        {win && <WinnerCelebration win={win} />}
      </div>
      <BottomPanel room={room} celebrating={win !== null} />

      <NoticeFeed />
      <MenuSheet
        room={room}
        open={sheet === "menu"}
        onClose={close}
        onRules={() => setSheet("rules")}
        onLedger={() => setSheet("ledger")}
      />
      <RulesSheet
        hand={room.hand}
        setup={room.setup}
        open={sheet === "rules"}
        onClose={close}
      />
      <LedgerSheet room={room} open={sheet === "ledger"} onClose={close} />
      <SeatActionsSheet seat={managedSeat} onClose={() => setManaged(null)} />
    </main>
  );
};
