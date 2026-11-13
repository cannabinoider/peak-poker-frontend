/*
 * High-hand evaluator, ported from poker-backend/src/engine/evaluator.ts (only
 * what the table needs: your current hand's name and the "Best split"
 * suggestion). The server stays the judge of who wins.
 */
import type { HandCategory } from "../../types.ts";

import { type EngineCard, SUITS } from "./card.ts";

/** Hand categories, weakest first. The array index is the category's strength. */
export const HAND_CATEGORIES: readonly HandCategory[] = [
  "highCard",
  "pair",
  "twoPair",
  "trips",
  "straight",
  "flush",
  "fullHouse",
  "quads",
  "straightFlush",
  "fiveOfAKind",
];

export const HAND_CATEGORY_LABELS: Record<HandCategory, string> = {
  highCard: "High card",
  pair: "Pair",
  twoPair: "Two pair",
  trips: "Three of a kind",
  straight: "Straight",
  flush: "Flush",
  fullHouse: "Full house",
  quads: "Four of a kind",
  straightFlush: "Straight flush",
  fiveOfAKind: "Five of a kind",
};

const RANK_NAMES = [
  "",
  "",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "jack",
  "queen",
  "king",
  "ace",
] as const;

const RANK_PLURALS = [
  "",
  "",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "sevens",
  "eights",
  "nines",
  "tens",
  "jacks",
  "queens",
  "kings",
  "aces",
] as const;

const rankName = (rank: number | undefined) =>
  rank !== undefined && rank >= 2 && rank <= 14 ? RANK_NAMES[rank] : "";

const rankPlural = (rank: number | undefined) =>
  rank !== undefined && rank >= 2 && rank <= 14 ? RANK_PLURALS[rank] : "";

