import { type Suit, suitHex } from "./card-utils";

/*
 * Shapes ported from the Flutter `_SuitPainter`, which draws in a unit square;
 * here the same coordinates are scaled to a 100×100 viewBox. Each piece is a
 * separate element (like separate canvas draws), so a translucent color
 * composites the same way it does in Flutter.
 */
const SHAPES: Record<Suit, React.ReactNode> = {
  hearts: (
    <path d="M50 95C18 68 0 48 4 28C9 5 42 2 50 24C58 2 91 5 96 28C100 48 82 68 50 95Z" />
  ),
  diamonds: <path d="M50 0Q66 30 90 50Q66 70 50 100Q34 70 10 50Q34 30 50 0Z" />,
  spades: (
    <>
      <path d="M50 2C82 30 100 45 96 62C92 82 62 84 53 68L47 68C38 84 8 82 4 62C0 45 18 30 50 2Z" />
      <path d="M50 60L66 98L34 98Z" />
    </>
  ),
  clubs: (
    <>
      <circle cx="50" cy="27" r="21" />
      <circle cx="26" cy="58" r="21" />
      <circle cx="74" cy="58" r="21" />
      <circle cx="50" cy="50" r="12" />
      <path d="M50 52L66 98L34 98Z" />
    </>
  ),
};

export type SuitIconProps = {
  suit: Suit;
  /** Square size: px number, or any CSS length ("1em" to sit next to text). */
  size?: number | string;
  /** Defaults to red for hearts/diamonds, near-black for spades/clubs. */
  color?: string;
  /** Accessible name; without it the icon is decorative (aria-hidden). */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
};

/** A suit drawn as a vector shape — no font glyphs, crisp everywhere. */
export const SuitIcon = ({
  suit,
  size = 16,
  color,
  title,
  className,
  style,
}: SuitIconProps) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill={color ?? suitHex(suit)}
    className={className}
    style={{ display: "inline-block", flexShrink: 0, ...style }}
    {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
    {SHAPES[suit]}
  </svg>
);
