/**
 * Game definitions, ported from the backend engine (`src/engine/variant.ts`). Pure
 * helpers only: the server still checks everything when the room is created.
 */
import type { BettingStructure, SpecialCard, VariantConfigJson } from "../types";

export const BETTING_STRUCTURES: readonly BettingStructure[] = [
  "noLimit",
  "potLimit",
  "fixedLimit",
];

export const BETTING_LABELS: Record<
  BettingStructure,
  { label: string; short: string }
> = {
  noLimit: { label: "No Limit", short: "NL" },
  potLimit: { label: "Pot Limit", short: "PL" },
  fixedLimit: { label: "Fixed Limit", short: "FL" },
};

export const SPECIAL_LABELS: Record<SpecialCard, string> = {
  none: "",
  wild: "Wild",
  poison: "Poison",
};

const STREET_NAMES = ["preflop", "flop", "turn", "river"] as const;

type VariantInit = Pick<
  VariantConfigJson,
  "id" | "name" | "holeCards" | "boardStreets"
> &
  Partial<VariantConfigJson>;

/** A full definition with the engine's defaults filled in. */
export const variant = (init: VariantInit): VariantConfigJson => ({
  handRule: { exactHoleCards: null },
  ranking: "high",
  betting: "noLimit",
  deckMinRank: 2,
  special: "none",
  specialStreet: 1,
  discardStreet: 0,
  boards: 1,
  boardWilds: false,
  fixedSplit: null,
  ...init,
});

/** Built-in games the dealer can choose from, in the app's order. */
export const CATALOG: readonly VariantConfigJson[] = [
  variant({
    id: "holdem",
    name: "Texas Hold'em",
    holeCards: 2,
    boardStreets: [3, 1, 1],
  }),
  variant({
    id: "holdem2r",
    name: "Hold'em · 2-card river",
    holeCards: 2,
    boardStreets: [3, 1, 2],
  }),
  variant({
    id: "omaha",
    name: "Omaha",
    holeCards: 4,
    boardStreets: [3, 1, 1],
    handRule: { exactHoleCards: 2 },
  }),
  variant({
    id: "omaha5",
    name: "5-Card Omaha",
    holeCards: 5,
    boardStreets: [3, 1, 1],
    handRule: { exactHoleCards: 2 },
  }),
  variant({
    id: "double",
    name: "Double Board",
    holeCards: 4,
    boardStreets: [3, 1, 1],
    boards: 2,
    boardWilds: true,
  }),
  variant({
    id: "triple",
    name: "Triple Board",
    holeCards: 6,
    boardStreets: [3, 1, 1],
    boards: 3,
    boardWilds: true,
    fixedSplit: [2, 2, 2],
  }),
  variant({
    id: "crazypine",
    name: "Crazy Pineapple",
    holeCards: 3,
    boardStreets: [3, 1, 1],
    discardStreet: 1,
  }),
  variant({
    id: "short",
    name: "Short Deck",
    holeCards: 2,
    boardStreets: [3, 1, 1],
    deckMinRank: 6,
    ranking: "shortDeck",
  }),
  variant({
    id: "omahahilo",
    name: "Omaha Hi-Lo",
    holeCards: 4,
    boardStreets: [3, 1, 1],
    handRule: { exactHoleCards: 2 },
    ranking: "hiLo",
  }),
];

export const CATALOG_IDS: readonly string[] = CATALOG.map((v) => v.id);

/** Custom game ids start with this, so they never clash with built-in ids. */
export const CUSTOM_ID_PREFIX = "c_";

export const isCustomGameId = (id: string) => id.startsWith(CUSTOM_ID_PREFIX);

export const hasDiscard = (v: VariantConfigJson) => v.discardStreet > 0;

export const isMultiBoard = (v: VariantConfigJson) => v.boards > 1;

/** Community cards on one board. */
export const cardsPerBoard = (v: VariantConfigJson) =>
  v.boardStreets.reduce((a, b) => a + b, 0);

export const deckSize = (v: VariantConfigJson) => (15 - v.deckMinRank) * 4;

const specialCards = (v: VariantConfigJson) =>
  (v.special === "none" ? 0 : 1) + (v.boardWilds ? v.boards : 0);

/** Most players one deck supports for this game. */
export const maxPlayers = (v: VariantConfigJson) =>
  Math.floor(
    (deckSize(v) - cardsPerBoard(v) * v.boards - specialCards(v)) / v.holeCards,
  );

/** "Texas Hold'em", "Omaha · Wild on turn". */
export const displayName = (v: VariantConfigJson) => {
  const parts = [v.name];
  if (hasDiscard(v)) {
    parts.push("Discard");
  }
  if (v.special !== "none") {
    const street =
      v.specialStreet < STREET_NAMES.length
        ? STREET_NAMES[v.specialStreet]
        : `street ${v.specialStreet}`;
    parts.push(`${SPECIAL_LABELS[v.special]} on ${street}`);
  }
  return parts.join(" · ");
};

/** Problems with a hand-made game definition (custom game builder). */
export const definitionErrors = (v: VariantConfigJson): string[] => {
  const e: string[] = [];
  if (v.name.trim().length === 0) {
    e.push("Give the game a name.");
  }
  if (v.holeCards < 1 || v.holeCards > 7) {
    e.push("Hole cards must be 1–7.");
  }
  if (v.boards < 1 || v.boards > 3) {
    e.push("Use 1 to 3 boards.");
  }
  if (v.boardStreets.length === 0 || v.boardStreets[0] < 3) {
    e.push("The flop needs at least 3 cards.");
  }
  const multi = isMultiBoard(v);
  const kept = v.holeCards - (hasDiscard(v) ? 1 : 0);
  const n = v.handRule.exactHoleCards;
  if (n !== null) {
    if (multi) {
      e.push("With more than one board, hands use any mix of cards.");
    } else if (n < 1 || n > 4 || n > kept) {
      e.push('"Use exactly N" must be between 1 and your hole cards (max 4).');
    } else if (5 - n > cardsPerBoard(v)) {
      e.push(`Not enough board cards to use exactly ${n} hole cards.`);
    }
  }
  if (multi) {
    if (kept < v.boards) {
      e.push("Need at least one hole card per board.");
    }
    const f = v.fixedSplit;
    if (f !== null && f.reduce((a, b) => a + b, 0) !== kept) {
      e.push(`The split must use all ${kept} hole cards.`);
    }
    if (v.special !== "none") {
      e.push("Multi-board games already have a wild card per board.");
    }
  }
  if (maxPlayers(v) < 2) {
    e.push("Not enough cards in one deck for 2 players.");
  }
  return e;
};

/** A built-in or custom game by id. */
export const findGame = (id: string, customGames: readonly VariantConfigJson[]) =>
  [...CATALOG, ...customGames].find((v) => v.id === id) ?? null;
