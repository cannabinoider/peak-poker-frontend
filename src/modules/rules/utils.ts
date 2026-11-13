import { fmt } from "../../lib/utils/format.ts";

import {
  BETTING_LABELS,
  BUILT_IN_GAMES,
  REBUY_LABELS,
  SPECIAL_LABELS,
  STREETS,
} from "./constants.ts";
import type { Hand, RuleSection, Setup } from "./types.ts";

// ---- Setup helpers (ported from the engine's GameSetup) ----

/** Chips in one buy-in. */
export const startingStack = (setup: Setup) =>
  setup.chips.reduce((sum, c) => sum + c.value * c.count, 0);

/** Smallest chip; every bet is a multiple of it. */
export const betUnit = (setup: Setup) =>
  setup.chips.length === 0 ? 0 : Math.min(...setup.chips.map((c) => c.value));

/** Exact rupee value of `chips` (round only for the final settlement). */
export const rupeesFor = (setup: Setup, chips: number) => {
  const stack = startingStack(setup);
  return stack === 0 ? 0 : (chips * setup.buyInRupees) / stack;
};

export const blindsLabel = (setup: Setup) => `${setup.smallBlind}/${setup.bigBlind}`;

export const bettingLabel = (betting: keyof typeof BETTING_LABELS) =>
  BETTING_LABELS[betting];

export const rebuyLabel = (rule: Setup["rebuyRule"]) => REBUY_LABELS[rule];

const streetName = (street: number) => STREETS[street] ?? `street ${street}`;

/** A game's name with its twists: "Crazy Pineapple · Discard", "Omaha · Wild on turn". */
export const gameDisplayName = (setup: Setup, id: string) => {
  const custom = setup.customGames.find((g) => g.id === id);
  if (custom) {
    return [
      custom.name,
      ...(custom.discardStreet > 0 ? ["Discard"] : []),
      ...(custom.special !== "none"
        ? [`${SPECIAL_LABELS[custom.special]} on ${streetName(custom.specialStreet)}`]
        : []),
    ].join(" · ");
  }
  const game = BUILT_IN_GAMES[id] ?? BUILT_IN_GAMES.holdem;
  return game.discard ? `${game.name} · Discard` : game.name;
};

// ---- Rules text (ported from rules_sheet.dart `rulesFor`) ----

const tableSection = (s: Setup): RuleSection => ({
  title: "This table",
  points: [
    s.dealersChoice
      ? "Dealer's choice: each hand the dealer picks the game, the betting style and any twists."
      : `Every hand is ${gameDisplayName(s, s.defaultGame)}, ${bettingLabel(s.defaultBetting)}.`,
    `Buy-in ₹${fmt(s.buyInRupees)} = ${fmt(startingStack(s))} chips.`,
  ],
});

const specialStreet = (hand: Hand) =>
  STREETS[Math.min(Math.max(hand.specialStreet, 1), 3)];

const handSections = (hand: Hand): RuleSection[] => {
  const boards = hand.boards.length;
  const multi = boards > 1;
  const per = multi ? Math.trunc(hand.boardSize / boards) : hand.boardSize;
  const exact = hand.exactHole;

  const cards = [
    `You get ${hand.holeCards} cards only you can see.`,
    multi
      ? `${boards} rows of ${per} community cards, dealt together: flop 3, turn 1, river 1 on each row.`
      : per === 6
        ? "6 community cards: flop 3, turn 1, and the river brings 2."
        : "5 community cards: flop 3, turn 1, river 1.",
  ];
  if (hand.hasDiscard) {
    cards.push(
      "Discard: right after the flop everyone secretly throws away 1 card at the same time, then betting continues.",
    );
  }

  const making: string[] = [];
  if (multi) {
    const split = hand.fixedSplit
      ? ` (exactly ${hand.fixedSplit.join("-")})`
      : " (at least 1 on each row)";
    making.push(
      `At showdown you split your cards between the rows${split}. On each row your hand is the best 5 from the cards you put there plus that row.`,
      "Each row has its own wild card (opens with the flop): it's wild on its own row and poison (dead) on the other rows.",
      `Every pot is split ${boards === 2 ? "in half" : "in thirds"} — each part goes to the best hand on that row. One player can win them all.`,
    );
  } else if (exact !== null) {
    making.push(
      `Use exactly ${exact} of your cards and exactly ${5 - exact} from the board — no more, no less.`,
    );
  } else {
    making.push(
      "Make the best 5-card hand from your cards and the board, in any mix (you can even use none of yours).",
    );
  }
  if (hand.hiLo) {
    making.push(
      "Hi-Lo: every pot is split — half to the best high hand, half to the best low: five different cards 8 or lower (ace counts low, straights and flushes don't hurt). The best low is 5-4-3-2-A. If nobody has a low, the high hand takes it all.",
    );
  }
  if (hand.shortDeck) {
    making.push(
      "Short Deck: only 6s to aces (36 cards). A-6-7-8-9 is a straight. A flush beats a full house, and three of a kind beats a straight.",
    );
  }
  if (hand.special === "wild") {
    making.push(
      `Wild card: an extra card opens beside the board with the ${specialStreet(hand)}. Every card of its rank — on the board or in hands — can be any card you like. Five of a kind is possible and beats a straight flush.`,
    );
  }
  if (hand.special === "poison") {
    making.push(
      `Poison card: an extra card opens beside the board with the ${specialStreet(hand)}. Every card of its rank is dead for everyone — you can't use it. With fewer than 5 usable cards, your best smaller hand counts (pairs, trips; no straights or flushes).`,
    );
  }

  return [
    { title: `${hand.gameLabel} · ${bettingLabel(hand.betting)}`, points: cards },
    { title: "Making your hand", points: making },
  ];
};

const bettingSection = (s: Setup, hand: Hand | null): RuleSection => {
  const sb = s.smallBlind;
  const bb = s.bigBlind;
  const structure = {
    noLimit:
      "No Limit: bet or raise any amount up to all your chips. A raise must be at least as big as the last raise.",
    potLimit: "Pot Limit: you can raise at most the size of the pot (after matching).",
    fixedLimit: `Fixed Limit: bets are fixed — ${bb} before the turn, ${bb * 2} from the turn on — and at most a bet and 3 raises per round.`,
  }[hand?.betting ?? s.defaultBetting];

  const points = [
    `The dealer button moves one seat each hand. The next two players post the small blind (${sb}) and big blind (${bb}) automatically.`,
    "Before the flop you must match at least the big blind to keep playing (Match), or Fold, or Raise. The big blind can check if nobody raised.",
    "After every round of matching, the next cards open; from the flop on you can Check if nobody has bet.",
    structure,
    `All bets are in steps of the smallest chip (${betUnit(s)}). If you go all-in for less, side pots keep it fair: you can only win what you matched.`,
  ];
  if (s.turnSeconds > 0) {
    points.push(
      `You have ${s.turnSeconds}s per decision. Tap +30s once if you need more. When time is up you get 5 more seconds to ask, then you check (or fold if there is a bet).`,
    );
  }
  return { title: "Betting", points };
};

/**
 * Plain-language rules for the game being played now (or the table's games,
 * between hands), for new players.
 */
export const rulesFor = (setup: Setup, hand: Hand | null): RuleSection[] => [
  ...(hand === null ? [tableSection(setup)] : handSections(hand)),
  bettingSection(setup, hand),
];

/** Five of a kind is only possible with wild cards (wild twist or multi-board). */
export const showsFiveOfAKind = (hand: Hand | null) =>
  hand !== null && (hand.special === "wild" || hand.boards.length > 1);
