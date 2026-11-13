import type { CSSProperties } from "react";

import { type CardMark, PlayingCard } from "@/lib/components/playing-card";
import { cn } from "@/lib/utils/styles";

export type CardFanProps = {
  /** Known cards, or null for face-down. */
  cards: readonly string[] | null;
  /** How many cards to draw (face-down ones too). */
  count: number;
  /** Card width in px. */
  width?: number;
  /** How much each card covers the previous one (0..1). */
  overlap?: number;
  /** Tilt the cards into a slight fan. */
  fan?: boolean;
  dimmed?: boolean;
  /** Wild / poison marking per card. */
  markOf?: (card: string) => CardMark;
  /** Makes the cards buttons (discard picking). */
  onTap?: (card: string) => void;
  /** The lifted (picked) card. */
  selected?: string | null;
  /** Accessible label for a tappable card. */
  tapLabel?: (card: string) => string;
  className?: string;
  style?: CSSProperties;
};

/** Cards overlapped in a slight fan (Flutter `CardFan`). */
export const CardFan = ({
  cards,
  count,
  width = 40,
  overlap = 0.45,
  fan = true,
  dimmed = false,
  markOf,
  onTap,
  selected,
  tapLabel,
  className,
  style,
}: CardFanProps) => {
  const step = width * (1 - overlap);
  const total = width + step * Math.max(0, count - 1);
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: total, height: width * 1.75, ...style }}>
      {Array.from({ length: count }, (_, i) => {
        const card = cards && i < cards.length ? cards[i] : null;
        const lifted = card !== null && card === selected;
        const offset = i - (count - 1) / 2;
        const top =
          (fan ? Math.abs(offset) * width * 0.04 : 0) +
          (lifted ? -width * 0.25 : 0) +
          width * 0.25;
        // Tilt a wrapper: the card's flip-in animation owns its own transform.
        const face = (
          <div style={fan ? { transform: `rotate(${offset * 0.07}rad)` } : undefined}>
            <PlayingCard
              card={card}
              width={width}
              dimmed={dimmed}
              highlight={lifted}
              animate={onTap === undefined}
              mark={card && markOf ? markOf(card) : "none"}
            />
          </div>
        );
        const position: CSSProperties = { left: i * step, top };
        return onTap && card ? (
          <button
            key={i}
            type="button"
            aria-pressed={lifted}
            aria-label={tapLabel?.(card) ?? card}
            onClick={() => onTap(card)}
            className="absolute rounded-md outline-none transition-[top] duration-150 focus-visible:ring-2 focus-visible:ring-gold"
            style={position}>
            {face}
          </button>
        ) : (
          <div
            key={i}
            className="absolute transition-[top] duration-150"
            style={position}>
            {face}
          </div>
        );
      })}
    </div>
  );
};
