/**
 * Card parsing, ported from the engine's `Card.parse` (poker_engine/card.dart)
 * and the labels in the Flutter `playing_card.dart`.
 */

export type Suit = "clubs" | "diamonds" | "hearts" | "spades";

export type SuitColor = "red" | "black";

export type ParsedCard = {
  /** Normalized engine code: "As", "Td", "2c". */
  code: string;
  /** Engine rank char: "2".."9", "T", "J", "Q", "K", "A". */
  rank: string;
  /** 2..14 (14 = Ace). */
  rankValue: number;
  /** What is printed on the card: "A", "10", "7". */
  rankLabel: string;
  suit: Suit;
  color: SuitColor;
  /** Ink color of the suit, as hex. */
  hex: string;
};

export const RANK_CHARS = "23456789TJQKA";

/** Card ink colors from the Flutter widget (not app tokens). */
export const SUIT_RED = "#E11D48";
export const SUIT_BLACK = "#111827";

const SUIT_BY_LETTER: Record<string, Suit> = {
  c: "clubs",
  d: "diamonds",
  h: "hearts",
  s: "spades",
};

const RANK_NAMES: Record<string, string> = {
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  T: "Ten",
  J: "Jack",
  Q: "Queen",
  K: "King",
  A: "Ace",
};

export const isRedSuit = (suit: Suit) => suit === "hearts" || suit === "diamonds";

export const suitColor = (suit: Suit): SuitColor => (isRedSuit(suit) ? "red" : "black");

export const suitHex = (suit: Suit) => (isRedSuit(suit) ? SUIT_RED : SUIT_BLACK);

/** "s" / "S" / "spades" → "spades"; anything else → null. */
export const parseSuit = (s: string): Suit | null => {
  const t = s.trim().toLowerCase();
  const suits = Object.values(SUIT_BY_LETTER);
  return (
    (Object.hasOwn(SUIT_BY_LETTER, t) ? SUIT_BY_LETTER[t] : undefined) ??
    suits.find((x) => x === t) ??
    null
  );
};

/**
 * Parses "As", "Td", "2c" (also "10h", any case, surrounding spaces ignored).
 * Returns null for anything that is not a card.
 */
export const parseCard = (s: string): ParsedCard | null => {
  const t = s.trim();
  if (t.length < 2) {
    return null;
  }
  const rankPart = t.slice(0, -1).toUpperCase();
  const rank = rankPart === "10" ? "T" : rankPart;
  if (rank.length !== 1 || !RANK_CHARS.includes(rank)) {
    return null;
  }
  const suit = parseSuit(t.slice(-1));
  if (!suit) {
    return null;
  }
  return {
    code: `${rank}${suit[0]}`,
    rank,
    rankValue: RANK_CHARS.indexOf(rank) + 2,
    rankLabel: rank === "T" ? "10" : rank,
    suit,
    color: suitColor(suit),
    hex: suitHex(suit),
  };
};

/** "10 of hearts", "A of spades" — the Flutter `cardLabel`, for buttons/messages. */
export const cardLabel = (c: ParsedCard) => `${c.rankLabel} of ${c.suit}`;

/** "Ace of spades", "Ten of hearts" — for screen readers. */
export const cardName = (c: ParsedCard) =>
  `${RANK_NAMES[c.rank] ?? c.rank} of ${c.suit}`;
