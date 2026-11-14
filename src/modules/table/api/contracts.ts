// GENERATED: copied from poker-backend/src/svc/modules/game/contracts.ts.
// Do not edit here; change the backend file and run `npm run contracts:sync`.

/**
 * Wire protocol between the game server and browsers, defined once as Zod
 * schemas. The frontend keeps a synced copy (`npm run contracts:sync` there);
 * keep this file free of imports other than `zod`.
 *
 * Every message is a JSON object with a `t` (type) field.
 *
 * Client → server:
 *   join          {room, secret?, name?, token?, ownerToken?, seat?}  first message on every connection
 *   moveSeat      {to, seat?}                     before the start: move to a seat (banker: anyone, swapping)
 *   action        {type, amount?, card?, split?}  betting / discard / split
 *   start         {}                              banker: start dealing
 *   choose        {game, betting, special?, specialStreet?, discard?}  dealer's choice
 *   banker        {seat}                          owner or banker: make seat the banker
 *   relieveBanker {}                              seated: banker is away → server picks one
 *   rebuy         {}                              busted player asks to buy back in
 *   rebuyDecision {seat, approve}                 banker approves / denies
 *   rebuyVote     {seat, approve}                 other players vote on the banker's own rebuy
 *   cashOut       {}                              seated player asks to leave with their chips
 *   cashOutDecision {seat, approve}               banker approves / denies that leave
 *   endGame       {}                              banker ends the night → settlement
 *   pause         {paused}                        banker pauses / resumes dealing
 *   moreTime      {}                              extra time on your decision
 *   sitOut        {value, seat?}                  sit out / come back (banker: any seat)
 *
 * Server → client:
 *   welcome {token, seat, isOwner}   reply to join; keep the token to rejoin
 *   state   {...RoomView}            full view for this player, after any change
 *   error   {message}
 *   closed  {reason}                 the room was closed for good; don't reconnect
 */
import { z } from "zod";

// ---- Shared enums ----

export const ActionTypeSchema = z.enum([
  "fold",
  "check",
  "call",
  "bet",
  "raise",
  "allIn",
  "discard",
  "split",
]);
export const BettingSchema = z.enum(["noLimit", "potLimit", "fixedLimit"]);
export const SpecialCardSchema = z.enum(["none", "wild", "poison"]);
export const RebuyRuleSchema = z.enum(["none", "max1", "max2", "approve"]);
export const HandCategorySchema = z.enum([
  "highCard",
  "pair",
  "twoPair",
  "trips",
  "straight",
  "flush",
  "fullHouse",
  "quads",
  "straightFlush",
  "fiveOfAKind",
]);

/** "As", "Td", "2c". */
export const CardSchema = z.string().regex(/^(10|[2-9TJQKA])[cdhs]$/i);

const Seat = z.number().int().min(0).max(15);
const Chips = z.number().int().min(0).max(1_000_000_000);

// ---- Client → server ----

export const JoinMessageSchema = z.object({
  t: z.literal("join"),
  room: z.string().max(16),
  /** Join secret from the share link; needed for a new player, not to rejoin. */
  secret: z.string().max(64).optional(),
  name: z.string().max(40).optional(),
  /** Session token from an earlier `welcome`, to get the same seat back. */
  token: z.string().max(64).optional(),
  /** The creator's one-time owner token from `POST /rooms`: makes this player the owner. */
  ownerToken: z.string().max(64).optional(),
  /** The empty seat a new player picked; the first free seat when left out. */
  seat: Seat.optional(),
});

export const ActionMessageSchema = z.object({
  t: z.literal("action"),
  type: ActionTypeSchema,
  /** For bet / raise: what your street bet becomes ("raise to"). */
  amount: Chips.optional(),
  /** Discard games: the card to throw away. */
  card: CardSchema.optional(),
  /** Multi-board: board index for each hole card, in hand order. */
  split: z.array(z.number().int().min(0).max(5)).max(8).optional(),
});

const empty = <T extends string>(t: T) => z.object({ t: z.literal(t) });

export const StartMessageSchema = empty("start");
export const RebuyMessageSchema = empty("rebuy");
export const EndGameMessageSchema = empty("endGame");
export const MoreTimeMessageSchema = empty("moreTime");

export const ChooseMessageSchema = z.object({
  t: z.literal("choose"),
  game: z.string().max(40),
  betting: BettingSchema,
  special: SpecialCardSchema.optional(),
  specialStreet: z.number().int().min(1).max(5).optional(),
  discard: z.boolean().optional(),
});

