/*
 * Bet / raise sizing for the action bar (Flutter `_ActionBarState`). The
 * server checks every amount again; this only keeps the slider legal.
 */
import { fmt } from "../../../lib/utils/format.ts";
import type { Hand, HandSeat, Legal } from "../types.ts";

export interface RaiseContext {
  legal: Legal;
  hand: Pick<Hand, "betUnit" | "pot" | "currentBet" | "betting" | "bigBlind">;
  you: Pick<HandSeat, "stack" | "streetBet">;
}

/** Your whole stack as a "raise to" amount. */
export const stackTo = ({ you }: RaiseContext) => you.stack + you.streetBet;

/** Snaps to the bet unit, within [minRaiseTo, maxRaiseTo]. */
export const snapRaise = ({ legal, hand }: RaiseContext, v: number) => {
  if (v >= legal.maxRaiseTo) {
    return legal.maxRaiseTo;
  }
  const unit = hand.betUnit > 0 ? hand.betUnit : 1;
  let s = Math.floor(v / unit) * unit;
  if (s < legal.minRaiseTo) {
    s = legal.minRaiseTo;
  }
  return s > legal.maxRaiseTo ? legal.maxRaiseTo : s;
};

/** Raise-to for a fraction of the pot, measured after calling. */
export const potFraction = (ctx: RaiseContext, f: number) => {
  const potAfterCall = ctx.hand.pot + ctx.legal.callAmount;
  return snapRaise(ctx, ctx.hand.currentBet + Math.round(potAfterCall * f));
};

/** Only one legal size: fixed limit, or min = max. */
export const singleRaiseSize = ({ legal, hand }: RaiseContext) =>
  hand.betting === "fixedLimit" || legal.minRaiseTo === legal.maxRaiseTo;

export interface RaisePreset {
  label: string;
  value: number;
}

/** Min, ½ pot, ¾ pot, pot, all-in / max — without repeated amounts. */
export const raisePresets = (ctx: RaiseContext): RaisePreset[] => {
  const { legal } = ctx;
  const quick: RaisePreset[] = [
    { label: "Min", value: legal.minRaiseTo },
    { label: "½ Pot", value: potFraction(ctx, 0.5) },
    { label: "¾ Pot", value: potFraction(ctx, 0.75) },
    { label: "Pot", value: potFraction(ctx, 1) },
    {
      label: legal.maxRaiseTo >= stackTo(ctx) ? "All-in" : "Max",
      value: legal.maxRaiseTo,
    },
  ];
  const seen = new Set<number>();
  return quick.filter((p) => {
    const fresh = !seen.has(p.value);
    seen.add(p.value);
    return fresh || p.label === "All-in" || p.label === "Max";
  });
};

export interface MainButtons {
  /** "Check", "Match 50", "All-in 30". */
  matchLabel: string;
  matchType: "check" | "call";
  /** "Raise…", "Bet 100", "All-in 1,500". */
  raiseLabel: string;
  /** Show a separate all-in button (second row). */
  showAllIn: boolean;
  allInLabel: string;
}

export const mainButtons = (ctx: RaiseContext): MainButtons => {
  const { legal, you } = ctx;
  const to = stackTo(ctx);
  const callAllIn = legal.callAmount > 0 && legal.callAmount >= you.stack;
  const verb = legal.isOpeningBet ? "Bet" : "Raise";
  const single = singleRaiseSize(ctx);
  const raiseLabel = !single
    ? `${verb}…`
    : legal.minRaiseTo >= to
      ? `All-in ${fmt(to)}`
      : `${verb} ${fmt(legal.minRaiseTo)}`;
  return {
    matchLabel: legal.canCheck
      ? "Check"
      : callAllIn
        ? `All-in ${fmt(legal.callAmount)}`
        : `Match ${fmt(legal.callAmount)}`,
    matchType: legal.canCheck ? "check" : "call",
    raiseLabel,
    showAllIn: legal.canRaise && !single && legal.maxRaiseTo >= to,
    allInLabel: `All-in ${fmt(to)}`,
  };
};

/** The message to send for a "raise to" amount: all-in when it is your stack. */
export const raiseAction = (
  ctx: RaiseContext,
  to: number,
): { type: "allIn" | "bet" | "raise"; amount?: number } =>
  to >= stackTo(ctx)
    ? { type: "allIn" }
    : { type: ctx.legal.isOpeningBet ? "bet" : "raise", amount: to };
