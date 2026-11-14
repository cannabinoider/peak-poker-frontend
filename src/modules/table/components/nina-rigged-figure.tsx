import { type CSSProperties, type ReactNode, useId } from "react";

import type { DealMode } from "@/modules/table/components/card-deal";
import {
  type ArmRole,
  CardBackGradient,
  CardFan,
  CLUB,
  type DealerLayer,
  DECK_ARM,
  DIAMOND,
  type FanPlacement,
  FREE_ARM,
  HEART,
  Joint,
  Mirror,
  Riffle,
  rig,
  rigClass,
  SPADE,
} from "@/modules/table/components/dealer-rig";
import { limbPath } from "@/modules/table/utils/limb-path";

import s from "./dealer-figure.module.css";

type NinaRiggedFigureProps = {
  className: string;
  style: CSSProperties;
  label: string;
  mode: DealMode;
  layer: DealerLayer;
};

const ASSET = "/nina-rig/";

/** Waist up, the same shape of box as Naomi's (4:5). */
export const NINA_VIEW_BOX = { x: 14, y: 6, w: 132, h: 165 };

/*
 * One scale for every body layer, so the arms match the torso: the torso art
 * is 498px tall and drawn 158 units tall. Everything is centred on x = 80, the
 * middle of the head. The right arm is the left arm mirrored about that line.
 */
const K = 158 / 498;
const MID = 80;

const TORSO = { x: MID - 117 * K, y: 58, w: 234 * K, h: 158 };
/** Her hands come from the bottom of the old sleeved arm art. */
const ARM_ART = { x: 19.1, y: 68.3, w: 116 * K, h: 466 * K, handFrom: 381 / 466 };
const artPoint = (px: number, py: number) => ({
  x: ARM_ART.x + px * K,
  y: ARM_ART.y + py * K,
});
const SHOULDER = artPoint(98, 40);
const ELBOW = artPoint(88, 220);
/** Middle of her painted wrist, so the bare forearm lines up with the hand. */
const WRIST = artPoint(54, 376);

/** Length and angle (clockwise from straight down) of the bone between two joints. */
const bone = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
  length: Math.hypot(b.x - a.x, b.y - a.y),
  angle: (Math.atan2(a.x - b.x, b.y - a.y) * 180) / Math.PI,
});
const UPPER = bone(SHOULDER, ELBOW);

/** Her left elbow in the idle pose (upper arm turned out 6deg at the shoulder). */
export const NINA_ELBOW = { x: 41, y: 137.5 };
const FORE = bone(ELBOW, WRIST);

/* Bare arms, drawn along +y in each bone's own frame. The outer side is -x. */
const UPPER_ARM = limbPath(
  UPPER.length,
  [
    [0, 7.6],
    [0.3, 7],
    [0.65, 5.9],
    [1, 5],
  ],
  [
    [0, 6.8],
    [0.35, 6.3],
    [0.7, 5.6],
    [1, 5],
  ],
);
/* As wide at the wrist as her painted hand (about 12 units), so they join. */
const FOREARM = limbPath(
  FORE.length + 4,
  [
    [0, 5.4],
    [0.3, 6.5],
    [0.75, 6],
    [1, 6],
  ],
  [
    [0, 5.4],
    [0.25, 6.1],
    [0.75, 5.8],
    [1, 6],
  ],
);

/* Sampled from her painted hands and chest. */
const SKIN = "#FFD0B2";
const SKIN_LIGHT = "#FFDDC6";
const SKIN_SHADE = "#EDB394";
const SKIN_LINE = "#8A5A48";
const INK = "#2B2230";

/** A spade with a curling vine, on the outside of each upper arm. */
const UpperTattoo = () => (
  <g fill="none" stroke={INK} strokeWidth="0.45" strokeLinecap="round" opacity="0.85">
    <path d="M-4.6 8C-6 14 -3 18 -4.8 24C-6.4 29 -3.6 34 -4.4 40" />
    <path d="M-5.2 15c-1.4-.4-2-1.6-1.6-2.6c1.1.2 1.8 1.3 1.6 2.6Z" />
    <path d="M-4.6 31c1.3-.6 2.6-.2 3 .8c-1.1.6-2.4.3-3-.8Z" />
    <path
      d={SPADE}
      transform="translate(-3.4 22) scale(0.9)"
      fill={INK}
      stroke="none"
    />
  </g>
);