export const BankerMessageSchema = z.object({ t: z.literal("banker"), seat: Seat });

/**
 * The banker is not responding. The server picks the new banker at random
 * from the other seated players; the requester does not choose who.
 */
export const RelieveBankerMessageSchema = empty("relieveBanker");

export const RebuyDecisionMessageSchema = z.object({
  t: z.literal("rebuyDecision"),
  seat: Seat,
  approve: z.boolean(),
});

/** Another seated player votes on the banker's own rebuy. */
export const RebuyVoteMessageSchema = z.object({
  t: z.literal("rebuyVote"),
  seat: Seat,
  approve: z.boolean(),
});

/** Leave the table with your whole current stack (the group settles it). */
export const CashOutMessageSchema = empty("cashOut");

export const CashOutDecisionMessageSchema = z.object({
  t: z.literal("cashOutDecision"),
  seat: Seat,
  approve: z.boolean(),
});

export const PauseMessageSchema = z.object({
  t: z.literal("pause"),
  paused: z.boolean(),
});

/** Banker: skip the wait and deal the next hand now. */
export const DealNowMessageSchema = z.object({ t: z.literal("dealNow") });

/**
 * Before the game starts only: move to seat `to`. A player moves themself to
 * an empty seat; the owner or banker can move anyone (`seat`), swapping the
 * two players when `to` is taken. Seats are fixed once the game starts.
 */
export const MoveSeatMessageSchema = z.object({
  t: z.literal("moveSeat"),
  to: Seat,
  seat: Seat.optional(),
});

export const SitOutMessageSchema = z.object({
  t: z.literal("sitOut"),
  value: z.boolean(),
  seat: Seat.optional(),
});

export const ClientMessageSchema = z.discriminatedUnion("t", [
  JoinMessageSchema,
  ActionMessageSchema,
  StartMessageSchema,
  ChooseMessageSchema,
  BankerMessageSchema,
  RelieveBankerMessageSchema,
  RebuyMessageSchema,
  RebuyDecisionMessageSchema,
  RebuyVoteMessageSchema,
  CashOutMessageSchema,
  CashOutDecisionMessageSchema,
  EndGameMessageSchema,
  PauseMessageSchema,
  MoreTimeMessageSchema,
  SitOutMessageSchema,
  DealNowMessageSchema,
  MoveSeatMessageSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
export type JoinMessage = z.infer<typeof JoinMessageSchema>;
export type ActionMessage = z.infer<typeof ActionMessageSchema>;
export type ChooseMessage = z.infer<typeof ChooseMessageSchema>;

// ---- Views (server → client) ----

export const ChipDenominationSchema = z.object({
  value: z.number().int(),
  count: z.number().int(),
});

export const VariantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  holeCards: z.number().int(),
  boardStreets: z.array(z.number().int()),
  handRule: z.object({ exactHoleCards: z.number().int().nullable() }),
  ranking: z.enum(["high", "low", "hiLo", "shortDeck"]),
  betting: BettingSchema,
  deckMinRank: z.number().int(),
  special: SpecialCardSchema,
  specialStreet: z.number().int(),
  discardStreet: z.number().int(),
  boards: z.number().int(),
  boardWilds: z.boolean(),
  fixedSplit: z.array(z.number().int()).nullable(),
});

export const GameSetupSchema = z.object({
  presetId: z.string(),
  buyInRupees: z.number().int(),
  chips: z.array(ChipDenominationSchema),
  smallBlind: z.number().int(),
  bigBlind: z.number().int(),
  dealersChoice: z.boolean(),
  games: z.array(z.string()),
  defaultGame: z.string(),
  defaultBetting: BettingSchema,
  turnSeconds: z.number().int(),
  rebuyRule: RebuyRuleSchema,
  playOrbit: z.boolean(),
  customGames: z.array(VariantConfigSchema),
});

export const SeatViewSchema = z.object({
  seat: z.number().int(),
  name: z.string(),
  /** Chips behind (not counting chips in the current hand's pot). */
  stack: z.number().int(),
  connected: z.boolean(),
  isOwner: z.boolean(),
  isBanker: z.boolean(),
  animal: z.string(),
  sittingOut: z.boolean(),
});

export const LedgerViewSchema = z.object({
  seat: z.number().int(),
  name: z.string(),
  buyIns: z.number().int(),
  /** Chips as of the start of the current hand, or the stack they left with. */
  chips: z.number().int(),
  /**
   * Left the table. These chips are locked for the group to settle among
   * themselves — not a payout.
   */
  cashedOut: z.boolean().optional(),
});

