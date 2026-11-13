import { rupeesFor } from "../rules/utils.ts";

import type { LedgerLine, Room, Settlement } from "./types.ts";

/** Live ledger lines, seated players first. Value = chips × buy-in ₹ / starting stack. */
export const ledgerLines = (room: Pick<Room, "ledger" | "setup">): LedgerLine[] =>
  [...room.ledger]
    .sort((a, b) => Number(!!a.cashedOut) - Number(!!b.cashedOut) || a.seat - b.seat)
    .map((l) => {
      const paid = l.buyIns * room.setup.buyInRupees;
      const value = rupeesFor(room.setup, l.chips);
      return { ...l, paid, value, net: value - paid };
    });

/** Rupees bought in across the table. */
export const totalPaid = (lines: LedgerLine[]) =>
  lines.reduce((sum, l) => sum + l.paid, 0);

/** You are the owner or the banker (may approve rebuys and end the game). */
export const canManage = (room: Pick<Room, "seats" | "yourSeat">) => {
  const you = room.seats.find((s) => s.seat === room.yourSeat);
  return you !== undefined && (you.isOwner || you.isBanker);
};

/** Settlement results, biggest winner first. */
export const sortedResults = (settlement: Settlement) =>
  [...settlement.players].sort((a, b) => b.net - a.net);

/** Your name at the table, if you have a seat. */
export const yourName = (room: Pick<Room, "seats" | "yourSeat">) =>
  room.seats.find((s) => s.seat === room.yourSeat)?.name ?? null;
