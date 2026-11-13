/** The custom game builder's answers → a game definition (Flutter `GameBuilderScreen`). */
import type { BuilderChoices, VariantConfigJson } from "../types";

import {
  cardsPerBoard,
  CUSTOM_ID_PREFIX,
  hasDiscard,
  isMultiBoard,
  maxPlayers,
  SPECIAL_LABELS,
  variant,
} from "./variant.ts";

export const DEFAULT_BUILDER_CHOICES: BuilderChoices = {
  name: "",
  dealt: 3,
  boards: 1,
  exact: null,
  evenSplit: false,
  twoCardRiver: false,
  discard: false,
  special: "none",
  specialStreet: 1,
};

/** Most custom games one room accepts (the backend's limit). */
export const MAX_CUSTOM_GAMES = 10;

/** Hole cards kept after the discard. */
export const keptCards = (c: BuilderChoices) => c.dealt - (c.discard ? 1 : 0);

/** "Use exactly N" choices: 1 up to min(4, kept cards). */
export const exactOptions = (c: BuilderChoices) =>
  Array.from({ length: Math.max(0, Math.min(4, keptCards(c))) }, (_, i) => i + 1);

/** "Monster Omaha!" → "c_monster_omaha_". Empty → "c_game". */
export const customGameId = (name: string) => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return `${CUSTOM_ID_PREFIX}${slug.length === 0 ? "game" : slug}`;
};

export const buildCustomGame = (c: BuilderChoices): VariantConfigJson => {
  const multi = c.boards > 1;
  const kept = keptCards(c);
  const even = multi && c.evenSplit && kept % c.boards === 0;
  return variant({
    id: customGameId(c.name),
    name: c.name.trim(),
    holeCards: c.dealt,
    boardStreets: c.twoCardRiver ? [3, 1, 2] : [3, 1, 1],
    handRule: { exactHoleCards: !multi && c.exact !== null ? c.exact : null },
    boards: c.boards,
    boardWilds: multi,
    fixedSplit: even ? Array.from({ length: c.boards }, () => kept / c.boards) : null,
    discardStreet: c.discard ? 1 : 0,
    special: multi ? "none" : c.special,
    specialStreet: c.specialStreet,
  });
};

/** `id`, or `id_2`, `id_3`… so two games with the same name stay apart. */
export const uniqueGameId = (id: string, taken: readonly string[]) => {
  let out = id;
  for (let i = 2; taken.includes(out); i++) {
    out = `${id}_${i}`;
  }
  return out;
};

const SPECIAL_STREETS = ["", "flop", "turn", "river"];

/** Plain-words summary of a game, as shown under the builder. */
export const describeGame = (g: VariantConfigJson) => {
  const perBoard = cardsPerBoard(g);
  const exact = g.handRule.exactHoleCards;
  const parts = [
    `Everyone gets ${g.holeCards} cards` +
      `${hasDiscard(g) ? " and throws one away after the flop" : ""}.`,
    isMultiBoard(g)
      ? `${g.boards} rows of ${perBoard} community cards, each ` +
        "with its own wild card (poison on the other rows)."
      : `${perBoard} community cards${perBoard === 6 ? " (the river brings 2)" : ""}.`,
  ];
  if (isMultiBoard(g)) {
    parts.push(
      g.fixedSplit !== null
        ? `Split your cards ${g.fixedSplit.join("-")} between the rows; ` +
            "pots are shared by row."
        : "Split your cards between the rows (at least 1 each); pots " +
            "are shared by row.",
    );
  } else if (exact !== null) {
    parts.push(`Use exactly ${exact} of your cards + ${5 - exact} from the board.`);
  } else {
    parts.push("Best 5 from your cards and the board, any mix.");
  }
  if (g.special !== "none") {
    parts.push(
      `${SPECIAL_LABELS[g.special]} card opens with the ` +
        `${SPECIAL_STREETS[g.specialStreet] ?? ""}.`,
    );
  }
  return parts.join(" ");
};

/** "Fits a full table of 8…" or the player limit for this game. */
export const deckFitNote = (g: VariantConfigJson) => {
  const max = maxPlayers(g);
  return {
    fitsFullTable: max >= 8,
    text:
      max >= 8
        ? "Fits a full table of 8 with one deck."
        : `One deck fits up to ${max} players.`,
  };
};
