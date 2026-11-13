"use client";

import { useState } from "react";

import { GoldButton } from "@/lib/components/button";
import { CardFan } from "@/lib/components/card-fan";
import { cardLabel, cardName, parseCard } from "@/lib/components/playing-card";
import type { MarkOf } from "@/modules/table/types";

import { Icon } from "./icons";

type DiscardPickerProps = {
  hole: readonly string[];
  markOf: MarkOf;
  onDiscard: (card: string) => void;
};

const label = (card: string, f: typeof cardLabel | typeof cardName) => {
  const c = parseCard(card);
  return c ? f(c) : card;
};

/** Discard games: tap the card you want to throw away, then confirm. */
export const DiscardPicker = ({ hole, markOf, onDiscard }: DiscardPickerProps) => {
  const [pick, setPick] = useState<string | null>(null);
  const w = hole.length <= 3 ? 64 : 50;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="font-bold text-white">Tap the card to throw away</p>
      <div className="w-full overflow-x-auto">
        <CardFan
          cards={hole}
          count={hole.length}
          width={w}
          overlap={0.05}
          fan={false}
          selected={pick}
          markOf={markOf}
          onTap={setPick}
          tapLabel={(c) => `Throw away ${label(c, cardName)}`}
          className="mx-auto w-max"
        />
      </div>
      <GoldButton
        icon={<Icon name="cut" />}
        disabled={pick === null}
        onClick={() => pick && onDiscard(pick)}
        className="mt-1">
        {pick === null ? "Pick a card" : `Discard ${label(pick, cardLabel)}`}
      </GoldButton>
    </div>
  );
};
