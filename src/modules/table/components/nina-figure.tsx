import type { CSSProperties } from "react";

import s from "./dealer-figure.module.css";

const SKIN = "#F2C4A8";
const SKIN_SHADE = "#E2A98B";
const BLUSH = "#F43F6A";
const HAIR = "#E8C27A";
const HAIR_DEEP = "#C4923A";
const HAIR_SHINE = "#FFF6D0";
const DRESS = "#140C18";
const DRESS_SHADE = "#2A1834";
const GOLD = "#F5C451";
const LIPS = "#E11D48";
const LIP_SHINE = "#FECDD3";
const EYES = "#1C1917";
const CARD_BACK = "#4338CA";
const CARD_EDGE = "#818CF8";

type NinaFigureProps = {
  className: string;
  style: CSSProperties;
  label: string;
};

/**
 * Nina, waist-up. One silhouette: hair grows from the scalp and falls close
 * to the neck, the chest is the torso's own curve, and the dress follows
 * that waist. At showdown she blows a kiss. The deck stays where Naomi's is.
 */
export const NinaFigure = ({ className, style, label }: NinaFigureProps) => (
  <svg
    viewBox="0 0 160 200"
    className={`${className} ${s.nina}`}
    style={style}
    role="img"
    aria-label={label}>
    {/* One mass of hair: crown and both lengths are the same shape. */}
    <path
      d="M80 30c18-4 30 12 26 28 8 28 4 66-8 94-4 10-12 6-10-6 4-36 2-64-6-84-4-8-8-10-2-10-6 0-10 2-2 10-8 20-10 48-6 84 2 12-6 16-10 6-12-28-16-66-8-94C50 42 62 26 80 30z"
      fill={HAIR}
    />

    <g className={s.body}>
      <path d="M73 82h14v10c-2 2-12 2-14 0z" fill={SKIN} />
      <g className={s.bust}>
        {/* Skin only in the neckline. The dress is the torso, so the curve matches the waist. */}
        <path d="M66 104c8-8 20-8 28 0 6 12 2 28-14 30-16-2-20-18-14-30z" fill={SKIN} />
        <path
          d="M66 114Q48 130 50 144Q54 162 70 174Q76 190 64 200H96Q84 190 90 174Q106 162 110 144Q112 130 94 114Q80 136 66 114z"
          fill={DRESS}
        />
        <path d="M62 200 L70 172 L66 150 L62 200z" fill={DRESS_SHADE} />
        <path
          d="M66 116 Q80 134 94 116"
          stroke={GOLD}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <path d="M74 92c4 5 8 5 12 0" stroke={GOLD} strokeWidth="1.5" fill="none" />
      <circle cx="80" cy="98" r="1.8" fill={GOLD} />

      <g className={s.restArm}>
        <path d="M100 104c10 16 12 40 6 58-3 4-9 2-10-3-1-16 0-38 6-52z" fill={SKIN} />
        <path d="M104 158h11v2.2h-11z" fill={GOLD} />
        <ellipse cx="112" cy="166" rx="6.5" ry="4.5" fill={SKIN} />
      </g>
    </g>

    <g className={s.head}>
      <ellipse cx="80" cy="62" rx="22" ry="26" fill={SKIN} />
      {/* Hairline on the forehead, so the crown meets the face. */}
      <path
        d="M60 48c4-16 14-24 20-24s16 8 20 24c-8-8-14-10-20-10s-12 2-20 10z"
        fill={HAIR}
      />
      <path
        d="M68 32c6-4 16-5 24-1"
        stroke={HAIR_SHINE}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <ellipse cx="57" cy="66" rx="3.5" ry="5" fill={SKIN_SHADE} />
      <ellipse cx="103" cy="66" rx="3.5" ry="5" fill={SKIN_SHADE} />
      <circle cx="55" cy="72" r="1.8" fill={GOLD} />
      <circle cx="105" cy="72" r="1.8" fill={GOLD} />

      <ellipse cx="68" cy="72" rx="3.5" ry="2" fill={BLUSH} opacity="0.35" />
      <ellipse cx="92" cy="72" rx="3.5" ry="2" fill={BLUSH} opacity="0.35" />

      <path
        d="M66 50c4-3 9-3 12 0M82 50c3-3 8-3 12 0"
        stroke={HAIR_DEEP}
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M66 56c4-3 9-3 12 0M82 56c3-3 8-3 12 0"
        stroke={EYES}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      <g className={s.eyes}>
        <g className={s.pupils}>
          <ellipse cx="72" cy="60" rx="3.2" ry="3.8" fill={EYES} />
          <circle cx="73.1" cy="58.6" r="1.1" fill="#fff" />
          <ellipse cx="88" cy="60" rx="3.2" ry="3.8" fill={EYES} />
          <circle cx="89.1" cy="58.6" r="1.1" fill="#fff" />
        </g>
      </g>

      <path
        d="M78 68c1.2 1.2 2.6 1.2 4 0"
        stroke={SKIN_SHADE}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />

      <path
        className={s.smile}
        d="M70 74c3-3 7-4 10-2 3-2 7-1 10 2-2 2-6 3-10 2-4 1-8 0-10-2z"
        fill={LIPS}
      />
      <path className={s.smile} d="M71 76c3 5 15 5 18 0-4 2-14 2-18 0z" fill={LIPS} />
      <path
        className={s.smile}
        d="M74 75.5c2 1 5 1.4 8 0"
        stroke={LIP_SHINE}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse className={s.kissMouth} cx="80" cy="78" rx="2.4" ry="1.7" fill={LIPS} />
      <path
        className={s.kiss}
        d="M80 74c-1.4-2-4.2-1.3-4.2 1.1 0 2 4.2 4.8 4.2 4.8s4.2-2.8 4.2-4.8c0-2.4-2.8-3.1-4.2-1.1z"
        fill={LIPS}
      />
    </g>

    <g className={s.dealArm}>
      <path d="M60 104c-12 20-18 48-14 72 3 4 9 2 11-3 2-18 0-46 8-66z" fill={SKIN} />
      <path d="M32 178h16v3H32z" fill={GOLD} />
      <g className={s.deck}>
        <rect
          x="24"
          y="180"
          width="18"
          height="12"
          rx="2"
          fill={CARD_BACK}
          stroke={CARD_EDGE}
          strokeWidth="1"
        />
        <rect
          x="25.5"
          y="178.5"
          width="18"
          height="12"
          rx="2"
          fill={CARD_BACK}
          stroke={CARD_EDGE}
          strokeWidth="1"
        />
      </g>
      <g className={s.fan}>
        <rect
          x="18"
          y="172"
          width="12"
          height="17"
          rx="2"
          fill={CARD_BACK}
          stroke={CARD_EDGE}
          transform="rotate(-24 24 180)"
        />
        <rect
          x="38"
          y="171"
          width="12"
          height="17"
          rx="2"
          fill={CARD_BACK}
          stroke={CARD_EDGE}
          transform="rotate(22 44 180)"
        />
      </g>
      <ellipse cx="37" cy="190" rx="8" ry="5" fill={SKIN} />
    </g>
  </svg>
);
