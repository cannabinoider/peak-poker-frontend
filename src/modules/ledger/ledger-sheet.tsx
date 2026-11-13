"use client";

import { Sheet } from "@/lib/components/sheet";
import { fmt } from "@/lib/utils/format";
import { startingStack } from "@/modules/rules";
import type { StateMessage } from "@/modules/table/api/contracts";
import { CashOutRequests } from "@/modules/table/components/cash-out-request";
import { useGameStore } from "@/modules/table/state/game-store";

import { EndGameButton } from "./components/end-game-button";
import { LedgerIcon } from "./components/icons";
import { LedgerRow } from "./components/ledger-row";
import { RebuyRequests } from "./sections/rebuy-requests";
import { canManage, ledgerLines, totalPaid } from "./utils";

export interface LedgerSheetProps {
  room: StateMessage;
  open: boolean;
  onClose: () => void;
}

/**
 * The ledger sheet: each player's buy-ins, rupees paid, chips and live
 * profit/loss (exact: chips × buy-in ₹ / starting stack). The owner or banker
 * also sees rebuy requests and "End game & settle up".
 */
export const LedgerSheet = ({ room, open, onClose }: LedgerSheetProps) => {
  const endGame = useGameStore((s) => s.endGame);
  const lines = ledgerLines(room);
  const animals = new Map(room.seats.map((s) => [s.seat, s.animal]));
  const manage = canManage(room) && !room.settlement;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ledger"
      icon={<LedgerIcon />}
      footer={
        manage ? (
          <EndGameButton
            ending={room.ending}
            onEndGame={() => {
              endGame();
              onClose();
            }}
          />
        ) : undefined
      }>
      <p className="tabular text-dim">
        ₹{fmt(room.setup.buyInRupees)} per buy-in · {fmt(startingStack(room.setup))}{" "}
        chips · ₹{fmt(totalPaid(lines))} on the table
      </p>
      <RebuyRequests room={room} className="pt-3.5" />
      <div className="flex flex-col gap-2.5 pt-2.5 empty:hidden">
        <CashOutRequests room={room} />
      </div>
      <ul className="pt-2.5">
        {lines.map((line) => (
          <LedgerRow
            key={`${line.cashedOut ? "left" : "in"}-${line.seat}-${line.name}`}
            line={line}
            animal={animals.get(line.seat)}
          />
        ))}
      </ul>
      <p className="pt-1.5 text-[11px] text-faint">
        Chips are counted as of the start of the current hand.
      </p>
    </Sheet>
  );
};