/** The four suits running down her right forearm. */
const SuitsTattoo = () => (
  <g fill={INK} opacity="0.85">
    {[SPADE, HEART, DIAMOND, CLUB].map((d, i) => (
      <path key={d} d={d} transform={`translate(-0.6 ${12 + i * 8}) scale(0.7)`} />
    ))}
  </g>
);

/** A little playing card with a heart, on her left forearm. */
const CardTattoo = () => (
  <g transform="translate(-0.5 22)" opacity="0.85">
    <rect
      x="-3"
      y="-4.2"
      width="6"
      height="8.4"
      rx="0.9"
      fill="none"
      stroke={INK}
      strokeWidth="0.45"
    />
    <path d={HEART} transform="scale(0.62)" fill={INK} />
  </g>
);

/** Where the fan of cards is held: the bottom of the fan, between her hands. */
export const NINA_FAN: FanPlacement = { x: MID, y: 209, card: { w: 15, h: 21 } };

/** Bare skin, softly shaded at both edges. */
const Skin = ({ d, fill }: { d: string; fill: string }) => (
  <path d={d} fill={fill} stroke={SKIN_LINE} strokeWidth="0.35" />
);

/**
 * Forearm and her painted hand, posed at the shoulder and elbow (drawn as her
 * left arm). Both hands use the same art, one mirrored, so they match.
 */
const Forearm = ({
  ids,
  role,
  tattoo,
}: {
  ids: { skin: string; hand: string };
  role: ArmRole;
  tattoo: ReactNode;
}) => {
  const handArt = (
    <image
      href={`${ASSET}left-arm.webp`}
      x={ARM_ART.x}
      y={ARM_ART.y}
      width={ARM_ART.w}
      height={ARM_ART.h}
      clipPath={`url(#${ids.hand})`}
    />
  );
  return (
    <Joint x={SHOULDER.x} y={SHOULDER.y} className={role.shoulder}>
      <Joint x={ELBOW.x - SHOULDER.x} y={ELBOW.y - SHOULDER.y} className={role.elbow}>
        <g className={role.motion}>
          <g transform={`rotate(${FORE.angle})`}>
            {/* A forearm reaching toward us looks shorter: scale along the bone. */}
            <g className={role.reach}>
              <Skin d={FOREARM} fill={`url(#${ids.skin})`} />
              {/* Hides the seam where the forearm meets the upper arm. */}
              <circle r={4.9} fill={`url(#${ids.skin})`} />
              {tattoo}
            </g>
            <g className={role.hand}>
              <g
                transform={`rotate(${-FORE.angle}) translate(${-ELBOW.x} ${-ELBOW.y})`}>
                {handArt}
              </g>
            </g>
          </g>
        </g>
      </Joint>
    </Joint>
  );
};

/**
 * Nina from the waist up, as two layers of one figure: her body stands behind
 * the felt ("back"); her forearms, hands and cards reach over it ("front").
 */
