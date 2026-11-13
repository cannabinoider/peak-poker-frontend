"use client";

import { useState } from "react";

import { GoldButton } from "@/lib/components/button";
import { SectionTitle } from "@/lib/components/section-title";
import { ChoiceTile } from "@/modules/table/components/choice-tile";
import { Icon } from "@/modules/table/components/icons";
import { BETTING_LABELS, BETTING_ORDER } from "@/modules/table/constants";
import type { Choosing, Special } from "@/modules/table/types";
import {
  choiceSummary,
  type DealChoice,
  effectiveChoice,
  initialChoice,
  streetName,
} from "@/modules/table/utils/deal-choice";

type DealerPickerProps = {
  choosing: Choosing;
  onDeal: (choice: DealChoice) => void;
};

const SPECIALS: {
  kind: Special;
  icon: "block" | "sparkle" | "dangerous";
  text: string;
}[] = [
  { kind: "none", icon: "block", text: "No card" },
  { kind: "wild", icon: "sparkle", text: "Wild" },
  { kind: "poison", icon: "dangerous", text: "Poison" },
];

/** Dealer's choice panel: Game, Twists, Betting, then Deal (Flutter `DealerPicker`). */
export const DealerPicker = ({ choosing, onDeal }: DealerPickerProps) => {
  const [picked, setPicked] = useState(() => initialChoice(choosing));
  const option = choosing.games.find((g) => g.id === picked.game) ?? choosing.games[0];
  if (!option) {
    return null;
  }
  const choice = effectiveChoice(picked, option);
  const update = (patch: Partial<DealChoice>) => setPicked((p) => ({ ...p, ...patch }));
  const streets = option.boardStreets.length;
  const multi = option.boards > 1;
  const canDiscard = option.fixedSplit === null;

  return (
    <div className="flex min-h-0 flex-col overflow-hidden max-lg:flex-auto lg:max-h-[62dvh]">
      <div className="flex shrink-0 items-center gap-2">
        <Icon name="casino" className="text-gold" />
        <h2 className="text-[17px] font-extrabold text-white">
          You&apos;re the dealer
        </h2>
      </div>
      <div className="mt-2.5 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <SectionTitle as="h3">Game</SectionTitle>
        <div role="radiogroup" aria-label="Game" className="grid grid-cols-2 gap-2">
          {choosing.games.map((g) => (
            <ChoiceTile
              key={g.id}
              selected={choice.game === g.id}
              title={g.name}
              subtitle={`${g.holeCards} cards · ${g.boardStreets.reduce((a, b) => a + b, 0)} on board`}
              onClick={() => update({ game: g.id })}
            />
          ))}
        </div>

        <SectionTitle as="h3" className="mt-4">
          Twists
        </SectionTitle>
        {multi && (
          <p className="mb-2 text-xs text-dim">
            Each of the {option.boards} boards gets its own wild card with the flop —
            wild on its board, poison on the others. Players split their{" "}
            {option.holeCards} cards between the boards at showdown
            {option.fixedSplit ? ` (${option.fixedSplit.join("-")})` : ""}.
          </p>
        )}
        {canDiscard && (
          <ChoiceTile
            kind="toggle"
            selected={choice.discard}
            icon={<Icon name="cut" size={18} />}
            title="Discard one"
            subtitle={`Get ${option.holeCards + 1} cards, throw one away after the flop`}
            onClick={() => update({ discard: !choice.discard })}
          />
        )}
        {!multi && (
          <div role="radiogroup" aria-label="Special card" className="mt-2 flex gap-2">
            {SPECIALS.map((s) => (
              <ChoiceTile
                key={s.kind}
                compact
                selected={choice.special === s.kind}
                icon={<Icon name={s.icon} size={18} />}
                title={s.text}
                onClick={() => update({ special: s.kind })}
              />
            ))}
          </div>
        )}
        {choice.special !== "none" && (
          <>
            <p className="mt-2.5 text-xs text-dim">
              {choice.special === "wild"
                ? "Cards of its rank can be anything. Opens with the…"
                : "Cards of its rank are dead for everyone. Opens with the…"}
            </p>
            <div role="radiogroup" aria-label="Opens on" className="mt-1.5 flex gap-2">
              {Array.from({ length: streets }, (_, i) => i + 1).map((s) => (
                <ChoiceTile
                  key={s}
                  compact
                  selected={choice.specialStreet === s}
                  title={streetName(s)}
                  onClick={() => update({ specialStreet: s })}
                />
              ))}
            </div>
          </>
        )}

        <SectionTitle as="h3" className="mt-4">
          Betting
        </SectionTitle>
        <div role="radiogroup" aria-label="Betting" className="mb-3 flex gap-2">
          {BETTING_ORDER.map((b) => (
            <ChoiceTile
              key={b}
              compact
              selected={choice.betting === b}
              title={BETTING_LABELS[b].label}
              onClick={() => update({ betting: b })}
            />
          ))}
        </div>
      </div>
      <p className="shrink-0 text-center font-bold text-gold">
        {choiceSummary(choice, option)}
      </p>
      <GoldButton
        className="mt-2 shrink-0"
        icon={<Icon name="deal" />}
        onClick={() => onDeal(choice)}>
        Deal
      </GoldButton>
    </div>
  );
};
