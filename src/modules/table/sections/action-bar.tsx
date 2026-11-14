"use client";

import { useState } from "react";

import { GoldButton } from "@/lib/components/button";
import type { ActionMessage } from "@/modules/table/api/contracts";
import { ActionButton } from "@/modules/table/components/action-button";
import { RaisePanel } from "@/modules/table/components/raise-panel";
import type { Hand, HandSeat, Legal } from "@/modules/table/types";
import {
  mainButtons,
  raiseAction,
  type RaiseContext,
  singleRaiseSize,
} from "@/modules/table/utils/raise";

type ActionBarProps = {
  legal: Legal;
  hand: Hand;
  you: HandSeat;
  /** No poker action is available until the dealer has delivered every card. */
  disabled?: boolean;
  onAct: (type: ActionMessage["type"], amount?: number) => void;
};

/**
 * Fold / Check-Match / Bet-Raise for the player to act (Flutter `ActionBar`).
 * Remount it (key) when the street or the minimum raise changes.
 */
export const ActionBar = ({
  legal,
  hand,
  you,
  disabled = false,
  onAct,
}: ActionBarProps) => {
  const [raising, setRaising] = useState(false);
  const ctx: RaiseContext = { legal, hand, you };
  const b = mainButtons(ctx);

  const send = (to: number) => {
    const a = raiseAction(ctx, to);
    onAct(a.type, a.amount);
    setRaising(false);
  };
  const openRaise = () => {
    if (singleRaiseSize(ctx)) {
      send(legal.minRaiseTo); // only one legal size
    } else {
      setRaising(true);
    }
  };

  if (raising) {
    return <RaisePanel ctx={ctx} onBack={() => setRaising(false)} onSend={send} />;
  }

  const raise = (
    <GoldButton className="min-w-0 flex-1" disabled={disabled} onClick={openRaise}>
      {b.raiseLabel}
    </GoldButton>
  );
  return (
    <div className="flex flex-col gap-2.5">
      {disabled && (
        <p role="status" className="text-center text-xs font-medium text-dim">
          Dealing cards to every player…
        </p>
      )}
      <div className="flex gap-2.5">
        <ActionButton
          tone="red"
          outlined
          disabled={disabled}
          onClick={() => onAct("fold")}>
          Fold
        </ActionButton>
        <ActionButton
          tone="white"
          disabled={disabled}
          onClick={() => onAct(b.matchType)}>
          {b.matchLabel}
        </ActionButton>
        {legal.canRaise && !b.showAllIn && raise}
      </div>
      {b.showAllIn && (
        <div className="flex gap-2.5">
          {raise}
          <ActionButton
            tone="gold"
            outlined
            disabled={disabled}
            onClick={() => send(you.stack + you.streetBet)}>
            {b.allInLabel}
          </ActionButton>
        </div>
      )}
    </div>
  );
};
