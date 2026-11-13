import { cn } from "@/lib/utils/styles";

import { cardName, parseCard, type ParsedCard } from "./card-utils";
import { SuitIcon } from "./suit-icon";

/** Wild / poison marking on a card. */
export type CardMark = "none" | "wild" | "poison";

export type PlayingCardProps = {
  /** "As", "Td", "10h"… Null/undefined (or unparsable) draws the card back. */
  card?: string | null;
  /** Card width in px; height is width × 1.4. */
  width?: number;
  /** Draws an empty board slot instead of a card. */
  placeholder?: boolean;
  /** Gold border + glow (winning card, selected card). */
  highlight?: boolean;
  /** Half opacity (folded hand). */
  dimmed?: boolean;
  /** Face-up cards flip in when they first appear or change. */
  animate?: boolean;
  mark?: CardMark;
  className?: string;
  style?: React.CSSProperties;
};

const GOLD = "#F5C451";
const POISON = "#A855F7";
const WILD_FACE = "#FFFBEB";

/*
 * Flutter blurRadius r is a Gaussian with sigma = 0.57735·r + 0.5; CSS
 * box-shadow blur is 2·sigma. So Flutter 4 → 5.6px, 10 → 12.5px.
 */
const SHADOW = "0 2px 5.6px rgba(0, 0, 0, 0.38)";
const glowShadow = (rgb: string) => `0 2px 12.5px rgba(${rgb}, 0.6)`;
const GOLD_RGB = "245, 196, 81";
const POISON_RGB = "168, 85, 247";

/** Material `close` and `auto_awesome` icons (24×24). */
const CLOSE_PATH =
  "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";
const SPARKLE_PATH =
  "m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z";

/*
 * Flip-in: rotateY 90°→0 with perspective (Flutter's setEntry(3,2,0.002) ≈
 * 500px) and opacity 0→1, 420ms easeOutCubic. React 19 hoists and dedupes this
 * <style> by `href`, so it works from server components.
 */
const FLIP_CSS = `@keyframes playing-card-flip{from{transform:perspective(500px) rotateY(90deg);opacity:0}to{transform:perspective(500px) rotateY(0deg);opacity:1}}.playing-card-flip{animation:playing-card-flip 420ms cubic-bezier(0.215,0.61,0.355,1) both}@media (prefers-reduced-motion:reduce){.playing-card-flip{animation:none}}`;

const FlipStyle = () => (
  <style href="playing-card-flip" precedence="default">
    {FLIP_CSS}
  </style>
);

const Face = ({ c, width, highlight, dimmed, mark }: FaceProps) => {
  const glow =
    mark === "wild" ? "gold" : mark === "poison" ? "poison" : highlight ? "gold" : null;
  const glowHex = glow === "gold" ? GOLD : glow === "poison" ? POISON : null;
  const twoChars = c.rankLabel.length > 1;
  return (
    <div
      className="relative"
      style={{
        width,
        height: width * 1.4,
        borderRadius: width * 0.14,
        opacity: dimmed || mark === "poison" ? 0.5 : 1,
        background: mark === "wild" ? WILD_FACE : "#FFFFFF",
        border: glowHex ? `${width > 30 ? 2.5 : 1.5}px solid ${glowHex}` : undefined,
        boxShadow:
          glow === "gold"
            ? glowShadow(GOLD_RGB)
            : glow === "poison"
              ? glowShadow(POISON_RGB)
              : SHADOW,
      }}>
      {mark !== "none" && (
        <svg
          viewBox="0 0 24 24"
          width={width * 0.28}
          height={width * 0.28}
          fill={mark === "wild" ? GOLD : POISON}
          className="absolute"
          style={{ right: width * 0.06, top: width * 0.06 }}>
          <path d={mark === "wild" ? SPARKLE_PATH : CLOSE_PATH} />
        </svg>
      )}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: width * 0.09, top: width * 0.05 }}>
        <span
          className="block whitespace-nowrap font-sans font-extrabold"
          style={{
            color: c.hex,
            fontSize: width * (twoChars ? 0.32 : 0.38),
            lineHeight: 1.05,
            letterSpacing: -1,
          }}>
          {c.rankLabel}
        </span>
        <SuitIcon
          suit={c.suit}
          size={width * 0.24}
          color={c.hex}
          style={{ display: "block", marginTop: width * 0.03 }}
        />
      </div>
      <SuitIcon
        suit={c.suit}
        size={width * 0.5}
        color={c.hex}
        className="absolute"
        style={{ display: "block", right: width * 0.08, bottom: width * 0.04 }}
      />
    </div>
  );
};

type FaceProps = {
  c: ParsedCard;
  width: number;
  highlight: boolean;
  dimmed: boolean;
  mark: CardMark;
};

/**
 * A playing card (port of the Flutter `PlayingCard`). No card → card back;
 * `placeholder` → empty board slot. New face-up cards flip in.
 */
export const PlayingCard = ({
  card,
  width = 40,
  placeholder = false,
  highlight = false,
  dimmed = false,
  animate = true,
  mark = "none",
  className,
  style,
}: PlayingCardProps) => {
  const height = width * 1.4;
  const radius = width * 0.14;

  if (placeholder) {
    return (
      <div
        role="img"
        aria-label="Empty card slot"
        className={cn("shrink-0 border border-white/[0.14] bg-black/[0.12]", className)}
        style={{ width, height, borderRadius: radius, ...style }}
      />
    );
  }

  const c = card ? parseCard(card) : null;
  if (!c) {
    return (
      <div
        role="img"
        aria-label="Face-down card"
        className={cn(
          "flex shrink-0 select-none items-center justify-center",
          className,
        )}
        style={{
          width,
          height,
          borderRadius: radius,
          background: "linear-gradient(to bottom right, #4F46E5, #1E1B4B)",
          border: `${width * 0.04}px solid rgba(255, 255, 255, 0.7)`,
          boxShadow: SHADOW,
          ...style,
        }}>
        <SuitIcon
          suit="spades"
          size={width * 0.42}
          color="rgba(255, 255, 255, 0.35)"
          style={{ display: "block" }}
        />
      </div>
    );
  }

  return (
    // Keyed by card, so a new card remounts and replays the flip.
    <div
      key={c.code}
      role="img"
      aria-label={cardName(c)}
      className={cn("shrink-0 select-none", animate && "playing-card-flip", className)}
      style={{ width, height, ...style }}>
      {animate && <FlipStyle />}
      <Face c={c} width={width} highlight={highlight} dimmed={dimmed} mark={mark} />
    </div>
  );
};
