/*
 * Just enough of the backend engine's `Card` (poker-backend/src/engine/card.ts)
 * to rank hands on the client for display ("Flush", "Best split").
 */

export const SUITS = ["c", "d", "h", "s"] as const;
export type EngineSuit = (typeof SUITS)[number];

const RANK_CHARS = "23456789TJQKA";

/** A card for hand ranking: `rank` 2..14 (14 = Ace). */
export interface EngineCard {
  readonly rank: number;
  readonly suit: EngineSuit;
}

/** Parses "As", "Td", "10h"; null for anything else. */
export const parseEngineCard = (s: string): EngineCard | null => {
  const t = s.trim();
  if (t.length < 2) {
    return null;
  }
  const rankPart = t.slice(0, -1).toUpperCase();
  const r = rankPart === "10" ? 8 : RANK_CHARS.indexOf(rankPart);
  const suit = t.slice(-1).toLowerCase();
  if ((rankPart.length !== 1 && rankPart !== "10") || r < 0) {
    return null;
  }
  if (!(SUITS as readonly string[]).includes(suit)) {
    return null;
  }
  return { rank: r + 2, suit: suit as EngineSuit };
};

/** Parses a list of card strings, dropping anything unparsable. */
export const parseEngineCards = (cards: readonly string[]): EngineCard[] =>
  cards.flatMap((c) => {
    const p = parseEngineCard(c);
    return p ? [p] : [];
  });

/** Parses a whitespace-separated list, e.g. "As Kd 7h" (tests). */
export const cardList = (s: string): EngineCard[] =>
  parseEngineCards(s.split(/\s+/).filter((x) => x.length > 0));

/** "As", "Td". */
export const cardCode = (c: EngineCard) => `${RANK_CHARS[c.rank - 2]}${c.suit}`;

/** Rank 2..14 of a card string ("Td" → 10), or null. */
export const rankOf = (card: string) => parseEngineCard(card)?.rank ?? null;
