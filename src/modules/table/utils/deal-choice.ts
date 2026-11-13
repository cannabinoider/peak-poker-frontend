/*
 * Dealer's choice rules (Flutter `DealerPicker`): which twists a game allows
 * and the one-line summary under the picker.
 */
import { BETTING_LABELS, STREET_NAMES } from "../constants.ts";
import type { Betting, Choosing, Special } from "../types.ts";

export type GameOption = Choosing["games"][number];

export interface DealChoice {
  game: string;
  betting: Betting;
  special: Special;
  specialStreet: number;
  discard: boolean;
}

export const initialChoice = (choosing: Choosing): DealChoice => ({
  game: choosing.games.some((g) => g.id === choosing.defaultGame)
    ? choosing.defaultGame
    : (choosing.games[0]?.id ?? choosing.defaultGame),
  betting: choosing.defaultBetting,
  special: "none",
  specialStreet: 1,
  discard: false,
});

/**
 * The choice as it can actually be dealt for its game: multi-board games have
 * their own wild per board, fixed splits can't discard, and the special card
 * can't open after the last street.
 */
export const effectiveChoice = (choice: DealChoice, option: GameOption): DealChoice => {
  const streets = option.boardStreets.length;
  return {
    ...choice,
    special: option.boards > 1 ? "none" : choice.special,
    discard: option.fixedSplit === null ? choice.discard : false,
    specialStreet: Math.max(1, Math.min(choice.specialStreet, streets)),
  };
};

export const streetName = (s: number) =>
  s < STREET_NAMES.length ? STREET_NAMES[s] : `Street ${s}`;

/** "Omaha · Discard · Wild on turn · Pot Limit". */
export const choiceSummary = (c: DealChoice, option: GameOption) =>
  [
    option.name,
    c.discard ? "Discard" : null,
    c.special !== "none"
      ? `${c.special === "wild" ? "Wild" : "Poison"} on ${streetName(c.specialStreet).toLowerCase()}`
      : null,
    BETTING_LABELS[c.betting].label,
  ]
    .filter((p): p is string => p !== null)
    .join(" · ");
