"use client";

import { useEffect } from "react";

import { CardFan } from "@/lib/components/card-fan";
import { cn } from "@/lib/utils/styles";
import { usePeekGesture } from "@/modules/table/hooks/use-peek-gesture";
import {
  useCardPrivacy,
  useShowingMyCards,
} from "@/modules/table/state/card-privacy-store";
import type { MarkOf } from "@/modules/table/types";

import { Icon } from "./icons";

type PrivateCardsProps = {
  /** Changes every hand: a new hand hides the cards again. */
  handKey: string | null;
  /** Showdown: everyone's cards are open anyway. */
  forceShow: boolean;
  hole: readonly string[];
  cardW: number;
  overlap: number;
  dimmed: boolean;
  markOf: MarkOf;
};

/**
 * Your own cards with privacy (Flutter `_PrivateCards`): face-down unless you
 * peek (tap = a few seconds, press and hold = while holding) or turn privacy
 * off with the eye button.
 */
export const PrivateCards = ({
  handKey,
  forceShow,
  hole,
  cardW,
  overlap,
  dimmed,
  markOf,
}: PrivateCardsProps) => {
  const hideByDefault = useCardPrivacy((s) => s.hideByDefault);
  const setHideByDefault = useCardPrivacy((s) => s.setHideByDefault);
  const onHand = useCardPrivacy((s) => s.onHand);
  const showing = useShowingMyCards();
  const shown = forceShow || showing;
  const gestures = usePeekGesture(hideByDefault && !forceShow);

  useEffect(() => onHand(handKey), [handKey, onHand]);

  const peekable = hideByDefault && !forceShow;
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div
        {...gestures}
        role={peekable ? "button" : undefined}
        tabIndex={peekable ? 0 : undefined}
        aria-label={
          peekable
            ? shown
              ? "Your cards (showing)"
              : "Your cards, face down. Tap to peek, press and hold to show"
            : "Your cards"
        }
        className={cn(
          "select-none rounded-lg outline-none [-webkit-touch-callout:none] [touch-action:manipulation] focus-visible:ring-2 focus-visible:ring-gold/60",
          peekable && "cursor-pointer",
        )}>
        <CardFan
          cards={shown ? hole : null}
          count={hole.length}
          width={cardW}
          overlap={overlap}
          dimmed={dimmed}
          markOf={markOf}
        />
      </div>
      <div className="flex items-center">
        {peekable && (
          <span className="text-[11px] text-faint">
            {shown ? "Hiding soon…" : "Tap to peek"}
          </span>
        )}
        <button
          type="button"
          onClick={() => setHideByDefault(!hideByDefault)}
          aria-label={
            hideByDefault ? "Always show my cards" : "Hide my cards from neighbours"
          }
          aria-pressed={hideByDefault}
          title={
            hideByDefault ? "Always show my cards" : "Hide my cards from neighbours"
          }
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold/60",
            hideByDefault ? "text-gold" : "text-faint",
          )}>
          <Icon name={hideByDefault ? "visibilityOff" : "visibility"} size={16} />
        </button>
      </div>
    </div>
  );
};
