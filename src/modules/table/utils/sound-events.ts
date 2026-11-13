/* What changed between two table states, as sounds and a winner to celebrate. */
import type { Hand, Room } from "../types.ts";

import { nameOf, payouts, seatOf } from "./room.ts";

export type TableSound =
  | { kind: "deal" }
  | { kind: "chips"; count: number }
  | { kind: "check" }
  | { kind: "fold" }
  | { kind: "cards"; count: number }
  | { kind: "yourTurn" };

export interface Win {
  /** Changes each hand, so the same winner twice in a row still celebrates. */
  key: string;
  seat: number;
  name: string;
  animal: string;
  amount: number;
  you: boolean;
}

export interface TableEvents {
  sounds: TableSound[];
  win: Win | null;
}

const NONE: TableEvents = { sounds: [], win: null };

const CHIPS_CALL = 4;
const CHIPS_RAISE = 6;
const CHIPS_ALL_IN = 10;

const boardCards = (hand: Hand) => hand.boards.reduce((n, b) => n + b.length, 0);

const isMyTurn = (room: Room) => {
  const me = room.yourSeat;
  if (me === null) {
    return false;
  }
  const h = room.hand;
  return (
    room.choosing?.seat === me ||
    (h !== null &&
      !h.result &&
      (h.toActSeat === me || h.discarding.includes(me) || h.splitting.includes(me)))
  );
};

/**
 * The only player paid by a finished hand. A chop, or pots won by different
 * people, is not a celebration: one animal would look like a single winner.
 * Someone who scoops every pot still celebrates, for the chips they took.
 */
export const winnerOf = (room: Room): Win | null => {
  const hand = room.hand;
  if (!hand?.result) {
    return null;
  }
  const paid = [...payouts(hand.result)].filter(([, amount]) => amount > 0);
  if (paid.length !== 1) {
    return null;
  }
  const [seat, amount] = paid[0];
  return {
    key: `${room.code}:${hand.handNumber}`,
    seat,
    name: nameOf(room, seat),
    animal: seatOf(room, seat)?.animal ?? "",
    amount,
    you: seat === room.yourSeat,
  };
};

/** Sounds within one hand: chips, checks, folds, cards turned. */
const handSounds = (prev: Hand, next: Hand): TableSound[] => {
  const sounds: TableSound[] = [];
  let folded = false;
  let checked = false;
  let allIn = false;
  let raised = false;
  for (const p of next.players) {
    const before = prev.players.find((q) => q.seat === p.seat);
    if (!before) {
      continue;
    }
    folded ||= p.folded && !before.folded;
    allIn ||= p.allIn && !before.allIn;
    if (p.lastAction !== before.lastAction) {
      checked ||= p.lastAction === "Check";
      raised ||= /^(Bet|Raise)/.test(p.lastAction ?? "");
    }
  }
  const potUp = next.pot > prev.pot;
  // The check that closes a street (or the hand) resets the labels before we see it.
  const closed = next.street > prev.street || (!!next.result && !prev.result);
  if (folded) {
    sounds.push({ kind: "fold" });
  }
  if (potUp) {
    sounds.push({
      kind: "chips",
      count: allIn ? CHIPS_ALL_IN : raised ? CHIPS_RAISE : CHIPS_CALL,
    });
  } else if (checked || (closed && !folded)) {
    sounds.push({ kind: "check" });
  }
  const turned = boardCards(next) - boardCards(prev);
  const discarded = prev.discarding.filter((s) => !next.discarding.includes(s)).length;
  if (turned + discarded > 0) {
    sounds.push({ kind: "cards", count: turned + discarded });
  }
  return sounds;
};

/** Everything worth hearing or seeing between `prev` and `next` (none on first load). */
export const tableEvents = (prev: Room | null, next: Room): TableEvents => {
  if (!prev) {
    return NONE;
  }
  const ph = prev.hand;
  const nh = next.hand;
  const sounds: TableSound[] = [];
  const sameHand = nh !== null && ph?.handNumber === nh.handNumber;
  if (nh && !sameHand) {
    sounds.push({ kind: "deal" });
  } else if (nh && ph) {
    sounds.push(...handSounds(ph, nh));
  }
  if (isMyTurn(next) && !isMyTurn(prev)) {
    sounds.push({ kind: "yourTurn" });
  }
  const justFinished = !!nh?.result && !(sameHand && ph?.result);
  return { sounds, win: justFinished ? winnerOf(next) : null };
};
