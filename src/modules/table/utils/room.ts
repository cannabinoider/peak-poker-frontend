/*
 * Read-only helpers over the server's room view (ported from the getters on
 * the Flutter `RoomView` / `HandView` / `GameSetup`). Nothing here decides
 * game state; it only reads what the server sent.
 */
import type {
  ActionTone,
  Hand,
  HandResult,
  HandSeat,
  RebuyVote,
  Room,
  Seat,
} from "../types.ts";

export const seatOf = (room: Room, seat: number): Seat | undefined =>
  room.seats.find((s) => s.seat === seat);

/** The player's name, or "Seat N" if they left. */
export const nameOf = (room: Room, seat: number) =>
  seatOf(room, seat)?.name ?? `Seat ${seat + 1}`;

export const playerOf = (hand: Hand | null | undefined, seat: number | null) =>
  seat === null ? undefined : hand?.players.find((p): p is HandSeat => p.seat === seat);

export const ledgerFor = (room: Room, seat: number) =>
  room.ledger.find((l) => l.seat === seat && !l.cashedOut) ??
  room.ledger.find((l) => l.seat === seat);

export const youAreBanker = (room: Room) =>
  room.yourSeat !== null && (seatOf(room, room.yourSeat)?.isBanker ?? false);

export const youAreOwner = (room: Room) =>
  room.yourSeat !== null && (seatOf(room, room.yourSeat)?.isOwner ?? false);

/** Owner and banker may manage other seats and pause / end the game. */
export const canManage = (room: Room) => youAreBanker(room) || youAreOwner(room);

export const youAreChoosing = (room: Room) => room.choosing?.seat === room.yourSeat;

export const isComplete = (hand: Hand | null | undefined) => hand?.result !== undefined;

/**
 * Whether `seat` may still ask for more time on this decision (the dealer
 * choosing a game may ask again and again).
 */
export const canAskMoreTime = (room: Room, seat: number) =>
  (room.turnSecondsLeft !== undefined || room.graceSecondsLeft !== undefined) &&
  !room.extendedSeats.includes(seat);

/** Whether `you` are the one the table is waiting on. */
export const isDeciding = (room: Room, you: number) => {
  if (youAreChoosing(room)) {
    return true;
  }
  const h = room.hand;
  if (!h || isComplete(h)) {
    return false;
  }
  return (
    h.legal !== undefined || h.discarding.includes(you) || h.splitting.includes(you)
  );
};

/** Chips in one buy-in (sum of the starting chips). */
export const startingStack = (setup: Room["setup"]) =>
  setup.chips.reduce((a, c) => a + c.value * c.count, 0);

/** What `chips` are worth in rupees at this table's buy-in rate. */
export const rupeesFor = (setup: Room["setup"], chips: number) => {
  const start = startingStack(setup);
  return start === 0 ? 0 : (chips * setup.buyInRupees) / start;
};

/** Seat → chips won this hand (all pots). */
export const payouts = (result: HandResult | undefined): Map<number, number> => {
  const m = new Map<number, number>();
  for (const p of result?.pots ?? []) {
    for (const [s, v] of Object.entries(p.shares)) {
      m.set(Number(s), (m.get(Number(s)) ?? 0) + v);
    }
  }
  return m;
};

/** Rebuys allowed without asking (null = ask the banker every time). */
export const autoRebuyLimit = (rule: Room["setup"]["rebuyRule"]) => {
  switch (rule) {
    case "none":
      return 0;
    case "max1":
      return 1;
    case "max2":
      return 2;
    case "approve":
      return null;
  }
};

export type RebuyState =
  | { kind: "none" }
  | { kind: "pending" }
  /** Your own rebuy as the banker: the other players are voting. */
  | { kind: "voting"; approve: number; needed: number }
  | { kind: "limit"; noRebuys: boolean }
  | { kind: "offer"; chips: number; rupees: number }
  /** Busted while the game is ending: nothing to offer. */
  | { kind: "ending" };

/** Busted (and not in a running hand): what to show about rebuying. */
export const rebuyState = (room: Room): RebuyState => {
  const you = room.yourSeat;
  if (you === null || room.settlement) {
    return { kind: "none" };
  }
  const ledger = ledgerFor(room, you);
  const mine = playerOf(room.hand, you);
  const busted =
    (ledger?.chips ?? 1) === 0 && (mine === undefined || isComplete(room.hand ?? null));
  if (!busted) {
    return { kind: "none" };
  }
  if (room.pendingRebuys.includes(you)) {
    return { kind: "pending" };
  }
  const vote = (room.rebuyVotes ?? []).find((v) => v.seat === you);
  if (vote) {
    return { kind: "voting", approve: vote.approve, needed: vote.needed };
  }
  const limit = autoRebuyLimit(room.setup.rebuyRule);
  const bought = ledger?.buyIns ?? 1;
  if (limit !== null && bought - 1 >= limit) {
    return { kind: "limit", noRebuys: limit === 0 };
  }
  if (room.ending) {
    return { kind: "ending" };
  }
  return {
    kind: "offer",
    chips: startingStack(room.setup),
    rupees: room.setup.buyInRupees,
  };
};

