import { type CSSProperties, useId } from "react";

import type { DealMode } from "@/modules/table/components/card-deal";
import {
  type ArmRole,
  CardBackGradient,
  CardFan,
  type DealerLayer,
  DECK_ARM,
  type FanPlacement,
  FREE_ARM,
  Joint,
  Mirror,
  Riffle,
  rig,
  rigClass,
} from "@/modules/table/components/dealer-rig";
import { limbPath } from "@/modules/table/utils/limb-path";

import s from "./dealer-figure.module.css";

/*
 * Drawn in the same flat, rounded style as the animal avatars, in the game's
 * colours: navy waistcoat, gold trim, the table's card back.
 */
const SKIN = "#F2C4A8";
const SKIN_SHADE = "#E2A98B";
const BLUSH = "#F9A8B8";
const HAIR = "#2A1A1F";
const HAIR_SHINE = "#4A2F36";
const SHIRT = "#F8FAFC";
const SHIRT_SHADE = "#CBD5E1";
const VEST = "#0F172A";
const VEST_EDGE = "#1E293B";
const GOLD = "#F5C451";
const GOLD_DEEP = "#E0A82E";
const LIPS = "#D9465F";
const EYES = "#1C1917";

export const NAOMI_VIEW_BOX = { x: 0, y: 0, w: 160, h: 200 };
const MID = 80;

/** Her left elbow, at the bottom of her sleeve; the right one is mirrored. */
export const NAOMI_ELBOW = { x: 34, y: 180 };
const FORE_LENGTH = 29;
const SLEEVE = limbPath(
  FORE_LENGTH,
  [
    [0, 7.8],
    [0.5, 7.2],
    [1, 6.6],
  ],
  [
    [0, 7.6],
    [0.5, 7],
    [1, 6.6],
  ],
);
/** Round elbow, the width of the sleeve there, so the bend reads as one arm. */
const ELBOW_R = 7.7;

/*
 * Her upper arm, shoulder to elbow. The whole of it is drawn with her body;
 * the part below `UPPER_SLEEVE_FROM` is drawn again over the felt with her
 * forearm, so the table never comes between them.
 */
const NAOMI_SHOULDER = { x: 50, y: 134 };
const UPPER_SLEEVE_FROM = 150;
const UPPER = {
  length: Math.hypot(
    NAOMI_ELBOW.x - NAOMI_SHOULDER.x,
    NAOMI_ELBOW.y - NAOMI_SHOULDER.y,
  ),
  angle:
    (Math.atan2(NAOMI_SHOULDER.x - NAOMI_ELBOW.x, NAOMI_ELBOW.y - NAOMI_SHOULDER.y) *
      180) /
    Math.PI,
};
const UPPER_SLEEVE = limbPath(
  UPPER.length,
  [
    [0, 9],
    [0.5, 9],
    [1, 8],
  ],
  [
    [0, 8],
    [0.5, 8],
    [1, 7.5],
  ],
);

/**
 * The white shirt cloth of her sleeves, with a soft shadow down the outer side.
 * Every part of the arm uses it in its own bone frame, so they match.
 */
const ClothGradient = ({ id }: { id: string }) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="-9" x2="8" y1="0" y2="0">
    <stop offset="0" stopColor={SHIRT_SHADE} />
    <stop offset="0.38" stopColor={SHIRT} />
    <stop offset="1" stopColor={SHIRT} />
  </linearGradient>
);

const UpperSleeve = ({ cloth }: { cloth: string }) => (
  <g
    transform={`translate(${NAOMI_SHOULDER.x} ${NAOMI_SHOULDER.y}) rotate(${UPPER.angle})`}>
    <path d={UPPER_SLEEVE} fill={cloth} />
  </g>
);

/** Where she holds the fan of cards, between her fingertips. */
export const NAOMI_FAN: FanPlacement = { x: MID, y: 221, card: { w: 14, h: 19 } };

