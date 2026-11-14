import type { Betting } from "./types";

/** Seat tile size around the felt (Flutter `_TableArea`). */
export const TILE_W = 92;
export const TILE_H = 118;
/** Smaller tiles when more than 8 seats share the oval. */
export const TILE_W_CROWDED = 78;
/** How far a bet beside the avatar reaches from the seat's centre (scale 1). */
export const SEAT_BET_REACH = 80;
export const TILE_H_CROWDED = 108;
/** Tailwind `lg`: from here the table uses a desktop layout. */
export const WIDE_QUERY = "(min-width: 1024px)";
/** Widest the table area gets relative to its height (wide desktop screens). */
export const MAX_OVAL_RATIO = 2.2;

/** Board colors for multi-board games (sky, pink, lime). */
export const BOARD_COLORS = ["#38BDF8", "#F472B6", "#A3E635"] as const;

/** Poison purple used by the special-card slot. */
export const POISON_COLOR = "#A855F7";

/** Street names by index, as the dealer picker shows them. */
export const STREET_NAMES = ["Preflop", "Flop", "Turn", "River"] as const;

export const BETTING_LABELS: Record<Betting, { label: string; short: string }> = {
  noLimit: { label: "No Limit", short: "NL" },
  potLimit: { label: "Pot Limit", short: "PL" },
  fixedLimit: { label: "Fixed Limit", short: "FL" },
};

export const BETTING_ORDER: readonly Betting[] = ["noLimit", "potLimit", "fixedLimit"];

/** How long a table announcement stays up. */
export const NOTICE_MS = 3000;

/** Press this long on your cards to "hold to show" instead of a tap-peek. */
export const HOLD_MS = 300;

export type DealerId = "naomi" | "nina";

/** Naomi deals unless this device has chosen someone else. */
export const DEFAULT_DEALER: DealerId = "naomi";

export const DEALER_CHOICES: { id: DealerId; name: string; look: string }[] = [
  { id: "naomi", name: "Naomi", look: "Navy waistcoat, hair in a bun" },
  { id: "nina", name: "Nina", look: "Evening dress, long hair" },
];
