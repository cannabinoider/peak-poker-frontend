/**
 * Money and setup rules, ported from the backend engine (`src/engine/game-setup.ts`)
 * so the form can show the same errors and warnings before it is sent.
 */
import type {
  ChipDenomination,
  MoneySetup,
  RebuyRule,
  RoomSetup,
  SetupValidation,
} from "../types";

import { definitionErrors, findGame } from "./variant.ts";

/** Seconds each player gets to act (0 = no limit). */
export const TURN_OPTIONS = [20, 30, 40, 60, 90, 0] as const;

export const turnLabel = (seconds: number) =>
  seconds === 0 ? "No limit" : `${seconds}s`;

export const REBUY_RULES: readonly RebuyRule[] = ["none", "max1", "max2", "approve"];

export const REBUY_RULE_LABELS: Record<RebuyRule, string> = {
  none: "No rebuys",
  max1: "Max 1 rebuy",
  max2: "Max 2 rebuys",
  approve: "Banker approves each",
};

/** ₹300 for 1,500 chips: 2×500, 3×100, 3×50, 2×25. Blinds 25/50 or 25/25. */
export const rs300 = (equalBlinds = false): MoneySetup => ({
  presetId: "rs300",
  buyInRupees: 300,
  chips: [
    { value: 500, count: 2 },
    { value: 100, count: 3 },
    { value: 50, count: 3 },
    { value: 25, count: 2 },
  ],
  smallBlind: 25,
  bigBlind: equalBlinds ? 25 : 50,
});

/** ₹50 for 400 chips: 2×100, 3×50, 4×10, 2×5. Blinds 5/10 or 5/5. */
export const rs50 = (equalBlinds = false): MoneySetup => ({
  presetId: "rs50",
  buyInRupees: 50,
  chips: [
    { value: 100, count: 2 },
    { value: 50, count: 3 },
    { value: 10, count: 4 },
    { value: 5, count: 2 },
  ],
  smallBlind: 5,
  bigBlind: equalBlinds ? 5 : 10,
});

/** Chips in one buy-in. */
export const startingStack = (chips: readonly ChipDenomination[]) =>
  chips.reduce((a, c) => a + c.value * c.count, 0);

/** Smallest chip; all bets and raises are multiples of it. */
export const betUnit = (chips: readonly ChipDenomination[]) =>
  chips.length === 0 ? 0 : Math.min(...chips.map((c) => c.value));

/** Exact rupee value of `chipCount` chips. Round only for final display. */
export const rupeesFor = (s: MoneySetup, chipCount: number) => {
  const stack = startingStack(s.chips);
  return stack === 0 ? 0 : (chipCount * s.buyInRupees) / stack;
};

export const bigBlindsDeep = (s: MoneySetup) =>
  s.bigBlind === 0 ? 0 : startingStack(s.chips) / s.bigBlind;

export const blindsLabel = (s: MoneySetup) => `${s.smallBlind}/${s.bigBlind}`;

/** Suggested blinds for a chip set: (smallest, 2×smallest) and (smallest, smallest). */
export const suggestedBlinds = (
  chips: readonly ChipDenomination[],
): [number, number][] => {
  if (chips.length === 0) {
    return [];
  }
  const u = betUnit(chips);
  if (u <= 0) {
    return [];
  }
  return [
    [u, 2 * u],
    [u, u],
  ];
};

/** Same checks and messages as the engine's `GameSetup.validate()`. */
export const validateSetup = (s: RoomSetup): SetupValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { chips, smallBlind, bigBlind } = s;
  const stack = startingStack(chips);

  if (s.buyInRupees <= 0) {
    errors.push("Buy-in must be more than ₹0.");
  }
  if (chips.length === 0) {
    errors.push("Add at least one chip type.");
  }
  if (chips.some((c) => c.value <= 0)) {
    errors.push("Chip values must be more than 0.");
  }
  if (chips.some((c) => c.count <= 0)) {
    errors.push("Chip counts must be more than 0.");
  }
  const values = chips.map((c) => c.value);
  if (new Set(values).size !== values.length) {
    errors.push("Each chip value can only appear once.");
  }

  const unit = betUnit(chips);
  if (unit > 0 && chips.every((c) => c.value > 0)) {
    const bad = values.filter((v) => v % unit !== 0);
    if (bad.length > 0) {
      errors.push(
        `Every chip value must be a multiple of the smallest chip (${unit}). ` +
          `Not allowed: ${bad.join(", ")}.`,
      );
    }
    if (smallBlind < unit || smallBlind % unit !== 0) {
      errors.push(`Small blind must be at least ${unit} and a multiple of ${unit}.`);
    }
    if (bigBlind <= 0 || bigBlind % unit !== 0) {
      errors.push(`Big blind must be a multiple of ${unit}.`);
    }
  }
  if (bigBlind < smallBlind) {
    errors.push("Big blind must be at least the small blind.");
  }
  if (bigBlind > 0 && stack > 0 && bigBlind >= stack) {
    errors.push(`Big blind must be less than the starting stack (${stack}).`);
  }

  for (const g of s.customGames) {
    for (const e of definitionErrors(g)) {
      errors.push(`${g.name}: ${e}`);
    }
  }
  if (findGame(s.defaultGame, s.customGames) === null) {
    errors.push(`Unknown game: ${s.defaultGame}.`);
  }
  if (s.dealersChoice) {
    if (s.games.length === 0) {
      errors.push("Pick at least one game for dealer's choice.");
    }
    if (s.games.some((g) => findGame(g, s.customGames) === null)) {
      errors.push("Unknown game in the list.");
    }
    if (s.games.length > 0 && !s.games.includes(s.defaultGame)) {
      errors.push("The default game must be one of the allowed games.");
    }
  }

  if (errors.length === 0) {
    const depth = bigBlindsDeep(s);
    if (depth < 20) {
      warnings.push(
        `Starting stack is only ${depth.toFixed(0)} big blinds — the game will be all-in heavy.`,
      );
    } else if (depth > 200) {
      warnings.push(
        `Starting stack is ${depth.toFixed(0)} big blinds — the game will be very slow.`,
      );
    }
  }
  return { errors, warnings };
};