export const NinaRiggedFigure = ({
  className,
  style,
  label,
  mode,
  layer,
}: NinaRiggedFigureProps) => {
  const id = useId().replace(/:/g, "");
  const ids = {
    skin: `${id}-skin`,
    hand: `${id}-hand`,
    fade: `${id}-fade`,
    back: `${id}-back`,
    arms: `${id}-arms`,
  };
  const vb = NINA_VIEW_BOX;
  const svgProps = {
    viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`,
    className: `${className} ${s.nina} ${rigClass(rig.ninaPose, mode)}`,
    style: { ...style, "--fore-length": FORE.length } as CSSProperties,
  };

  const defs = (
    <defs>
      <linearGradient
        id={ids.skin}
        gradientUnits="userSpaceOnUse"
        x1="-6.6"
        x2="6.6"
        y1="0"
        y2="0">
        <stop offset="0" stopColor={SKIN_SHADE} />
        <stop offset="0.3" stopColor={SKIN} />
        <stop offset="0.55" stopColor={SKIN_LIGHT} />
        <stop offset="0.85" stopColor={SKIN} />
        <stop offset="1" stopColor={SKIN_SHADE} />
      </linearGradient>
      <CardBackGradient id={ids.back} />
      <clipPath id={ids.arms} clipPathUnits="userSpaceOnUse">
        <rect x={-50} y={112} width={260} height={200} />
      </clipPath>
      <clipPath id={ids.hand} clipPathUnits="objectBoundingBox">
        <rect x={-1} y={ARM_ART.handFrom} width={3} height={1} />
      </clipPath>
      {/* Her body fades out at the waist, behind the table. */}
      <linearGradient
        id={`${ids.fade}-g`}
        gradientUnits="userSpaceOnUse"
        x1="0"
        x2="0"
        y1="136"
        y2="150">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <mask
        id={ids.fade}
        maskUnits="userSpaceOnUse"
        x="-50"
        y="-50"
        width="260"
        height="300">
        <rect x="-50" y="-50" width="260" height="300" fill={`url(#${ids.fade}-g)`} />
      </mask>
    </defs>
  );

  const upperArm = (role: ArmRole) => (
    <Joint x={SHOULDER.x} y={SHOULDER.y} className={role.shoulder}>
      <g transform={`rotate(${UPPER.angle})`}>
        <Skin d={UPPER_ARM} fill={`url(#${ids.skin})`} />
        <UpperTattoo />
      </g>
    </Joint>
  );

  if (layer === "front") {
    const cards = `url(#${ids.back})`;
    return (
      <svg {...svgProps} aria-hidden>
        {defs}
        <g className={rig.character}>
          <CardFan at={NINA_FAN} fill={cards} />
          <Riffle x={MID} y={180} card={{ w: 10, h: 14 }} fill={cards} />
          {/* Her arms from just below the bust, so the table never comes between them. */}
          <g clipPath={`url(#${ids.arms})`}>
            {upperArm(FREE_ARM)}
            <Mirror mid={MID}>{upperArm(DECK_ARM)}</Mirror>
          </g>
          <Forearm ids={ids} role={FREE_ARM} tattoo={<CardTattoo />} />
          <Mirror mid={MID}>
            <Forearm ids={ids} role={DECK_ARM} tattoo={<SuitsTattoo />} />
          </Mirror>
        </g>
      </svg>
    );
  }

  return (
    <svg {...svgProps} role="img" aria-label={label}>
      {defs}
      <g className={rig.character}>
        <g mask={`url(#${ids.fade})`}>
          <image
            href={`${ASSET}back-hair-full.webp`}
            x="49"
            y="14"
            width="62"
            height="140"
          />
          {upperArm(FREE_ARM)}
          <Mirror mid={MID}>{upperArm(DECK_ARM)}</Mirror>
          <image
            href={`${ASSET}torso-full.webp`}
            x={TORSO.x}
            y={TORSO.y}
            width={TORSO.w}
            height={TORSO.h}
          />
        </g>

        <g className={rig.head}>
          <image href={`${ASSET}head.webp`} x="60" y="21" width="40" height="49" />

          <g className={rig.eyesOpen}>
            <g className={s.pupils}>
              <image
                href={`${ASSET}eye-left.webp`}
                x="65"
                y="45"
                width="14"
                height="8"
              />
              <image
                href={`${ASSET}eye-right.webp`}
                x="81"
                y="45"
                width="14"
                height="8"
              />
            </g>
          </g>
          <g className={rig.eyesClosed}>
            <image
              href={`${ASSET}closed-left.webp`}
              x="65"
              y="47"
              width="14"
              height="5"
            />
            <image
              href={`${ASSET}closed-left.webp`}
              x="-95"
              y="47"
              width="14"
              height="5"
              transform="scale(-1 1)"
            />
          </g>

          <path
            d="M79 53c-1.5 2.6-1.2 4.3 1.6 4.8"
            stroke="#D98F79"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />

          <image
            className={s.smile}
            href={`${ASSET}lips.webp`}
            x="75"
            y="60"
            width="10"
            height="4.5"
          />
          <image
            className={s.kissMouth}
            href={`${ASSET}kiss-lips.webp`}
            x="76"
            y="59.5"
            width="8"
            height="6"
          />
          <image href={`${ASSET}bangs.webp`} x="58" y="17" width="44" height="56" />
        </g>
      </g>

      <image
        className={s.kiss}
        href={`${ASSET}heart.webp`}
        x="85"
        y="57"
        width="7"
        height="8"
      />
    </svg>
  );
};
