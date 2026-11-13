/*
 * Showdown text and highlights (Flutter `_resultLines`, `_CenterInfo`
 * winning cards, `_MultiBoard` used cards).
 */
import { fmt } from "../../../lib/utils/format.ts";
import type { Hand, HandResult, Room } from "../types.ts";

import { describeHand, lowLabel } from "./engine/evaluator.ts";
import { nameOf, payouts } from "./room.ts";

/** Showdown phrase for a seat, e.g. "Pair of fours, jack kicker". */
const phrase = (h: {
  category: HandResult["shownHands"][string]["category"];
  tiebreak: readonly number[];
  description?: string;
}) => {
  // An empty description is missing: name the hand from its tiebreak.
  if (h.description) {
    return h.description;
  }
  return describeHand(h.category, h.tiebreak);
};

/** Showdown phrase for a seat, e.g. "Two pair, kings and fives, ace kicker". */
export const handLabel = (result: HandResult, seat: number) => {
  const h = result.shownHands[String(seat)];
  return h ? phrase(h) : null;
};

/** Multi-board: the hand phrase a seat made on board `b`. */
export const boardLabel = (result: HandResult, seat: number, b: number) => {
  const h = result.boardHands[String(seat)]?.[b];
  return h ? phrase(h) : null;
};

const sum = (share: Record<string, number>) =>
  Object.values(share).reduce((a, c) => a + c, 0);

/** Seats paid from a share map, lowest seat first. A zero share is omitted. */
const awarded = (share: Record<string, number>) =>
  Object.entries(share)
    .map(([seat, amount]) => ({ seat: Number(seat), amount }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => a.seat - b.seat);

/** "Main pot", or "Side pot" / "Side pot 2" once a hand has several pots. */
const potLabel = (index: number, count: number) => {
  if (index === 0) {
    return "Main pot";
  }
  return count === 2 ? "Side pot" : `Side pot ${index}`;
};

const join = (parts: (string | null | undefined)[]) =>
  parts.filter((p): p is string => !!p).join(" · ");

/**
 * One award. Outright: "Main pot: Riya wins 500 · Flush, ace high".
 * Chopped: "Side pot 500 split: Riya 250, Kabir 250 · Pair of aces".
 * If the winners' hands differ, each share carries its own phrase.
 */
const awardLine = (
  room: Room,
  title: string | null,
  share: Record<string, number>,
  amount: number,
  labelOf: (seat: number) => string | null,
): string | null => {
  const entries = awarded(share);
  if (entries.length === 0) {
    return null;
  }
  const name = (seat: number) => nameOf(room, seat);
  const labels = entries.map((entry) => labelOf(entry.seat));
  const unique = [...new Set(labels.filter((label): label is string => !!label))];
  const shared =
    unique.length === 1 && labels.every((label) => label === unique[0])
      ? unique[0]
      : null;

  if (entries.length === 1) {
    const who = `${name(entries[0].seat)} wins ${fmt(amount)}`;
    return title ? join([`${title}: ${who}`, shared]) : join([who, shared]);
  }

  const shares = entries
    .map((entry, i) => {
      const bit = `${name(entry.seat)} ${fmt(entry.amount)}`;
      const label = labels[i];
      return shared || !label ? bit : `${bit} (${label})`;
    })
    .join(", ");
  const head = `${title ?? "Main pot"} ${fmt(amount)} split: ${shares}`;
  return shared ? `${head} · ${shared}` : head;
};

const kept = (lines: (string | null)[]): string[] =>
  lines.filter((line): line is string => line !== null);

/** One line per pot (and per board / high-low half) under the board. */
export const resultLines = (room: Room, result: HandResult, hand: Hand): string[] => {
  const many = result.pots.length > 1;
  const show = (seat: number) =>
    result.wentToShowdown ? handLabel(result, seat) : null;
  const named = (index: number) => potLabel(index, result.pots.length);

  if (hand.hiLo && result.wentToShowdown) {
    return result.pots.flatMap((pot, i) => {
      const [high, low] = pot.byBoard;
      const potBit = many ? `${named(i)} ` : "";
      if (pot.byBoard.length === 2 && low && Object.keys(low).length > 0) {
        return kept([
          awardLine(room, `${potBit}High`, high, sum(high), show),
          awardLine(room, `${potBit}Low`, low, sum(low), (seat) => {
            const ranks = result.lows[String(seat)];
            return ranks ? lowLabel(ranks) : null;
          }),
        ]);
      }
      return kept([
        awardLine(
          room,
          `${potBit}No low · High takes all`,
          pot.shares,
          pot.amount,
          show,
        ),
      ]);
    });
  }

  if (hand.boards.length > 1 && result.wentToShowdown) {
    return result.pots.flatMap((pot, i) =>
      pot.byBoard.flatMap((share, b) => {
        if (Object.keys(share).length === 0) {
          return [];
        }
        const title = join([many ? named(i) : null, `Board ${b + 1}`]);
        const line = awardLine(room, title, share, sum(share), (seat) =>
          boardLabel(result, seat, b),
        );
        return line ? [line] : [];
      }),
    );
  }

  return result.pots.flatMap((pot, i) => {
    const winners = awarded(pot.shares);
    if (winners.length === 0) {
      return [];
    }
    const title = many || winners.length > 1 ? named(i) : null;
    const line = awardLine(room, title, pot.shares, pot.amount, show);
    return line ? [line] : [];
  });
};

/** Cards the winners used (highlighted on a single board). */
export const winningCards = (result: HandResult | undefined): Set<string> => {
  const out = new Set<string>();
  if (!result) {
    return out;
  }
  for (const seat of payouts(result).keys()) {
    for (const c of result.shownHands[String(seat)]?.cards ?? []) {
      out.add(c);
    }
  }
  return out;
};

/** Multi-board: board index → cards each board's winners used. */
export const usedPerBoard = (
  result: HandResult | undefined,
): Map<number, Set<string>> => {
  const used = new Map<number, Set<string>>();
  for (const pot of result?.pots ?? []) {
    pot.byBoard.forEach((share, b) => {
      for (const s of Object.keys(share)) {
        const set = used.get(b) ?? new Set<string>();
        for (const c of result?.boardHands[s]?.[b]?.cards ?? []) {
          set.add(c);
        }
        used.set(b, set);
      }
    });
  }
  return used;
};
