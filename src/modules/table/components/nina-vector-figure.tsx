import type { CSSProperties } from "react";

import s from "./dealer-figure.module.css";

type NinaVectorFigureProps = {
  className: string;
  style: CSSProperties;
  label: string;
};

/** Front-facing Nina, drawn and rigged as separate illustrated SVG parts. */
export const NinaVectorFigure = ({
  className,
  style,
  label,
}: NinaVectorFigureProps) => (
  <svg
    viewBox="0 0 160 200"
    className={`${className} ${s.nina}`}
    style={style}
    role="img"
    aria-label={label}>
    <defs>
      <linearGradient id="n-hair" x1="0" x2="1">
        <stop offset="0" stopColor="#08080B" />
        <stop offset=".48" stopColor="#352A39" />
        <stop offset="1" stopColor="#050507" />
      </linearGradient>
      <linearGradient id="n-red" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F43F5E" />
        <stop offset=".52" stopColor="#BE123C" />
        <stop offset="1" stopColor="#7F1D2D" />
      </linearGradient>
      <linearGradient id="n-white" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF7F4" />
        <stop offset="1" stopColor="#E8D7DB" />
      </linearGradient>
      <linearGradient id="n-skin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFD8C0" />
        <stop offset="1" stopColor="#E9A98B" />
      </linearGradient>
    </defs>

    {/* Long black hair: one continuous piece attached to the crown. */}
    <g className={s.ninaHair}>
      <path
        d="M45 64C39 28 56 8 80 8s41 20 35 56c8 38 6 91-6 132H92c8-41 8-77 3-107H65c-5 30-5 66 3 107H51C39 155 37 102 45 64z"
        fill="url(#n-hair)"
      />
      <path
        d="M50 63c-7 40-4 89 7 121M110 63c7 40 4 89-7 121"
        stroke="#65506A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".7"
      />
    </g>

    {/* Fitted red-and-white outfit, drawn as a shaped torso rather than a block. */}
    <g className={s.body}>
      <path d="M70 91h20v23c-5 7-15 7-20 0z" fill="url(#n-skin)" />
      <path
        d="M25 200c1-46 16-76 45-86 6 8 14 8 20 0 29 10 44 40 45 86z"
        fill="url(#n-red)"
      />
      <path
        d="M28 153c5-22 17-34 38-38l-8 28-23 19zM132 153c-5-22-17-34-38-38l8 28 23 19z"
        fill="url(#n-white)"
      />
      <path
        d="M29 151c7-18 18-29 34-34M131 151c-7-18-18-29-34-34"
        stroke="#F5C451"
        strokeWidth="1.5"
        fill="none"
      />

      <g className={s.bust}>
        <path d="M55 121c6 16 14 24 25 24s19-8 25-24l8 79H47z" fill="url(#n-red)" />
        <path
          d="M66 112c4 7 9 12 14 15 5-3 10-8 14-15-1 19-5 29-14 34-9-5-13-15-14-34z"
          fill="url(#n-skin)"
        />
        <path
          d="M56 120c5-9 16-12 24-2 0 16-8 25-19 27-7-7-9-16-5-25z"
          fill="url(#n-white)"
        />
        <path
          d="M104 120c-5-9-16-12-24-2 0 16 8 25 19 27 7-7 9-16 5-25z"
          fill="url(#n-white)"
        />
        <path
          d="M57 121c6 13 13 19 23 19s17-6 23-19M80 119v20"
          stroke="#F5C451"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M80 117v82M62 153c7 4 12 6 18 6s11-2 18-6"
          stroke="#831843"
          strokeWidth="1.4"
          fill="none"
          opacity=".75"
        />
      </g>
      <path d="M68 111c4 8 20 8 24 0" stroke="#F5C451" strokeWidth="1.5" fill="none" />
      <circle cx="80" cy="121" r="2.2" fill="#F5C451" />
    </g>

    {/* Right arm rests normally, but is replaced by the central shuffle hands. */}
    <g className={s.restArm}>
      <path
        d="M112 136c13 12 18 32 13 50-4 7-13 4-15-2-2-18-1-33 3-46z"
        fill="url(#n-red)"
      />
      <path d="M110 179h17v4h-17z" fill="#F5C451" />
      <ellipse cx="120" cy="190" rx="9" ry="6" fill="url(#n-skin)" />
    </g>

    {/* Anime face, bangs, eyes and lips are independent animated parts. */}
    <g className={s.head}>
      <ellipse cx="80" cy="66" rx="26" ry="31" fill="url(#n-skin)" />
      <ellipse cx="54" cy="69" rx="4" ry="6" fill="#E9A98B" />
      <ellipse cx="106" cy="69" rx="4" ry="6" fill="#E9A98B" />
      <circle cx="53" cy="82" r="2.2" fill="#F5C451" />
      <circle cx="107" cy="82" r="2.2" fill="#F5C451" />
      <path
        d="M53 58c-2-29 13-43 29-43 20 0 31 15 27 42-7-12-15-20-24-23 2 11-5 21-15 27 3-11 1-18-3-23-4 8-8 14-14 20z"
        fill="url(#n-hair)"
      />
      <path
        d="M63 29c8-6 21-7 29-2"
        stroke="#65506A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="65" cy="79" rx="6" ry="3" fill="#FB7185" opacity=".38" />
      <ellipse cx="95" cy="79" rx="6" ry="3" fill="#FB7185" opacity=".38" />
      <path
        d="M61 55c5-4 11-4 15 0M84 55c4-4 10-4 15 0"
        stroke="#211A20"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <g className={s.eyes}>
        <g className={s.pupils}>
          <path
            d="M61 64c5-5 12-5 17 0-5 7-12 7-17 0zM82 64c5-5 12-5 17 0-5 7-12 7-17 0z"
            fill="#FFF"
          />
          <ellipse cx="70" cy="65" rx="4" ry="5" fill="#6B3D2E" />
          <ellipse cx="90" cy="65" rx="4" ry="5" fill="#6B3D2E" />
          <circle cx="70" cy="66" r="2.2" fill="#171216" />
          <circle cx="90" cy="66" r="2.2" fill="#171216" />
          <circle cx="71.4" cy="63.5" r="1.1" fill="#FFF" />
          <circle cx="91.4" cy="63.5" r="1.1" fill="#FFF" />
        </g>
        <path
          d="M60 60c5-5 13-5 18 0M82 60c5-5 13-5 18 0"
          stroke="#211A20"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M78 73c1.4 1.8 2.6 1.8 4 0"
        stroke="#D98E78"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <g className={s.smile}>
        <path d="M71 84c3-3 6-4 9-2 3-2 6-1 9 2-2 2-5 3-9 3s-7-1-9-3z" fill="#E11D48" />
        <path
          d="M73 87c3 4 11 4 14 0"
          stroke="#BE123C"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <ellipse
        className={s.kissMouth}
        cx="80"
        cy="85"
        rx="2.5"
        ry="1.8"
        fill="#E11D48"
      />
      <path
        className={s.kiss}
        d="M80 81c-1.5-2.2-4.6-1.4-4.6 1.2 0 2.2 4.6 5.2 4.6 5.2s4.6-3 4.6-5.2c0-2.6-3.1-3.4-4.6-1.2z"
        fill="#FB7185"
      />
    </g>

    {/* Left dealing arm and purple deck. */}
    <g className={s.dealArm}>
      <path
        d="M48 136c-13 12-18 32-13 50 4 7 13 4 15-2 2-18 1-33-3-46z"
        fill="url(#n-red)"
      />
      <path d="M33 179h17v4H33z" fill="#F5C451" />
      <ellipse cx="40" cy="190" rx="9" ry="6" fill="url(#n-skin)" />
      <g className={s.deck}>
        <rect
          x="23"
          y="178"
          width="20"
          height="14"
          rx="2"
          fill="#4338CA"
          stroke="#C4B5FD"
        />
        <rect
          x="25"
          y="176"
          width="20"
          height="14"
          rx="2"
          fill="#4F46E5"
          stroke="#C4B5FD"
        />
      </g>
      <g className={s.fan}>
        <rect
          x="18"
          y="171"
          width="13"
          height="18"
          rx="2"
          fill="#4338CA"
          stroke="#C4B5FD"
          transform="rotate(-25 25 180)"
        />
        <rect
          x="41"
          y="170"
          width="13"
          height="18"
          rx="2"
          fill="#4338CA"
          stroke="#C4B5FD"
          transform="rotate(22 47 180)"
        />
      </g>
    </g>

    {/* Both hands meet and independently riffle the cards while shuffling. */}
    <g className={s.shuffleHands}>
      <path d="M57 157c5-7 13-4 20 5l-7 12c-8-2-15-9-13-17z" fill="url(#n-skin)" />
      <path d="M103 157c-5-7-13-4-20 5l7 12c8-2 15-9 13-17z" fill="url(#n-skin)" />
      <g className={s.shuffleDeck}>
        <rect
          x="67"
          y="151"
          width="18"
          height="25"
          rx="2"
          fill="#4338CA"
          stroke="#C4B5FD"
        />
        <rect
          x="75"
          y="149"
          width="18"
          height="25"
          rx="2"
          fill="#4F46E5"
          stroke="#C4B5FD"
        />
        <path d="M70 155l12 16M79 153l11 15" stroke="#A5B4FC" strokeWidth="1" />
      </g>
    </g>
  </svg>
);
