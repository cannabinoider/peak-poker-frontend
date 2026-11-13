"use client";

import { useEffect, useRef, useState } from "react";

import { GoldButton } from "@/lib/components/button";
import { ChoiceChip } from "@/lib/components/choice-chip";
import { Glass } from "@/lib/components/glass";
import { TextField } from "@/lib/components/text-field";
import { cn } from "@/lib/utils/styles";

import type { BuilderChoices, SpecialCard, VariantConfigJson } from "../types";
import {
  buildCustomGame,
  deckFitNote,
  DEFAULT_BUILDER_CHOICES,
  describeGame,
  exactOptions,
  keptCards,
} from "../utils/custom-game";
import { definitionErrors } from "../utils/variant";

import { BuilderQuestion } from "./builder-question";
import { AddIcon, CloseIcon } from "./icons";

const DEALT = [2, 3, 4, 5, 6, 7];
const BOARDS = [
  { n: 1, label: "One" },
  { n: 2, label: "Two" },
  { n: 3, label: "Three" },
];
const SPECIALS: { value: SpecialCard; label: string }[] = [
  { value: "none", label: "None" },
  { value: "wild", label: "Wild" },
  { value: "poison", label: "Poison" },
];
const STREETS = ["Flop", "Turn", "River"];

type GameBuilderSheetProps = {
  onAdd: (game: VariantConfigJson) => void;
  onClose: () => void;
};

/**
 * Custom game builder (Flutter `GameBuilderScreen`) as a full-height modal sheet: a
 * few simple questions → a game the dealer can pick.
 */
export const GameBuilderSheet = ({ onAdd, onClose }: GameBuilderSheetProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [c, setC] = useState<BuilderChoices>(DEFAULT_BUILDER_CHOICES);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const set = (patch: Partial<BuilderChoices>) =>
    setC((prev) => ({ ...prev, ...patch }));
  const close = () => ref.current?.close();

  const game = buildCustomGame(c);
  const errors = definitionErrors(game);
  const fit = deckFitNote(game);
  const multi = c.boards > 1;
  const kept = keptCards(c);
  const evenOk = kept % c.boards === 0;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="builder-title"
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 text-text backdrop:bg-black/60">
      <div className="mx-auto min-h-full max-w-md bg-app px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] md:max-w-2xl md:px-8">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="-ml-2 inline-flex size-12 items-center justify-center rounded-full text-text outline-none hover:bg-white/[0.08] focus-visible:bg-white/10">
            <span aria-hidden className="inline-flex size-6 [&>svg]:size-full">
              <CloseIcon />
            </span>
          </button>
          <h2 id="builder-title" className="text-2xl font-black">
            Create a game
          </h2>
        </div>

        <TextField
          containerClassName="mt-3"
          className="text-lg"
          label="Name"
          hint="Monster Omaha"
          maxLength={24}
          autoComplete="off"
          autoCapitalize="words"
          value={c.name}
          onChange={(e) => set({ name: e.target.value })}
        />

        <BuilderQuestion question="How many cards does everyone get?">
          {DEALT.map((n) => (
            <ChoiceChip
              key={n}
              selected={c.dealt === n}
              onClick={() => set({ dealt: n })}>
              {String(n)}
            </ChoiceChip>
          ))}
        </BuilderQuestion>

        <BuilderQuestion question="How many boards?">
          {BOARDS.map((b) => (
            <ChoiceChip
              key={b.n}
              selected={c.boards === b.n}
              onClick={() => set({ boards: b.n })}>
              {b.label}
            </ChoiceChip>
          ))}
        </BuilderQuestion>

        {multi ? (
          <BuilderQuestion question="Splitting cards between boards">
            <ChoiceChip
              selected={!c.evenSplit}
              onClick={() => set({ evenSplit: false })}>
              At least 1 each
            </ChoiceChip>
            <ChoiceChip
              selected={c.evenSplit}
              disabled={!evenOk}
              onClick={() => set({ evenSplit: true })}>
              {evenOk
                ? `Evenly (${kept / c.boards} each)`
                : `Evenly (needs ${c.boards}× cards)`}
            </ChoiceChip>
          </BuilderQuestion>
        ) : (
          <BuilderQuestion question="How do players use their cards?">
            <ChoiceChip
              selected={c.exact === null}
              onClick={() => set({ exact: null })}>
              Any mix
            </ChoiceChip>
            {exactOptions(c).map((n) => (
              <ChoiceChip
                key={n}
                selected={c.exact === n}
                onClick={() => set({ exact: n })}>
                {`Exactly ${n}`}
              </ChoiceChip>
            ))}
          </BuilderQuestion>
        )}

        <BuilderQuestion question="How many cards on the river?">
          <ChoiceChip
            selected={!c.twoCardRiver}
            onClick={() => set({ twoCardRiver: false })}>
            1 (normal)
          </ChoiceChip>
          <ChoiceChip
            selected={c.twoCardRiver}
            onClick={() => set({ twoCardRiver: true })}>
            2
          </ChoiceChip>
        </BuilderQuestion>

        <BuilderQuestion question="Discard one after the flop?">
          <ChoiceChip selected={!c.discard} onClick={() => set({ discard: false })}>
            No
          </ChoiceChip>
          <ChoiceChip selected={c.discard} onClick={() => set({ discard: true })}>
            Yes
          </ChoiceChip>
        </BuilderQuestion>

        {!multi && (
          <>
            <BuilderQuestion question="Special card?">
              {SPECIALS.map((s) => (
                <ChoiceChip
                  key={s.value}
                  selected={c.special === s.value}
                  onClick={() => set({ special: s.value })}>
                  {s.label}
                </ChoiceChip>
              ))}
            </BuilderQuestion>
            {c.special !== "none" && (
              <BuilderQuestion question="It opens with the…">
                {STREETS.map((s, i) => (
                  <ChoiceChip
                    key={s}
                    selected={c.specialStreet === i + 1}
                    onClick={() => set({ specialStreet: i + 1 })}>
                    {s}
                  </ChoiceChip>
                ))}
              </BuilderQuestion>
            )}
          </>
        )}

        <Glass className="mt-5" aria-live="polite">
          <p className="text-lg font-extrabold text-gold">
            {game.name.length === 0 ? "Your game" : game.name}
          </p>
          <p className="mt-1.5 leading-[1.35] text-text">{describeGame(game)}</p>
          <p className={cn("mt-2", fit.fitsFullTable ? "text-green" : "text-gold")}>
            {fit.text}
          </p>
        </Glass>
        {errors.map((e) => (
          <p key={e} className="mt-2 text-red">
            {e}
          </p>
        ))}

        <GoldButton
          className="mt-5"
          icon={<AddIcon />}
          disabled={errors.length > 0}
          onClick={() => {
            onAdd(game);
            close();
          }}>
          Add to my games
        </GoldButton>
      </div>
    </dialog>
  );
};
