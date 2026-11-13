import type { HandView, StateMessage } from "../table/api/contracts.ts";

export type Setup = StateMessage["setup"];
export type Hand = HandView;

/** One titled block of plain-language rules. */
export interface RuleSection {
  title: string;
  points: string[];
}
