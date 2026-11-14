import type { ReactNode } from "react";

import type { DealMode } from "@/modules/table/components/card-deal";

import r from "./dealer-rig.module.css";

/*
 * Pieces both dealers are built from: joints that the shared CSS poses, the
 * table's card back, and the fan of face-down cards held between her hands.
 */

/** Card suits, about 6 units tall, centred on the origin. */
export const SPADE =
  "M0 -3.2C1.6 -1.4 3 -0.2 3 1.2C3 2.6 1.4 3.1 0.4 2.1L1 4H-1L-0.4 2.1C-1.4 3.1 -3 2.6 -3 1.2C-3 -0.2 -1.6 -1.4 0 -3.2Z";
export const HEART =
  "M0 3C-2.4 1.2 -3 0 -3 -1C-3 -2.4 -1.2 -3 0 -1.6C1.2 -3 3 -2.4 3 -1C3 0 2.4 1.2 0 3Z";
export const DIAMOND = "M0 -3L2.2 0L0 3L-2.2 0Z";
export const CLUB =
  "M0 -3.2A1.4 1.4 0 1 1 0.9 -0.4A1.4 1.4 0 1 1 0.4 2L0.9 3.6H-0.9L-0.4 2A1.4 1.4 0 1 1 -0.9 -0.4A1.4 1.4 0 1 1 0 -3.2Z";

/** "back" is drawn behind the felt (her body), "front" over it (arms, hands, cards). */
export type DealerLayer = "back" | "front";

/** CSS classes for one arm's joints. Both arms are posed as her left arm. */
export type ArmRole = {
  shoulder: string;
  elbow: string;
  motion: string;
  reach: string;
  hand: string;
};

/** Her left arm (on our left): rests on the table and helps shuffle. */
export const FREE_ARM: ArmRole = {
  shoulder: r.freeShoulder,
  elbow: r.freeElbow,
  motion: r.freeMotion,
  reach: r.freeReach,
  hand: r.freeHand,
};

/** Her right arm (drawn mirrored): flicks a card toward the table per throw. */
export const DECK_ARM: ArmRole = {
  shoulder: r.deckShoulder,
  elbow: r.deckElbow,
  motion: r.deckMotion,
  reach: r.deckReach,
  hand: r.deckHandShift,
};

/** Classes for the figure's svg: the dealer's poses plus the current mode. */
export const rigClass = (pose: string, mode: DealMode) =>
  `${pose} ${mode === "shuffle" ? r.shuffling : mode === "deal" ? r.dealing : ""}`;

export const rig = r;

/** Mirrors its children about the vertical line x = mid. */
export const Mirror = ({ mid, children }: { mid: number; children: ReactNode }) => (
  <g transform={`translate(${2 * mid} 0) scale(-1 1)`}>{children}</g>
);

/**
 * Turns its children about (x, y). Children are drawn with the joint at the
 * origin; the angle comes from the CSS class.
 */
export const Joint = ({
  x,
  y,
  className,
  children,
}: {
  x: number;
  y: number;
  className: string;
  children: ReactNode;
}) => (
  <g transform={`translate(${x} ${y})`}>
    <g className={className}>{children}</g>
  </g>
);

/** Gradient for the card back; put it in the svg's defs. */
export const CardBackGradient = ({ id }: { id: string }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#4F46E5" />
    <stop offset="1" stopColor="#1E1B4B" />
  </linearGradient>
);

/**
 * The table's card back (as PlayingCard draws it face down): indigo gradient,
 * soft white border and a faint spade. Top-left corner at the origin.
 */
export const CardBack = ({ fill, w, h }: { fill: string; w: number; h: number }) => (
  <>
    <rect
      width={w}
      height={h}
      rx={w * 0.14}
      fill={fill}
      stroke="rgba(255, 255, 255, 0.7)"
      strokeWidth={w * 0.05}
    />
    <path
      d={SPADE}
      transform={`translate(${w / 2} ${h / 2 - 0.3}) scale(${w / 15})`}
      fill="rgba(255, 255, 255, 0.35)"
    />
  </>
);

export type FanPlacement = { x: number; y: number; card: { w: number; h: number } };

/** Five cards fanned out from one corner at (x, y), face down: nobody sees them. */
export const CardFan = ({ at, fill }: { at: FanPlacement; fill: string }) => {
  const { w, h } = at.card;
  return (
    <g className={r.fan} transform={`translate(${at.x} ${at.y})`}>
      {[-2, -1, 0, 1, 2].map((i) => (
        <g key={i} transform={`rotate(${i * 12})`}>
          <g transform={`translate(${-w / 2} ${-h - 2})`}>
            <CardBack fill={fill} w={w} h={h} />
          </g>
        </g>
      ))}
    </g>
  );
};

/** The middle card of the fan: where dealt cards start, in view-box units. */
export const fanCentre = (at: FanPlacement) => ({
  x: at.x,
  y: at.y - 2 - at.card.h / 2,
});

/** Two half-decks between her fingertips while she shuffles; tops at y. */
export const Riffle = ({
  x,
  y,
  card,
  fill,
}: {
  x: number;
  y: number;
  card: { w: number; h: number };
  fill: string;
}) => (
  <g className={r.shuffleDeck}>
    {[r.riffleLeft, r.riffleRight].map((cls, i) => (
      <g
        key={cls}
        transform={`translate(${x + (i === 0 ? -card.w + 0.5 : -0.5)} ${y})`}>
        <g className={cls}>
          <CardBack fill={fill} w={card.w} h={card.h} />
        </g>
      </g>
    ))}
  </g>
);