export const NoticeViewSchema = z.object({ id: z.number().int(), text: z.string() });

/** The banker's own rebuy, decided by the other players' votes. */
export const RebuyVoteViewSchema = z.object({
  /** Who asked to rebuy. */
  seat: z.number().int(),
  /** Seats that may vote (everyone else seated when it was asked). */
  voters: z.array(z.number().int()),
  approve: z.number().int(),
  deny: z.number().int(),
  /** Approvals that grant it: more than half of `voters`. */
  needed: z.number().int(),
  /** How this viewer voted, or null (not voted or can't vote). */
  yourVote: z.enum(["approve", "deny"]).nullable(),
});

export const GameOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  holeCards: z.number().int(),
  boardStreets: z.array(z.number().int()),
  boards: z.number().int(),
  fixedSplit: z.array(z.number().int()).nullable(),
});

export const ChoosingViewSchema = z.object({
  seat: z.number().int(),
  secondsLeft: z.number().int(),
  games: z.array(GameOptionSchema),
  defaultGame: z.string(),
  defaultBetting: BettingSchema,
});

export const LegalViewSchema = z.object({
  canFold: z.boolean(),
  canCheck: z.boolean(),
  callAmount: z.number().int(),
  canRaise: z.boolean(),
  isOpeningBet: z.boolean(),
  minRaiseTo: z.number().int(),
  maxRaiseTo: z.number().int(),
});

const SeatAmounts = z.record(z.string(), z.number().int());

export const HandValueViewSchema = z.object({
  category: HandCategorySchema,
  tiebreak: z.array(z.number().int()),
  cards: z.array(CardSchema),
  /** Phrase for the result line, e.g. "Two pair, kings and fives, ace kicker". */
  description: z.string(),
  shortDeck: z.literal(true).optional(),
});

export const HandResultViewSchema = z.object({
  pots: z.array(
    z.object({
      amount: z.number().int(),
      eligibleSeats: z.array(z.number().int()),
      shares: SeatAmounts,
      byBoard: z.array(SeatAmounts),
    }),
  ),
  wentToShowdown: z.boolean(),
  shownHands: z.record(z.string(), HandValueViewSchema),
  boardHands: z.record(z.string(), z.array(HandValueViewSchema)),
  lows: z.record(z.string(), z.array(z.number().int())),
});

export const HandSeatViewSchema = z.object({
  seat: z.number().int(),
  /** Public id of the player (never their session token). */
  playerId: z.string(),
  stack: z.number().int(),
  streetBet: z.number().int(),
  folded: z.boolean(),
  allIn: z.boolean(),
  holeCount: z.number().int(),
  /** Their move this betting round: "SB 25", "Match 50", "Check"... */
  lastAction: z.string().nullable(),
  /** Null when hidden from this viewer. */
  hole: z.array(CardSchema).nullable(),
});

export const HandViewSchema = z.object({
  handNumber: z.number().int(),
  variant: z.string(),
  gameName: z.string(),
  betting: BettingSchema,
  holeCards: z.number().int(),
  boardSize: z.number().int(),
  exactHole: z.number().int().nullable(),
  hasDiscard: z.boolean(),
  hiLo: z.boolean(),
  shortDeck: z.boolean(),
  /** Name with twists, e.g. "Omaha · Discard · Wild on turn". */
  gameLabel: z.string(),
  special: SpecialCardSchema,
  specialStreet: z.number().int(),
  specialCard: CardSchema.nullable(),
  /** Main + side pots from finished streets; absent once the hand is over. */
  pots: z
    .array(
      z.object({ amount: z.number().int(), eligibleSeats: z.array(z.number().int()) }),
    )
    .optional(),
  smallBlind: z.number().int(),
  bigBlind: z.number().int(),
  betUnit: z.number().int(),
  buttonSeat: z.number().int(),
  sbSeat: z.number().int(),
  bbSeat: z.number().int(),
  street: z.number().int(),
  board: z.array(CardSchema),
  boards: z.array(z.array(CardSchema)),
  boardWilds: z.array(CardSchema),
  splitting: z.array(z.number().int()),
  fixedSplit: z.array(z.number().int()).nullable(),
  yourSplit: z.array(z.number().int()).optional(),
  toActSeat: z.number().int().nullable(),
  discarding: z.array(z.number().int()),
  currentBet: z.number().int(),
  pot: z.number().int(),
  players: z.array(HandSeatViewSchema),
  /** Present only when it's this viewer's turn. */
  legal: LegalViewSchema.optional(),
  result: HandResultViewSchema.optional(),
});