/**
 * The broke banker's rebuy votes `you` may take part in (including ones you
 * already voted on). Every other rebuy is the banker's call: no vote.
 */
export const rebuyVotesForYou = (room: Room): RebuyVote[] => {
  const you = room.yourSeat;
  return you === null
    ? []
    : (room.rebuyVotes ?? []).filter((v) => v.voters.includes(you));
};

/** Rebuy requests you may approve or deny: as owner or banker, never your own. */
export const rebuyRequestsForYou = (room: Room): number[] =>
  canManage(room) ? room.pendingRebuys.filter((s) => s !== room.yourSeat) : [];

export type CashOutState =
  | { kind: "none" }
  | { kind: "pending" }
  | { kind: "afterHand" }
  | { kind: "offer"; chips: number; direct: boolean };

/**
 * Leaving with your chips: a request while you are seated, or nothing when
 * the game has not started, is already settled, or you have no chips.
 */
export const cashOutState = (room: Room): CashOutState => {
  const you = room.yourSeat;
  if (you === null || room.settlement || !room.started || room.ending) {
    return { kind: "none" };
  }
  if ((room.pendingCashOuts ?? []).includes(you)) {
    return { kind: "pending" };
  }
  if ((room.leavingAfterHand ?? []).includes(you)) {
    return { kind: "afterHand" };
  }
  const seat = seatOf(room, you);
  if (!seat) {
    return { kind: "none" };
  }
  const mine = playerOf(room.hand, you);
  const inHand = mine !== undefined && !isComplete(room.hand);
  if (!inHand && seat.stack <= 0) {
    return { kind: "none" };
  }
  const ownerSeated = room.seats.some((s) => s.isOwner);
  return {
    kind: "offer",
    chips: inHand ? mine.stack : seat.stack,
    direct: seat.isBanker && (seat.isOwner || !ownerSeated),
  };
};

/** Chips to show on a leave request (what they still have behind, mid-hand). */
export const chipsForCashOut = (room: Room, seat: number) => {
  const mine = playerOf(room.hand, seat);
  if (mine && !isComplete(room.hand)) {
    return mine.stack;
  }
  return seatOf(room, seat)?.stack ?? 0;
};

/**
 * Leave requests you may approve. Never your own. The banker's request is
 * the owner's to decide.
 */
export const cashOutRequestsForYou = (room: Room): number[] => {
  if (!canManage(room) || room.yourSeat === null) {
    return [];
  }
  const you = room.yourSeat;
  const owner = seatOf(room, you)?.isOwner ?? false;
  return (room.pendingCashOuts ?? []).filter((seat) => {
    if (seat === you) {
      return false;
    }
    return !(seatOf(room, seat)?.isBanker && !owner);
  });
};

/** "D", "SB" or "BB" next to a seat's avatar. */
export const seatBadge = (room: Room, seat: number): "D" | "SB" | "BB" | null => {
  if (room.choosing?.seat === seat) {
    return "D";
  }
  const hand = room.hand;
  if (!hand || room.choosing) {
    return null;
  }
  if (hand.buttonSeat === seat) {
    return "D";
  }
  if (hand.sbSeat === seat) {
    return "SB";
  }
  if (hand.bbSeat === seat) {
    return "BB";
  }
  return null;
};

/** The faint status under a seat ("Sitting out", "Away", "Folded"…), or "". */
export const seatStatus = (room: Room, seat: Seat) => {
  const hand = room.hand;
  const hs = playerOf(hand, seat.seat);
  if (seat.sittingOut) {
    return "Sitting out";
  }
  if (!seat.connected) {
    return "Away";
  }
  if (room.choosing?.seat === seat.seat) {
    return "Choosing…";
  }
  if (hs?.folded) {
    return "Folded";
  }
  if (hs?.allIn) {
    return "All-in";
  }
  if (hand && !hs) {
    return seat.stack === 0 ? "Busted" : "Next hand";
  }
  return "";
};

/** Color of a last-action label: fold red, bets gold, blinds blue, else green. */
export const actionTone = (a: string): ActionTone => {
  if (a === "Fold") {
    return "red";
  }
  if (a.startsWith("Raise") || a.startsWith("Bet") || a === "All-in") {
    return "gold";
  }
  if (a.startsWith("SB") || a.startsWith("BB")) {
    return "blue";
  }
  return "green";
};

/** "50/100". */
export const blindsLabel = (setup: Room["setup"]) =>
  `${setup.smallBlind}/${setup.bigBlind}`;
