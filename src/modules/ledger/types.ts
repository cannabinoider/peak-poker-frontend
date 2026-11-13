import type { StateMessage } from "../table/api/contracts.ts";

export type Room = StateMessage;
export type Settlement = NonNullable<StateMessage["settlement"]>;
export type SettlementPlayer = Settlement["players"][number];
export type Transfer = Settlement["transfers"][number];

/** One player's live money line. */
export interface LedgerLine {
  seat: number;
  name: string;
  buyIns: number;
  chips: number;
  /** Rupees put in: buy-ins × buy-in price. */
  paid: number;
  /** Exact rupee value of their chips. */
  value: number;
  /** value − paid (exact, not rounded). */
  net: number;
  /** Left the table. Chips are locked for the group to settle — not a payout. */
  cashedOut?: boolean;
}
