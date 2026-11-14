"use client";

import { cn } from "@/lib/utils/styles";
import { DealerFigure } from "@/modules/table/components/dealer-figure";
import { DEALER_CHOICES } from "@/modules/table/constants";
import { useDealerChoice } from "@/modules/table/state/dealer-store";

/** Naomi and Nina, always on the table bar. Naomi stays selected until you tap the other. */
export const DealerSwitch = () => {
  const dealer = useDealerChoice((s) => s.dealer);
  const setDealer = useDealerChoice((s) => s.setDealer);

  return (
    <div
      role="radiogroup"
      aria-label="Waifu"
      className="flex shrink-0 items-center gap-1 rounded-full bg-black/45 p-0.5">
      <span className="pl-2 text-[11px] font-semibold text-dim">Waifu</span>
      {DEALER_CHOICES.map((choice) => {
        const selected = dealer === choice.id;
        return (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setDealer(choice.id)}
            className={cn(
              "min-h-8 rounded-full px-3 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
              selected ? "bg-gold text-black" : "text-white hover:bg-white/10",
            )}>
            {choice.name}
          </button>
        );
      })}
    </div>
  );
};

/** The same choice, with a picture of each dealer, inside the table menu. */
export const DealerChoice = () => {
  const dealer = useDealerChoice((s) => s.dealer);
  const setDealer = useDealerChoice((s) => s.setDealer);

  return (
    <div className="mb-2 px-2">
      <p className="text-sm text-dim">Waifu</p>
      <div
        role="radiogroup"
        aria-label="Waifu"
        className="mt-1.5 grid grid-cols-2 gap-2">
        {DEALER_CHOICES.map((choice) => {
          const selected = dealer === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setDealer(choice.id)}
              className={cn(
                "flex min-h-11 flex-col items-center rounded-[14px] px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                selected
                  ? "border-[1.5px] border-gold bg-gold/[0.16]"
                  : "border border-glass bg-white/5 hover:bg-white/[0.08]",
              )}>
              <span className="block h-[88px] w-[70px]" aria-hidden>
                <DealerFigure who={choice.id} mode="idle" throws={1} />
              </span>
              <span
                className={cn(
                  "text-[13px] font-bold",
                  selected ? "text-gold" : "text-white",
                )}>
                {choice.name}
              </span>
              <span className="text-center text-[11px] text-dim">{choice.look}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
