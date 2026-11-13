import type { CardMark } from "@/lib/components/playing-card";
import type { HandView, StateMessage } from "@/modules/table/api/contracts";

export type Room = StateMessage;
export type Hand = HandView;
/** One player's part of the current hand. */
export type HandSeat = HandView["players"][number];
export type Seat = StateMessage["seats"][number];
export type Legal = NonNullable<HandView["legal"]>;
export type HandResult = NonNullable<HandView["result"]>;
export type HandCategory = HandResult["shownHands"][string]["category"];
export type Choosing = NonNullable<StateMessage["choosing"]>;
export type Betting = HandView["betting"];
export type Special = HandView["special"];
export type Notice = StateMessage["notices"][number];
/** The broke banker's own rebuy, put to a vote of the other players. */
export type RebuyVote = NonNullable<StateMessage["rebuyVotes"]>[number];

/** Wild / poison marking for a card in the current hand. */
export type MarkOf = (card: string) => CardMark;

/** Tone of a seat's last-action label ("Fold", "Raise 200", "SB 25"…). */
export type ActionTone = "red" | "gold" | "blue" | "green";