const capital = (word: string) =>
  word.length === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`;

/**
 * Showdown phrase from the evaluator's tiebreak, most significant rank first.
 * Same wording as the server's `describeHand`.
 */
export const describeHand = (
  category: HandCategory,
  tiebreak: readonly number[],
): string => {
  const top = rankName(tiebreak[0]);
  const topPlural = rankPlural(tiebreak[0]);
  switch (category) {
    case "highCard":
      return top ? `${capital(top)} high` : HAND_CATEGORY_LABELS.highCard;
    case "pair": {
      if (!topPlural) {
        return HAND_CATEGORY_LABELS.pair;
      }
      const kicker = rankName(tiebreak[1]);
      return kicker ? `Pair of ${topPlural}, ${kicker} kicker` : `Pair of ${topPlural}`;
    }
    case "twoPair": {
      const high = rankPlural(tiebreak[0]);
      const low = rankPlural(tiebreak[1]);
      const kicker = rankName(tiebreak[2]);
      if (high && low && kicker) {
        return `Two pair, ${high} and ${low}, ${kicker} kicker`;
      }
      if (high && low) {
        return `Two pair, ${high} and ${low}`;
      }
      if (kicker) {
        return `Two pair, ${kicker} kicker`;
      }
      return HAND_CATEGORY_LABELS.twoPair;
    }
    case "trips":
      return topPlural ? `Three of a kind, ${topPlural}` : HAND_CATEGORY_LABELS.trips;
    case "straight":
      return top ? `Straight, ${top} high` : HAND_CATEGORY_LABELS.straight;
    case "flush":
      return top ? `Flush, ${top} high` : HAND_CATEGORY_LABELS.flush;
    case "fullHouse": {
      const pair = rankPlural(tiebreak[1]);
      return topPlural && pair
        ? `Full house, ${topPlural} full of ${pair}`
        : HAND_CATEGORY_LABELS.fullHouse;
    }
    case "quads":
      return topPlural ? `Four of a kind, ${topPlural}` : HAND_CATEGORY_LABELS.quads;
    case "straightFlush":
      if (tiebreak[0] === 14) {
        return "Royal flush";
      }
      return top ? `Straight flush, ${top} high` : HAND_CATEGORY_LABELS.straightFlush;
    case "fiveOfAKind":
      return topPlural
        ? `Five of a kind, ${topPlural}`
        : HAND_CATEGORY_LABELS.fiveOfAKind;
  }
};

const categoryIndex = (c: HandCategory) => HAND_CATEGORIES.indexOf(c);

/** Short-deck ordering: flush beats full house, three of a kind beats a straight. */
const shortOrder = (c: HandCategory) => {
  switch (c) {
    case "straight":
      return categoryIndex("trips");
    case "trips":
      return categoryIndex("straight");
    case "flush":
      return categoryIndex("fullHouse");
    case "fullHouse":
      return categoryIndex("flush");
    default:
      return categoryIndex(c);
  }
};

const pack = (order: number, t: readonly number[]) => {
  let s = order;
  for (let i = 0; i < 5; i++) {
    s = s * 16 + (i < t.length ? t[i] : 0);
  }
  return s;
};

/** A made hand. Higher `score` wins; equal scores tie. */
export interface HandValue {
  readonly category: HandCategory;
  readonly tiebreak: readonly number[];
  /** The actual cards making the hand (wild cards appear as dealt). */
  readonly cards: readonly EngineCard[];
  readonly score: number;
}

export const handValue = (
  category: HandCategory,
  tiebreak: readonly number[],
  cards: readonly EngineCard[],
  shortDeck = false,
): HandValue => ({
  category,
  tiebreak,
  cards,
  score: pack(shortDeck ? shortOrder(category) : categoryIndex(category), tiebreak),
});

/**
 * Evaluates 0–5 cards. Straights and flushes need all five; with fewer cards
 * only pairs, trips and quads count (poison can leave a player short).
 */
export const evaluateCards = (
  cards: readonly EngineCard[],
  shortDeckWheel = false,
): HandValue => {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  if (cards.length === 0) {
    return handValue("highCard", [], cards);
  }
  const full = cards.length === 5;
  const isFlush = full && cards.every((c) => c.suit === cards[0].suit);

  const counts = new Map<number, number>();
  for (const r of ranks) {
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }

  let straightHigh: number | null = null;
  if (full && counts.size === 5) {
    if (ranks[0] - ranks[4] === 4) {
      straightHigh = ranks[0];
    } else if (ranks[0] === 14 && ranks[1] === 5 && ranks[4] === 2) {
      straightHigh = 5;
    } else if (shortDeckWheel && ranks[0] === 14 && ranks[1] === 9 && ranks[4] === 6) {
      straightHigh = 9;
    }
  }

  const groups = [...counts.entries()].sort((a, b) =>
    b[1] !== a[1] ? b[1] - a[1] : b[0] - a[0],
  );
  const grouped = groups.map(([rank]) => rank);
  const shape = groups.map(([, count]) => count);
  const second = shape.length > 1 ? shape[1] : 0;

  if (shape[0] === 5) {
    return handValue("fiveOfAKind", grouped, cards);
  }
  if (straightHigh !== null && isFlush) {
    return handValue("straightFlush", [straightHigh], cards);
  }
  if (shape[0] === 4) {
    return handValue("quads", grouped, cards);
  }
  if (shape[0] === 3 && second === 2) {
    return handValue("fullHouse", grouped, cards);
  }
  if (isFlush) {
    return handValue("flush", ranks, cards);
  }
  if (straightHigh !== null) {
    return handValue("straight", [straightHigh], cards);
  }
  if (shape[0] === 3) {
    return handValue("trips", grouped, cards);
  }
  if (shape[0] === 2 && second === 2) {
    return handValue("twoPair", grouped, cards);
  }
  if (shape[0] === 2) {
    return handValue("pair", grouped, cards);
  }
  return handValue("highCard", ranks, cards);
};

/** Best value of five cards where `wilds` of them may be any card. */
export const evaluateWithWilds = (
  naturals: readonly EngineCard[],
  wilds: number,
): HandValue => {
  if (naturals.length + wilds !== 5) {
    throw new Error("naturals + wilds must be 5");
  }
  if (wilds === 0) {
    return evaluateCards(naturals);
  }
  const suits = new Set(naturals.map((c) => c.suit));
  const flushSuit = suits.size <= 1 ? (suits.size === 0 ? "s" : [...suits][0]) : null;
  const offSuit = SUITS.find((s) => s !== (flushSuit ?? "c"))!;
  const trySuits = flushSuit !== null ? [flushSuit, offSuit] : [offSuit];

  let best: HandValue | null = null;
  // Wild ranks as a non-decreasing multiset: suits only matter for flushes.
  const picks = new Array<number>(wilds).fill(2);
  for (;;) {
    for (const suit of trySuits) {
      const v = evaluateCards([...naturals, ...picks.map((rank) => ({ rank, suit }))]);
      if (best === null || v.score > best.score) {
        best = v;
      }
    }
    let i = wilds - 1;
    while (i >= 0 && picks[i] === 14) {
      i--;
    }
    if (i < 0) {
      break;
    }
    picks[i]++;
    for (let j = i + 1; j < wilds; j++) {
      picks[j] = picks[i];
    }
  }
  return best!;
};

/** All k-element combinations of `items`, in order. */
export const combinations = <T>(items: readonly T[], k: number): T[][] => {
  if (k < 0 || k > items.length) {
    return [];
  }
  const out: T[][] = [];
  const idx = Array.from({ length: k }, (_, i) => i);
  for (;;) {
    out.push(idx.map((i) => items[i]));
    let i = k - 1;
    while (i >= 0 && idx[i] === items.length - k + i) {
      i--;
    }
    if (i < 0) {
      return out;
    }
    idx[i]++;
    for (let j = i + 1; j < k; j++) {
      idx[j] = idx[j - 1] + 1;
    }
  }
};

export interface BestHandOptions {
  /** Hands must use exactly this many hole cards (Omaha: 2); null = any five. */
  exactHole?: number | null;
  shortDeckWheel?: boolean;
  /** Every card of this rank can stand in for any card. */
  wildRank?: number | null;
  /** Every card of these ranks is dead. */
  poisonRanks?: Iterable<number>;
}

/**
 * Best high hand from `hole` + `board`. Poisoned ranks are removed; if that
 * leaves fewer than five usable cards, the best smaller hand is made.
 */
export const bestHand = (
  hole: readonly EngineCard[],
  board: readonly EngineCard[],
  options: BestHandOptions = {},
): HandValue => {
  const shortDeckWheel = options.shortDeckWheel ?? false;
  const wildRank = options.wildRank ?? null;
  const dead = new Set<number>(options.poisonRanks ?? []);
  if (wildRank !== null) {
    dead.delete(wildRank);
  }
  const h = dead.size === 0 ? hole : hole.filter((c) => !dead.has(c.rank));
  const b = dead.size === 0 ? board : board.filter((c) => !dead.has(c.rank));

  let best: HandValue | null = null;
  const consider = (cards: EngineCard[]) => {
    let v: HandValue;
    if (wildRank !== null && cards.length === 5) {
      const naturals = cards.filter((c) => c.rank !== wildRank);
      v = { ...evaluateWithWilds(naturals, 5 - naturals.length), cards };
    } else {
      v = evaluateCards(cards, shortDeckWheel);
    }
    if (shortDeckWheel) {
      v = handValue(v.category, v.tiebreak, v.cards, true);
    }
    if (best === null || v.score > best.score) {
      best = v;
    }
  };

  const n = options.exactHole ?? null;
  if (n === null) {
    const pool = [...h, ...b];
    for (const cards of combinations(pool, Math.min(pool.length, 5))) {
      consider(cards);
    }
  } else {
    const nh = Math.min(h.length, n);
    const nb = Math.min(b.length, 5 - n);
    const boardSets = combinations(b, nb);
    for (const hc of combinations(h, nh)) {
      for (const bc of boardSets) {
        consider([...hc, ...bc]);
      }
    }
  }
  return best ?? handValue("highCard", [], []);
};

/** "8-6-4-2-A" (hi-lo low, ace = 1). */
export const lowLabel = (low: readonly number[]) =>
  low.map((r) => (r === 1 ? "A" : String(r))).join("-");