/** Sleeve, black cuff and hand, drawn down the bone from the elbow (her left arm). */
const Forearm = ({ role, cloth }: { role: ArmRole; cloth: string }) => (
  <Joint x={NAOMI_ELBOW.x} y={NAOMI_ELBOW.y} className={role.elbow}>
    <g className={role.motion}>
      <path d={SLEEVE} fill={cloth} />
      <circle r={ELBOW_R} fill={cloth} />
      <rect x={-6.9} y={23} width={13.8} height={4.6} rx={1.2} fill={VEST} />
      {/* Hand: palm and fingers pointing on down the arm, thumb on the inside. */}
      <path
        d="M-5.4 28.5C-6.4 33 -5.6 39.5 -2.2 41.6C0 42.8 2.6 42.4 4.2 40.4C6.4 37.4 6.2 32 5.2 28.5Z"
        fill={SKIN}
      />
      <ellipse
        cx={5.6}
        cy={31.4}
        rx={2.3}
        ry={3.8}
        transform="rotate(-28 5.6 31.4)"
        fill={SKIN}
        stroke={SKIN_SHADE}
        strokeWidth="0.6"
      />
      <path
        d="M-2.6 35.6v4M0.2 36.2v4.6M2.8 35.6v3.8"
        stroke={SKIN_SHADE}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </g>
  </Joint>
);

type NaomiFigureProps = {
  className: string;
  style: CSSProperties;
  label: string;
  mode: DealMode;
  layer: DealerLayer;
};

/**
 * Naomi from the waist up, as two layers of one figure: her body stands behind
 * the felt ("back"); her forearms, hands and cards reach over it ("front").
 */
