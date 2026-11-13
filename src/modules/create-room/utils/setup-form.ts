/** The setup screen's raw form → the `setup` sent to `POST /rooms`. */
import type {
  ChipRowInput,
  ICreateRoomRequest,
  RoomSetup,
  SetupForm,
  VariantConfigJson,
} from "../types";

import { rs300, rs50 } from "./game-setup.ts";
import { CATALOG, CATALOG_IDS } from "./variant.ts";

/** Like Dart's `int.tryParse(text.trim()) ?? 0`. */
export const parseIntOr0 = (text: string) => {
  const t = text.trim();
  return /^[+-]?\d+$/.test(t) ? Number.parseInt(t, 10) : 0;
};

export const ROOM_NAME_MAX_LENGTH = 30;

export const DEFAULT_CHIP_ROWS: ChipRowInput[] = [
  { id: 1, value: "100", count: "4" },
  { id: 2, value: "50", count: "4" },
  { id: 3, value: "10", count: "10" },
];

/** The app's defaults: ₹300 preset, dealer's choice with every game, 40s, banker approves. */
export const DEFAULT_FORM: SetupForm = {
  roomName: "",
  preset: "rs300",
  equalBlinds: false,
  buyIn: "100",
  chipRows: DEFAULT_CHIP_ROWS,
  smallBlind: "10",
  bigBlind: "20",
  dealersChoice: true,
  playOrbit: false,
  selectedGames: [...CATALOG_IDS],
  customGames: [],
  defaultGame: "holdem",
  defaultBetting: "noLimit",
  rebuyRule: "approve",
  turnSeconds: 40,
};

export const allGames = (form: Pick<SetupForm, "customGames">): VariantConfigJson[] => [
  ...CATALOG,
  ...form.customGames,
];

/** Games offered as the default: the dealer's list, or every game without dealer's choice. */
export const defaultGameChoices = (form: SetupForm) =>
  allGames(form).filter(
    (v) => !form.dealersChoice || form.selectedGames.includes(v.id),
  );

/** The picked default game, falling back to the first allowed one (as the app does). */
export const effectiveDefaultGame = (form: SetupForm) => {
  const allowed = defaultGameChoices(form);
  return allowed.some((v) => v.id === form.defaultGame) || allowed.length === 0
    ? form.defaultGame
    : allowed[0].id;
};

const moneyFrom = (form: SetupForm) => {
  switch (form.preset) {
    case "rs300":
      return rs300(form.equalBlinds);
    case "rs50":
      return rs50(form.equalBlinds);
    case "custom":
      return {
        presetId: "custom" as const,
        buyInRupees: parseIntOr0(form.buyIn),
        chips: form.chipRows
          .map((r) => ({ value: parseIntOr0(r.value), count: parseIntOr0(r.count) }))
          .sort((a, b) => b.value - a.value),
        smallBlind: parseIntOr0(form.smallBlind),
        bigBlind: parseIntOr0(form.bigBlind),
      };
  }
};

export const setupFromForm = (form: SetupForm): RoomSetup => ({
  ...moneyFrom(form),
  dealersChoice: form.dealersChoice,
  playOrbit: form.dealersChoice && form.playOrbit,
  games: allGames(form)
    .filter((v) => form.selectedGames.includes(v.id))
    .map((v) => v.id),
  customGames: [...form.customGames],
  defaultGame: effectiveDefaultGame(form),
  defaultBetting: form.defaultBetting,
  turnSeconds: form.turnSeconds,
  rebuyRule: form.rebuyRule,
});

export const createRequestFromForm = (form: SetupForm): ICreateRoomRequest => ({
  name: form.roomName.trim().slice(0, ROOM_NAME_MAX_LENGTH),
  setup: setupFromForm(form),
});