export const SettlementViewSchema = z.object({
  players: z.array(
    z.object({
      name: z.string(),
      buyIns: z.number().int(),
      chips: z.number().int(),
      paidRupees: z.number().int(),
      chipValue: z.number(),
      net: z.number().int(),
      /** Left before the end. Chips were locked then, for the group to settle. */
      cashedOut: z.boolean().optional(),
    }),
  ),
  transfers: z.array(
    z.object({ from: z.string(), to: z.string(), amount: z.number().int() }),
  ),
});

export const RoomViewSchema = z.object({
  code: z.string(),
  name: z.string(),
  /** Seconds left for the current decision, absent if no timer. */
  turnSecondsLeft: z.number().int().optional(),
  /** Time's up: seconds left to ask for more time before the automatic move. */
  graceSecondsLeft: z.number().int().optional(),
  /** Seats that can't ask for more time on this decision (used it up). */
  extendedSeats: z.array(z.number().int()),
  setup: GameSetupSchema,
  maxSeats: z.number().int(),
  started: z.boolean(),
  seats: z.array(SeatViewSchema),
  yourSeat: z.number().int().nullable(),
  ledger: z.array(LedgerViewSchema),
  /** Seats waiting for the banker to approve a rebuy. */
  pendingRebuys: z.array(z.number().int()),
  /**
   * Seats waiting for the banker (or the owner, when the banker themselves
   * wants to leave) to agree they can leave with their chips.
   */
  pendingCashOuts: z.array(z.number().int()).optional(),
  /** Approved, but still in this hand: they leave once it is over. */
  leavingAfterHand: z.array(z.number().int()).optional(),
  /** The banker's own rebuy, put to a vote of the other players. Read as `?? []`. */
  rebuyVotes: z.array(RebuyVoteViewSchema).optional(),
  /** Recent announcements, oldest first. */
  notices: z.array(NoticeViewSchema),
  /** The banker ended the game; it stops after the current hand. */
  ending: z.boolean(),
  /** No new hand starts until the banker resumes. */
  paused: z.boolean(),
  /**
   * A seated player may ask for a random new banker. True only when the
   * banker is disconnected, sitting out, or has left start / rebuy approval /
   * cash-out approval unanswered for 40s. Read as `?? false`.
   */
  bankerAway: z.boolean().optional(),
  /** Play-one-orbit in progress: "Omaha · 3 more". */
  orbitInfo: z.string().optional(),
  /** Seconds until the next hand is dealt (between hands). */
  nextHandIn: z.number().int().optional(),
  /** Set once the game is over. */
  settlement: SettlementViewSchema.optional(),
  hand: HandViewSchema.nullable(),
  /** Set while the dealer is picking the next game. */
  choosing: ChoosingViewSchema.optional(),
});

export const WelcomeMessageSchema = z.object({
  t: z.literal("welcome"),
  token: z.string(),
  seat: z.number().int(),
  /** Created the room. */
  isOwner: z.boolean(),
});

export const StateMessageSchema = RoomViewSchema.extend({ t: z.literal("state") });

export const ErrorMessageSchema = z.object({
  t: z.literal("error"),
  message: z.string(),
});

/** Sent just before the server disconnects everyone from a closed room. */
export const ClosedMessageSchema = z.object({
  t: z.literal("closed"),
  reason: z.string(),
});

export const ServerMessageSchema = z.discriminatedUnion("t", [
  WelcomeMessageSchema,
  StateMessageSchema,
  ErrorMessageSchema,
  ClosedMessageSchema,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;
export type WelcomeMessage = z.infer<typeof WelcomeMessageSchema>;
export type StateMessage = z.infer<typeof StateMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type ClosedMessage = z.infer<typeof ClosedMessageSchema>;
export type RoomView = z.infer<typeof RoomViewSchema>;
export type HandView = z.infer<typeof HandViewSchema>;
export type SeatView = z.infer<typeof SeatViewSchema>;
export type RebuyVoteView = z.infer<typeof RebuyVoteViewSchema>;
export type GameOption = z.infer<typeof GameOptionSchema>;

/** Animal characters given to players (one per seat, never repeated). */
export const ANIMALS = [
  "lion",
  "monkey",
  "panda",
  "fox",
  "rabbit",
  "bear",
  "cat",
  "owl",
  "frog",
  "koala",
  "elephant",
  "snake",
  "pig",
] as const;

export const errorMessage = (message: string): ErrorMessage => ({
  t: "error",
  message,
});

export const closedMessage = (reason: string): ClosedMessage => ({
  t: "closed",
  reason,
});
