import type { StateMessage, WelcomeMessage } from "../table/api/contracts.ts";

export type Room = StateMessage;
export type Me = WelcomeMessage;
export type Seat = StateMessage["seats"][number];

/** One line of the setup summary ("Blinds" → "25/50"). */
export interface SetupItem {
  label: string;
  value: string;
}