export const NaomiFigure = ({
  className,
  style,
  label,
  mode,
  layer,
}: NaomiFigureProps) => {
  const id = useId().replace(/:/g, "");
  const ids = {
    back: `${id}-back`,
    fade: `${id}-fade`,
    arms: `${id}-arms`,
    cloth: `${id}-cloth`,
  };
  const cloth = `url(#${ids.cloth})`;
  const vb = NAOMI_VIEW_BOX;
  const svgProps = {
    viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`,
    className: `${className} ${rigClass(rig.naomiPose, mode)}`,
    style: { ...style, "--fore-length": FORE_LENGTH } as CSSProperties,
  };

  if (layer === "front") {
    const cards = `url(#${ids.back})`;
    return (
      <svg {...svgProps} aria-hidden>
        <defs>
          <CardBackGradient id={ids.back} />
          <ClothGradient id={ids.cloth} />
          <clipPath id={ids.arms} clipPathUnits="userSpaceOnUse">
            <rect x={-50} y={UPPER_SLEEVE_FROM} width={260} height={200} />
          </clipPath>
        </defs>
        <CardFan at={NAOMI_FAN} fill={cards} />
        <g clipPath={`url(#${ids.arms})`}>
          <UpperSleeve cloth={cloth} />
          <Mirror mid={MID}>
            <UpperSleeve cloth={cloth} />
          </Mirror>
        </g>
        <Riffle x={MID} y={194} card={{ w: 10, h: 14 }} fill={cards} />
        <Forearm role={FREE_ARM} cloth={cloth} />
        <Mirror mid={MID}>
          <Forearm role={DECK_ARM} cloth={cloth} />
        </Mirror>
      </svg>
    );
  }

  return (
    <svg {...svgProps} role="img" aria-label={label}>
      <defs>
        <ClothGradient id={ids.cloth} />
        {/* Her body fades out at the waist, behind the table. */}
        <linearGradient
          id={`${ids.fade}-g`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          x2="0"
          y1="174"
          y2="196">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask
          id={ids.fade}
          maskUnits="userSpaceOnUse"
          x="-20"
          y="-20"
          width="200"
          height="240">
          <rect x="-20" y="-20" width="200" height="240" fill={`url(#${ids.fade}-g)`} />
        </mask>
      </defs>

      <g className={s.body} mask={`url(#${ids.fade})`}>
        {/* Hair bun and the hair behind her head. */}
        <circle cx="80" cy="30" r="15" fill={HAIR} />
        <path
          d="M72 22c4-5 12-5 16 0"
          stroke={HAIR_SHINE}
          strokeWidth="2"
          fill="none"
        />
        <ellipse cx="80" cy="64" rx="28" ry="30" fill={HAIR} />

        {/* Shirt. */}
        <path d="M26 200c0-48 18-76 54-80 36 4 54 32 54 80z" fill={SHIRT} />

        {/* Waistcoat with gold piping and buttons. */}
        <path
          d="M48 200l3-50c3-14 12-22 22-25l7 38 7-38c10 3 19 11 22 25l3 50z"
          fill={VEST}
        />
        <path
          d="M51 150c3-14 12-22 22-25l7 38"
          stroke={VEST_EDGE}
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M73 125l7 38 7-38"
          stroke={GOLD}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="80" cy="172" r="2.2" fill={GOLD} />
        <circle cx="80" cy="186" r="2.2" fill={GOLD} />
        {/* Her upper arms, down to the elbows. */}
        <UpperSleeve cloth={cloth} />
        <Mirror mid={MID}>
          <UpperSleeve cloth={cloth} />
        </Mirror>

        {/* Name badge: a little gold spade. */}
        <rect x="56" y="146" width="15" height="9" rx="2" fill={GOLD_DEEP} />
        <path
          d="M63.5 148c-2 2-3.6 3-3.6 4.2 0 1.2 1.6 1.6 3 .6l-.6 1.6h2.4l-.6-1.6c1.4 1 3 .6 3-.6 0-1.2-1.6-2.2-3.6-4.2z"
          fill={VEST}
        />

        {/* Neck, collar and gold bow tie. */}
        <path d="M71 100h18v22c-4 4-14 4-18 0z" fill={SKIN} />
        <path
          d="M71 108c5 4 13 4 18 0"
          stroke={SKIN_SHADE}
          strokeWidth="2"
          fill="none"
        />
        <path d="M69 118l11 8-8 6zM91 118l-11 8 8 6z" fill={SHIRT} />
        <path d="M68 121l12 5-12 6zM92 121l-12 5 12 6z" fill={GOLD} />
        <rect x="77" y="122.5" width="6" height="7" rx="2" fill={GOLD_DEEP} />
      </g>

      {/* Head: tilts on its own. */}
      <g className={s.head}>
        <ellipse cx="80" cy="74" rx="24" ry="27" fill={SKIN} />
        <ellipse cx="56" cy="78" rx="4" ry="6" fill={SKIN_SHADE} />
        <ellipse cx="104" cy="78" rx="4" ry="6" fill={SKIN_SHADE} />
        <circle cx="56" cy="86" r="2.2" fill={GOLD} />
        <circle cx="104" cy="86" r="2.2" fill={GOLD} />

        {/* Side-swept fringe, pulled back into the bun. */}
        <path
          d="M54 72c-4-26 10-40 28-40 18 0 30 12 28 34-8-14-22-20-36-16-8 3-15 10-20 22z"
          fill={HAIR}
        />
        <path
          d="M66 46c8-6 22-6 30 2"
          stroke={HAIR_SHINE}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />

        <ellipse cx="66" cy="86" rx="5" ry="3" fill={BLUSH} opacity="0.55" />
        <ellipse cx="94" cy="86" rx="5" ry="3" fill={BLUSH} opacity="0.55" />

        {/* Brows. */}
        <path
          d="M62 64c4-3 9-3 12 0M86 64c3-3 8-3 12 0"
          stroke={HAIR}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes: open (blinking), and a wink for the right eye. */}
        <g className={s.eyes}>
          <g className={s.pupils}>
            <ellipse cx="68" cy="75" rx="3.6" ry="4.4" fill={EYES} />
            <circle cx="69.2" cy="73.4" r="1.2" fill="#fff" />
            <g className={s.openRight}>
              <ellipse cx="92" cy="75" rx="3.6" ry="4.4" fill={EYES} />
              <circle cx="93.2" cy="73.4" r="1.2" fill="#fff" />
            </g>
          </g>
          <path
            d="M63.5 71.5l-2.5-2M96.5 71.5l2.5-2"
            stroke={EYES}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
        <path
          className={s.wink}
          d="M87 76c3 3 7 3 10 0"
          stroke={EYES}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M78 82c1.4 1.4 2.6 1.4 4 0"
          stroke={SKIN_SHADE}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mouth: a soft smile, or a big one when cheering. */}
        <path
          className={s.smile}
          d="M73 90c4 4 10 4 14 0"
          stroke={LIPS}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path className={s.grin} d="M72 89c2 7 14 7 16 0z" fill={LIPS} />
      </g>
    </svg>
  );
};
