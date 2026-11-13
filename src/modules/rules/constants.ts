import type { z } from "zod";

import type {
  BettingSchema,
  RebuyRuleSchema,
  SpecialCardSchema,
} from "../table/api/contracts.ts";

type Betting = z.infer<typeof BettingSchema>;
type RebuyRule = z.infer<typeof RebuyRuleSchema>;
type SpecialCard = z.infer<typeof SpecialCardSchema>;

export const BETTING_LABELS: Record<Betting, string> = {
  noLimit: "No Limit",
  potLimit: "Pot Limit",
  fixedLimit: "Fixed Limit",
};

export const REBUY_LABELS: Record<RebuyRule, string> = {
  none: "No rebuys",
  max1: "Max 1 rebuy",
  max2: "Max 2 rebuys",
  approve: "Banker approves each",
};

export const SPECIAL_LABELS: Record<SpecialCard, string> = {
  none: "",
  wild: "Wild",
  poison: "Poison",
};

export const STREETS = ["preflop", "flop", "turn", "river"] as const;

/** Built-in games (the engine's catalog): name and discard twist, by id. */
export const BUILT_IN_GAMES: Record<string, { name: string; discard: boolean }> = {
  holdem: { name: "Texas Hold'em", discard: false },
  omaha: { name: "Omaha", discard: false },
  omaha5: { name: "5-Card Omaha", discard: false },
  holdem2r: { name: "Hold'em · 2-card river", discard: false },
  double: { name: "Double Board", discard: false },
  triple: { name: "Triple Board", discard: false },
  crazypine: { name: "Crazy Pineapple", discard: true },
  short: { name: "Short Deck", discard: false },
  omahahilo: { name: "Omaha Hi-Lo", discard: false },
};

export interface HandRanking {
  name: string;
  example: string;
  note: string;
}

/** Best first. Five of a kind only shows when wild cards are in play. */
export const HAND_RANKINGS: HandRanking[] = [
  { name: "Five of a kind", example: "Q Q Q Q + wild", note: "Only with wild cards" },
  { name: "Straight flush", example: "9 8 7 6 5", note: "Five in a row, same suit" },
  { name: "Four of a kind", example: "K K K K 3", note: "" },
  { name: "Full house", example: "8 8 8 J J", note: "Three + a pair" },
  { name: "Flush", example: "A J 9 6 2", note: "Five of one suit" },
  { name: "Straight", example: "10 9 8 7 6", note: "Five in a row (A-2-3-4-5 counts)" },
  { name: "Three of a kind", example: "7 7 7 K 2", note: "" },
  { name: "Two pair", example: "A A 5 5 9", note: "" },
  { name: "Pair", example: "10 10 A 6 3", note: "" },
  { name: "High card", example: "A Q 8 5 2", note: "Nothing else" },
];
