import type { z } from "zod";

import type {
  BettingSchema,
  RebuyRuleSchema,
  SpecialCardSchema,
  VariantConfigSchema,
} from "@/modules/table/api/contracts";

export type BettingStructure = z.infer<typeof BettingSchema>;
export type RebuyRule = z.infer<typeof RebuyRuleSchema>;
export type SpecialCard = z.infer<typeof SpecialCardSchema>;
/** A game definition as the backend reads it (built-in or custom). */
export type VariantConfigJson = z.infer<typeof VariantConfigSchema>;

/** Money presets on the setup screen. */
export type PresetId = "rs300" | "rs50" | "custom";

export interface ChipDenomination {
  /** Chip value in game chips (e.g. 500). */
  value: number;
  /** How many of this chip each player starts with. */
  count: number;
}

/** The money part of a setup: buy-in, chips and blinds. */
export interface MoneySetup {
  presetId: PresetId;
  buyInRupees: number;
  chips: ChipDenomination[];
  smallBlind: number;
  bigBlind: number;
}

/** Everything the host picks, in the shape `POST /rooms` takes as `setup`. */
export interface RoomSetup extends MoneySetup {
  dealersChoice: boolean;
  games: string[];
  defaultGame: string;
  defaultBetting: BettingStructure;
  turnSeconds: number;
  rebuyRule: RebuyRule;
  playOrbit: boolean;
  customGames: VariantConfigJson[];
}

export interface SetupValidation {
  errors: string[];
  warnings: string[];
}

/** One editable chip row in the custom chip editor (raw text, like the app's fields). */
export interface ChipRowInput {
  id: number;
  value: string;
  count: string;
}

/** Raw form state of the setup screen. */
export interface SetupForm {
  roomName: string;
  preset: PresetId;
  equalBlinds: boolean;
  buyIn: string;
  chipRows: ChipRowInput[];
  smallBlind: string;
  bigBlind: string;
  dealersChoice: boolean;
  playOrbit: boolean;
  /** Ids of the games the dealer may pick. */
  selectedGames: string[];
  customGames: VariantConfigJson[];
  defaultGame: string;
  defaultBetting: BettingStructure;
  rebuyRule: RebuyRule;
  turnSeconds: number;
}

/** Answers in the custom game builder. */
export interface BuilderChoices {
  name: string;
  /** Cards dealt to each player (2–7). */
  dealt: number;
  boards: number;
  /** Use exactly N hole cards; null = any mix. */
  exact: number | null;
  evenSplit: boolean;
  twoCardRiver: boolean;
  discard: boolean;
  special: SpecialCard;
  /** 1 = flop, 2 = turn, 3 = river. */
  specialStreet: number;
}

export interface ICreateRoomRequest {
  name: string;
  setup: RoomSetup;
}

export interface ICreatedRoom {
  code: string;
  joinSecret: string;
  /** `/r/CODE#secret`. */
  sharePath: string;
  /** Creator only: sent with the first join to become the room's owner. */
  ownerToken: string;
}
