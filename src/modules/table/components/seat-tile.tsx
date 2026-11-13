import { Avatar, isAnimal } from "@/lib/components/avatar";
import { CardFan } from "@/lib/components/card-fan";
import { BetChip } from "@/lib/components/chip";
import { fmt } from "@/lib/utils/format";
import { cn } from "@/lib/utils/styles";
import type { Room, Seat } from "@/modules/table/types";
import { markFor } from "@/modules/table/utils/marks";
import {
  actionTone,
  payouts,
  playerOf,
  seatBadge,
  seatStatus,
} from "@/modules/table/utils/room";

import { Icon } from "./icons";
import { TurnRing } from "./turn-ring";

const ACTION_CLASSES = {
  red: "bg-red/20 text-red",
  gold: "bg-gold/20 text-gold",
  blue: "bg-[#93C5FD]/20 text-[#93C5FD]",
  green: "bg-green/20 text-green",
} as const;

const AVATAR = 40;
/** Avatar + 3px padding + 2.5px ring on each side. */
const RING = AVATAR + 2 * (3 + 2.5);

type SeatTileProps = {
  room: Room;
  seat: Seat;
  width: number;
  /** Which side of the avatar this street's bet sits on (the side facing the centre). */
  betSide: "left" | "right";
};

/** One player around the felt (Flutter `_SeatTile`). */
export const SeatTile = ({ room, seat, width, betSide }: SeatTileProps) => {
  const hand = room.hand;
  const hs = playerOf(hand, seat.seat);
  const inHand = hs !== undefined;
  const toAct = hand?.toActSeat === seat.seat;
  const choosing = room.choosing?.seat === seat.seat;
  const won = payouts(hand?.result).get(seat.seat);
  const stack = hs?.stack ?? seat.stack;
  const isYou = seat.seat === room.yourSeat;
  const folded = hs?.folded ?? false;
  const badge = seatBadge(room, seat.seat);
  const status = seatStatus(room, seat);
  const glow = won !== undefined ? "gold" : toAct || choosing ? "green" : null;
  const showAction =
    hs?.lastAction && seat.connected && !choosing && hand?.result === undefined;
  const bet = hand?.result === undefined ? (hs?.streetBet ?? 0) : 0;
  const allIn = (hs?.allIn ?? false) && !folded;

  return (
    <div
      className="flex flex-col items-center transition-opacity duration-[250ms]"
      style={{ width, opacity: folded || !seat.connected ? 0.45 : 1 }}>
      <div className="flex h-[30px] items-end justify-center">
        {inHand && !folded && !isYou && hand && (
          <CardFan
            cards={hs.hole}
            count={hs.holeCount}
            width={hs.holeCount > 2 ? 17 : 21}
            overlap={hs.holeCount > 2 ? 0.55 : 0.35}
            markOf={(c) => markFor(hand, c)}
            className="-mb-1"
          />
        )}
      </div>
      <div className="relative" style={{ width: RING, height: RING }}>
        <div
          className={cn(
            "rounded-full border-[2.5px] p-[3px] transition-[border-color,box-shadow] duration-[250ms]",
            glow === "gold"
              ? "border-gold shadow-[0_0_14px_2px_rgb(var(--gold)/0.55)]"
              : glow === "green"
                ? "border-green shadow-[0_0_14px_2px_rgb(var(--green)/0.55)]"
                : allIn
                  ? "border-all-in shadow-[0_0_14px_2px_rgb(var(--all-in)/0.6)]"
                  : isYou
                    ? "border-white/[0.54]"
                    : "border-transparent",
          )}>
          <Avatar
            name={seat.name}
            seat={seat.seat}
            animal={isAnimal(seat.animal) ? seat.animal : null}
            size={AVATAR}
          />
        </div>
        {toAct && room.turnSecondsLeft !== undefined && (
          <TurnRing
            seconds={room.turnSecondsLeft}
            total={room.setup.turnSeconds}
            size={RING}
          />
        )}
        {badge && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-1.5 rounded-lg px-[5px] py-0.5 text-[9px] font-black leading-none shadow-[0_0_6px_rgba(0,0,0,0.45)]",
              badge === "D" ? "bg-white text-black" : "bg-[#334155] text-white",
            )}
            aria-label={
              badge === "D" ? "Dealer" : badge === "SB" ? "Small blind" : "Big blind"
            }>
            {badge}
          </span>
        )}
        {bet > 0 && (
          <div
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2",
              betSide === "left" ? "right-full -mr-1.5" : "left-full -ml-1.5",
            )}>
            <BetChip amount={bet} aria-label={`Bet ${bet}`} />
          </div>
        )}
        {allIn && (
          <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-all-in px-1 py-px text-[8px] font-black uppercase leading-none tracking-wide text-white shadow-[0_0_6px_rgba(0,0,0,0.45)]">
            All-in
          </span>
        )}
        {seat.isBanker && (
          <span
            aria-label="Banker"
            className="absolute -left-1.5 -top-1 inline-flex rounded-full bg-gold p-[3px] text-black/[0.87]">
            <Icon name="bank" size={11} />
          </span>
        )}
      </div>
      <span className="mt-1 block w-full rounded-[10px] border border-glass bg-black/50 px-1.5 py-[3px] text-center text-[11px] font-bold leading-tight">
        <span className="block truncate text-white">{isYou ? "You" : seat.name}</span>
        <span
          className={cn("tabular block", won !== undefined ? "text-gold" : "text-dim")}>
          {won !== undefined ? `+${fmt(won)}` : fmt(stack)}
        </span>
      </span>
      {showAction ? (
        <span
          className={cn(
            "mt-0.5 max-w-full truncate rounded-md px-1.5 py-px text-[10px] font-extrabold",
            allIn
              ? "bg-all-in/25 text-all-in"
              : ACTION_CLASSES[actionTone(hs.lastAction!)],
          )}>
          {hs.lastAction}
        </span>
      ) : (
        status && <span className="text-[10px] text-faint">{status}</span>
      )}
    </div>
  );
};
