"use client";

import { useState } from "react";

import { GoldButton } from "@/lib/components/button";
import { fmt } from "@/lib/utils/format";
import { cn } from "@/lib/utils/styles";
import {
  type RaiseContext,
  raisePresets,
  snapRaise,
  stackTo,
} from "@/modules/table/utils/raise";

import { ActionButton } from "./action-button";
import { Icon } from "./icons";

type RaisePanelProps = {
  ctx: RaiseContext;
  onBack: () => void;
  /** Sends the (snapped) "raise to" amount. */
  onSend: (to: number) => void;
};

const StepButton = ({
  icon,
  label,
  onClick,
}: {
  icon: "add" | "remove";
  label: string;
  onClick: (() => void) | null;
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={!onClick}
    onClick={onClick ?? undefined}
    className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-glass text-white outline-none hover:bg-white/[0.14] focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-40">
    <Icon name={icon} />
  </button>
);

/** Bet / raise sizing: −/+ steps, amount field, slider, presets (Flutter `_raisePanel`). */
export const RaisePanel = ({ ctx, onBack, onSend }: RaisePanelProps) => {
  const { legal, hand, you } = ctx;
  const [raiseTo, setRaiseTo] = useState(legal.minRaiseTo);
  const [text, setText] = useState(String(legal.minRaiseTo));
  const set = (v: number) => {
    const s = snapRaise(ctx, v);
    setRaiseTo(s);
    setText(String(s));
  };
  const all = stackTo(ctx);
  const adding = raiseTo - you.streetBet;
  const allIn = raiseTo >= all;
  const step = hand.bigBlind > 0 ? hand.bigBlind : 1;
  const presets = raisePresets(ctx);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <StepButton
          icon="remove"
          label={`Less by ${fmt(step)}`}
          onClick={raiseTo > legal.minRaiseTo ? () => set(raiseTo - step) : null}
        />
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <label
            htmlFor="raise-amount"
            className="text-[11px] font-bold tracking-[1.4px] text-faint">
            {allIn ? "ALL-IN" : legal.isOpeningBet ? "BET" : "RAISE TO"}
          </label>
          <input
            id="raise-amount"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={text}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setText(digits);
              const v = Number.parseInt(digits, 10);
              if (Number.isFinite(v)) {
                setRaiseTo(v);
              }
            }}
            onBlur={() => set(raiseTo)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                set(raiseTo);
              }
            }}
            className="tabular w-40 bg-transparent text-center text-3xl font-extrabold text-gold outline-none"
          />
          <p className="tabular text-xs text-dim">
            You add {fmt(adding)} · {fmt(you.stack - adding)} left
          </p>
        </div>
        <StepButton
          icon="add"
          label={`More by ${fmt(step)}`}
          onClick={raiseTo < legal.maxRaiseTo ? () => set(raiseTo + step) : null}
        />
      </div>
      <input
        type="range"
        aria-label="Raise amount"
        min={legal.minRaiseTo}
        max={legal.maxRaiseTo}
        step={1}
        value={Math.min(legal.maxRaiseTo, Math.max(legal.minRaiseTo, raiseTo))}
        onChange={(e) => set(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-gold"
      />
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={raiseTo === p.value}
            onClick={() => set(p.value)}
            className={cn(
              "tabular min-h-11 shrink-0 rounded-lg border px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
              raiseTo === p.value
                ? "border-gold bg-gold/[0.16] text-gold"
                : "border-glass text-white hover:bg-white/[0.08]",
            )}>
            {p.label} {fmt(p.value)}
          </button>
        ))}
      </div>
      <div className="flex gap-2.5">
        <ActionButton tone="white" outlined onClick={onBack}>
          Back
        </ActionButton>
        <GoldButton
          className="flex-[2]"
          onClick={() => onSend(snapRaise(ctx, raiseTo))}>
          {allIn
            ? `All-in ${fmt(all)}`
            : `${legal.isOpeningBet ? "Bet" : "Raise to"} ${fmt(raiseTo)}`}
        </GoldButton>
      </div>
    </div>
  );
};
