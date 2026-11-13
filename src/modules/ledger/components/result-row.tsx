import { NetAmount } from "@/lib/components/chip";
import { fmt, rupees } from "@/lib/utils/format";

import type { SettlementPlayer } from "../types";

import { PlayerAvatar } from "./player-avatar";

type ResultRowProps = {
  player: SettlementPlayer;
  seat: number;
  animal?: string;
  isYou: boolean;
};

/** Final result: chips, their exact value, rupees paid, and net rounded to ₹1. */
export const ResultRow = ({ player: p, seat, animal, isYou }: ResultRowProps) => (
  <li className="flex items-center gap-2.5 py-[7px]">
    <PlayerAvatar name={p.name} seat={seat} animal={animal} size={38} />
    <div className="min-w-0 flex-1">
      <p className="truncate font-extrabold">{isYou ? `${p.name} (you)` : p.name}</p>
      <p className="tabular text-xs text-dim">
        {fmt(p.chips)} chips = {rupees(p.chipValue)} · paid ₹{fmt(p.paidRupees)}
        {p.buyIns > 1 && ` (${p.buyIns} buy-ins)`}
        {p.cashedOut && " · left the game with these chips"}
      </p>
    </div>
    <NetAmount value={p.net} variant="whole" className="shrink-0" />
  </li>
);
