"use client";

import { useState } from "react";

import { GoldButton, OutlineButton } from "@/lib/components/button";
import { cardName, parseCard, PlayingCard } from "@/lib/components/playing-card";
import { BOARD_COLORS } from "@/modules/table/constants";
import type { Hand } from "@/modules/table/types";
import { splitIsValid, splitLabels, suggestSplit } from "@/modules/table/utils/my-hand";

import { BoardDot } from "./board-dot";
import { Icon } from "./icons";

type SplitPickerProps = {
  hand: Hand;
  hole: readonly string[];
  onSplit: (split: number[]) => void;
};

/**
 * Multi-board: tap a card to move it to the next board, see the hand on each
 * board, then confirm. Starts on the suggested best split.
 */
export const SplitPicker = ({ hand, hole, onSplit }: SplitPickerProps) => {
  const [split, setSplit] = useState(() => suggestSplit(hand, hole));
  const nb = hand.boards.length;
  const valid = splitIsValid(hand, split);
  const labels = splitLabels(hand, hole, split);
  const w = hole.length > 4 ? 42 : 52;
  const fixed = hand.fixedSplit;

  return (
    <div className="flex flex-col items-stretch gap-2">
      <p className="text-center font-bold text-white">
        {fixed
          ? `Put ${fixed.join("-")} cards on the boards`
          : "Tap a card to move it to another board"}
      </p>
      <div className="flex flex-wrap justify-center">
        {hole.map((c, i) => {
          const parsed = parseCard(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() =>
                setSplit((s) => s.map((b, j) => (j === i ? (b + 1) % nb : b)))
              }
              aria-label={`${parsed ? cardName(parsed) : c}: board ${split[i] + 1}. Tap to move`}
              className="flex flex-col items-center gap-[3px] px-[3px] outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
              <span
                className="block p-0.5"
                style={{
                  border: `2.5px solid ${BOARD_COLORS[split[i] % BOARD_COLORS.length]}`,
                  borderRadius: w * 0.18,
                }}>
                <PlayingCard card={c} width={w} animate={false} />
              </span>
              <BoardDot board={split[i]} />
            </button>
          );
        })}
      </div>
      <ul>
        {hand.boards.map((_, b) => (
          <li key={b} className="flex items-center gap-2 pb-[3px] text-dim">
            <BoardDot board={b} />
            {labels ? labels[b] : "—"}
          </li>
        ))}
      </ul>
      {!valid && (
        <p role="alert" className="text-xs text-red">
          {fixed
            ? `Each board needs exactly ${fixed[0]} cards`
            : "Every board needs at least one card"}
        </p>
      )}
      <div className="flex gap-2.5">
        <OutlineButton
          className="flex-1"
          onClick={() => setSplit(suggestSplit(hand, hole))}>
          Best split
        </OutlineButton>
        <GoldButton
          className="flex-[2]"
          icon={<Icon name="split" />}
          disabled={!valid}
          onClick={() => onSplit([...split])}>
          Confirm split
        </GoldButton>
      </div>
    </div>
  );
};
