import { type ReactNode, type SVGProps, useId } from "react";

import { cn } from "@/lib/utils/styles";

import type { Animal } from "./animals";

/*
 * Cartoon animal faces, ported 1:1 from the Flutter `AnimalFace` painter
 * (`ui/animal_avatar.dart`). Every shape is in unit coordinates (0..1) of the
 * inner drawing area, exactly like the Flutter painter, which draws inside the
 * 2px border of its circular container.
 */

type Pt = readonly [number, number];

type Shape =
  | { t: "circle"; x: number; y: number; r: number; fill: string; opacity?: number }
  | { t: "oval"; x: number; y: number; w: number; h: number; fill: string; rot: number }
  | { t: "poly"; pts: readonly Pt[]; fill: string }
  | { t: "smile"; y: number; w: number; stroke: string }
  | { t: "line"; from: Pt; to: Pt; stroke: string; width: number }
  | { t: "path"; d: string; stroke: string; width: number }
  /** A named group the winner celebration animates (`[data-part=…]`). */
  | { t: "part"; name: string; shapes: readonly Shape[] };

const INK = "#1F2937";
const PINK = "#F9A8D4";
const WHITE = "#FFFFFF";
/** Flutter's `Colors.white24` (0x3D / 0xFF). */
const WHITE_24 = 0x3d / 0xff;

const BACKGROUNDS: Record<Animal, string> = {
  lion: "#FDE68A",
  monkey: "#FED7AA",
  panda: "#D1FAE5",
  fox: "#FFEDD5",
  rabbit: "#FCE7F3",
  bear: "#E7E5E4",
  cat: "#E0E7FF",
  owl: "#EDE9FE",
  frog: "#DCFCE7",
  koala: "#E0F2FE",
  elephant: "#FFE4E6",
  snake: "#D9F99D",
  pig: "#FEF9C3",
};
const DEFAULT_BACKGROUND = "#E5E7EB";

const circle = (
  x: number,
  y: number,
  r: number,
  fill: string,
  opacity?: number,
): Shape => ({
  t: "circle",
  x,
  y,
  r,
  fill,
  opacity,
});

const oval = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  rot = 0,
): Shape => ({
  t: "oval",
  x,
  y,
  w,
  h,
  fill,
  rot,
});

const poly = (fill: string, ...pts: Pt[]): Shape => ({ t: "poly", pts, fill });

const smile = (y: number, w: number, stroke: string): Shape => ({
  t: "smile",
  y,
  w,
  stroke,
});

const part = (name: string, shapes: readonly Shape[]): Shape => ({
  t: "part",
  name,
  shapes,
});

const eyes = (y: number, { dx = 0.13, r = 0.045, c = INK } = {}): Shape[] => [
  circle(0.5 - dx, y, r, c),
  circle(0.5 + dx, y, r, c),
  circle(0.5 - dx + r * 0.35, y - r * 0.35, r * 0.35, WHITE),
  circle(0.5 + dx + r * 0.35, y - r * 0.35, r * 0.35, WHITE),
];

const catWhiskers = (): Shape[] =>
  [-0.03, 0.02].flatMap((dy): Shape[] => [
    {
      t: "line",
      from: [0.3, 0.7 + dy],
      to: [0.12, 0.68 + dy * 2],
      stroke: "#6B7280",
      width: 0.012,
    },
    {
      t: "line",
      from: [0.7, 0.7 + dy],
      to: [0.88, 0.68 + dy * 2],
      stroke: "#6B7280",
      width: 0.012,
    },
  ]);

const MONKEY = "#92400E";
const MONKEY_SKIN = "#FCD9B6";

const SNAKE = "#18181B";
const SNAKE_PATTERN = "#3F3F46";

/** Yellow eye with a slit pupil. */
const snakeEye = (x: number): Shape[] => [
  circle(x, 0.45, 0.085, "#FDE047"),
  oval(x, 0.45, 0.03, 0.12, INK),
  circle(x + 0.03, 0.42, 0.018, WHITE),
];

const FACES: Record<Animal, readonly Shape[]> = {
  lion: [
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return circle(0.5 + Math.cos(a) * 0.3, 0.56 + Math.sin(a) * 0.3, 0.12, "#B45309");
    }),
    circle(0.5, 0.56, 0.3, "#D97706"),
    circle(0.3, 0.33, 0.07, "#F59E0B"),
    circle(0.7, 0.33, 0.07, "#F59E0B"),
    circle(0.5, 0.58, 0.24, "#FBBF24"),
    ...eyes(0.52),
    oval(0.5, 0.7, 0.2, 0.13, "#FEF3C7"),
    poly(INK, [0.45, 0.64], [0.55, 0.64], [0.5, 0.69]),
  ],
  monkey: [
    circle(0.16, 0.52, 0.12, MONKEY),
    circle(0.84, 0.52, 0.12, MONKEY),
    circle(0.16, 0.52, 0.065, MONKEY_SKIN),
    circle(0.84, 0.52, 0.065, MONKEY_SKIN),
    circle(0.5, 0.54, 0.33, MONKEY),
    circle(0.4, 0.5, 0.13, MONKEY_SKIN),
    circle(0.6, 0.5, 0.13, MONKEY_SKIN),
    oval(0.5, 0.7, 0.42, 0.28, MONKEY_SKIN),
    ...eyes(0.5, { dx: 0.1, r: 0.042 }),
    circle(0.47, 0.64, 0.016, "#78350F"),
    circle(0.53, 0.64, 0.016, "#78350F"),
    smile(0.68, 0.2, "#78350F"),
  ],
  panda: [
    circle(0.26, 0.3, 0.11, INK),
    circle(0.74, 0.3, 0.11, INK),
    circle(0.5, 0.58, 0.34, WHITE),
    oval(0.36, 0.53, 0.14, 0.18, INK, -0.5),
    oval(0.64, 0.53, 0.14, 0.18, INK, 0.5),
    circle(0.37, 0.52, 0.035, WHITE),
    circle(0.63, 0.52, 0.035, WHITE),
    oval(0.5, 0.68, 0.1, 0.07, INK),
    smile(0.72, 0.12, INK),
  ],
  fox: [
    poly("#EA580C", [0.16, 0.12], [0.42, 0.32], [0.2, 0.48]),
    poly("#EA580C", [0.84, 0.12], [0.58, 0.32], [0.8, 0.48]),
    poly(INK, [0.22, 0.2], [0.36, 0.33], [0.24, 0.42]),
    poly(INK, [0.78, 0.2], [0.64, 0.33], [0.76, 0.42]),
    poly("#F97316", [0.14, 0.42], [0.86, 0.42], [0.5, 0.9]),
    poly(WHITE, [0.2, 0.55], [0.5, 0.6], [0.5, 0.9]),
    poly(WHITE, [0.8, 0.55], [0.5, 0.6], [0.5, 0.9]),
    ...eyes(0.52, { dx: 0.14 }),
    circle(0.5, 0.82, 0.045, INK),
  ],
  rabbit: [
    oval(0.37, 0.2, 0.14, 0.42, "#F3F4F6", -0.15),
    oval(0.63, 0.2, 0.14, 0.42, "#F3F4F6", 0.15),
    oval(0.37, 0.22, 0.07, 0.3, PINK, -0.15),
    oval(0.63, 0.22, 0.07, 0.3, PINK, 0.15),
    circle(0.5, 0.64, 0.28, "#F9FAFB"),
    ...eyes(0.6, { dx: 0.11 }),
    oval(0.5, 0.72, 0.07, 0.05, "#EC4899"),
    circle(0.33, 0.72, 0.045, PINK, 0.7),
    circle(0.67, 0.72, 0.045, PINK, 0.7),
  ],
  bear: [
    circle(0.26, 0.3, 0.11, "#92400E"),
    circle(0.74, 0.3, 0.11, "#92400E"),
    circle(0.26, 0.3, 0.055, "#D6A77A"),
    circle(0.74, 0.3, 0.055, "#D6A77A"),
    circle(0.5, 0.58, 0.33, "#A16207"),
    oval(0.5, 0.7, 0.28, 0.2, "#E7C9A0"),
    ...eyes(0.52),
    oval(0.5, 0.65, 0.1, 0.07, INK),
    smile(0.71, 0.1, INK),
  ],
  cat: [
    poly("#9CA3AF", [0.18, 0.16], [0.44, 0.34], [0.2, 0.5]),
    poly("#9CA3AF", [0.82, 0.16], [0.56, 0.34], [0.8, 0.5]),
    poly(PINK, [0.23, 0.25], [0.37, 0.36], [0.24, 0.44]),
    poly(PINK, [0.77, 0.25], [0.63, 0.36], [0.76, 0.44]),
    circle(0.5, 0.6, 0.32, "#D1D5DB"),
    ...eyes(0.55, { r: 0.05 }),
    poly("#EC4899", [0.46, 0.66], [0.54, 0.66], [0.5, 0.7]),
    ...catWhiskers(),
  ],
  owl: [
    poly("#7C3AED", [0.2, 0.15], [0.38, 0.3], [0.22, 0.38]),
    poly("#7C3AED", [0.8, 0.15], [0.62, 0.3], [0.78, 0.38]),
    circle(0.5, 0.6, 0.36, "#8B5CF6"),
    oval(0.5, 0.78, 0.4, 0.3, "#C4B5FD"),
    circle(0.36, 0.5, 0.13, WHITE),
    circle(0.64, 0.5, 0.13, WHITE),
    circle(0.36, 0.5, 0.06, INK),
    circle(0.64, 0.5, 0.06, INK),
    circle(0.38, 0.48, 0.02, WHITE),
    circle(0.66, 0.48, 0.02, WHITE),
    poly("#F59E0B", [0.45, 0.6], [0.55, 0.6], [0.5, 0.7]),
  ],
  frog: [
    circle(0.32, 0.36, 0.13, "#22C55E"),
    circle(0.68, 0.36, 0.13, "#22C55E"),
    oval(0.5, 0.64, 0.8, 0.56, "#4ADE80"),
    circle(0.32, 0.35, 0.08, WHITE),
    circle(0.68, 0.35, 0.08, WHITE),
    circle(0.33, 0.36, 0.045, INK),
    circle(0.67, 0.36, 0.045, INK),
    smile(0.66, 0.36, "#166534"),
    circle(0.26, 0.66, 0.04, PINK, 0.8),
    circle(0.74, 0.66, 0.04, PINK, 0.8),
  ],
  koala: [
    circle(0.2, 0.38, 0.16, "#9CA3AF"),
    circle(0.8, 0.38, 0.16, "#9CA3AF"),
    circle(0.2, 0.38, 0.09, "#F3F4F6"),
    circle(0.8, 0.38, 0.09, "#F3F4F6"),
    circle(0.5, 0.6, 0.3, "#A8A29E"),
    ...eyes(0.53, { dx: 0.14, r: 0.04 }),
    oval(0.5, 0.66, 0.14, 0.2, "#292524"),
  ],
  elephant: [
    oval(0.17, 0.5, 0.34, 0.52, "#94A3B8", -0.2),
    oval(0.83, 0.5, 0.34, 0.52, "#94A3B8", 0.2),
    oval(0.19, 0.5, 0.2, 0.36, PINK, -0.2),
    oval(0.81, 0.5, 0.2, 0.36, PINK, 0.2),
    circle(0.5, 0.5, 0.29, "#AAB4C3"),
    ...eyes(0.45, { dx: 0.12, r: 0.04 }),
    circle(0.31, 0.6, 0.045, PINK, 0.7),
    circle(0.69, 0.6, 0.045, PINK, 0.7),
    poly(WHITE, [0.39, 0.64], [0.44, 0.66], [0.36, 0.77]),
    poly(WHITE, [0.61, 0.64], [0.56, 0.66], [0.64, 0.77]),
    part("trunk", [
      {
        t: "path",
        d: "M0.5 0.56C0.5 0.74 0.47 0.84 0.57 0.89",
        stroke: "#8391A7",
        width: 0.15,
      },
      {
        t: "path",
        d: "M0.5 0.56C0.5 0.74 0.47 0.84 0.57 0.89",
        stroke: "#AAB4C3",
        width: 0.12,
      },
      {
        t: "path",
        d: "M0.46 0.7L0.54 0.7M0.46 0.77L0.54 0.77",
        stroke: "#94A3B8",
        width: 0.012,
      },
    ]),
  ],
  snake: [
    oval(0.5, 0.9, 0.36, 0.4, SNAKE),
    oval(0.5, 0.86, 0.18, 0.3, "#52525B"),
    oval(0.5, 0.5, 0.7, 0.54, SNAKE),
    circle(0.5, 0.3, 0.05, SNAKE_PATTERN),
    circle(0.37, 0.33, 0.035, SNAKE_PATTERN),
    circle(0.63, 0.33, 0.035, SNAKE_PATTERN),
    oval(0.5, 0.63, 0.42, 0.22, "#3F3F46"),
    ...snakeEye(0.36),
    ...snakeEye(0.64),
    circle(0.46, 0.59, 0.013, "#09090B"),
    circle(0.54, 0.59, 0.013, "#09090B"),
    smile(0.63, 0.26, "#A1A1AA"),
    circle(0.25, 0.6, 0.04, PINK, 0.7),
    circle(0.75, 0.6, 0.04, PINK, 0.7),
  ],
  pig: [
    poly("#EC4899", [0.16, 0.14], [0.4, 0.3], [0.2, 0.44]),
    poly("#EC4899", [0.84, 0.14], [0.6, 0.3], [0.8, 0.44]),
    circle(0.5, 0.58, 0.34, "#F9A8D4"),
    ...eyes(0.48, { dx: 0.14 }),
    oval(0.5, 0.65, 0.3, 0.2, "#F472B6"),
    oval(0.45, 0.65, 0.05, 0.08, "#9D174D"),
    oval(0.55, 0.65, 0.05, 0.08, "#9D174D"),
    smile(0.74, 0.14, "#9D174D"),
    circle(0.25, 0.64, 0.05, "#F472B6", 0.8),
    circle(0.75, 0.64, 0.05, "#F472B6", 0.8),
  ],
};

/** An open roaring mouth, under the nose at `y`. */
const roarMouth = (y: number): Shape =>
  part("roar", [
    oval(0.5, y, 0.17, 0.14, "#7F1D1D"),
    oval(0.5, y + 0.035, 0.1, 0.05, "#F87171"),
  ]);

/** Extra parts drawn only in the winner celebration (hidden until animated). */
const LIVELY_PARTS: Partial<Record<Animal, readonly Shape[]>> = {
  lion: [roarMouth(0.77)],
  bear: [roarMouth(0.79)],
  monkey: [
    part("arm", [
      {
        t: "path",
        d: "M0.9 1.05C1 0.6 0.85 0.2 0.66 0.16",
        stroke: MONKEY,
        width: 0.11,
      },
      circle(0.64, 0.17, 0.07, MONKEY_SKIN),
      ...[0.56, 0.62, 0.68].map((x) => circle(x, 0.11, 0.028, MONKEY_SKIN)),
    ]),
  ],
  pig: [
    part("roar", [
      oval(0.5, 0.82, 0.14, 0.1, "#831843"),
      oval(0.5, 0.84, 0.08, 0.04, "#FB7185"),
    ]),
  ],
  frog: [
    part("tongue", [
      { t: "path", d: "M0.5 0.72L0.5 0.93", stroke: "#F472B6", width: 0.05 },
      circle(0.5, 0.94, 0.045, "#F472B6"),
    ]),
  ],
  snake: [
    part("tongue", [
      {
        t: "path",
        d: "M0.5 0.7L0.5 0.86L0.45 0.93M0.5 0.86L0.55 0.93",
        stroke: "#EF4444",
        width: 0.03,
      },
    ]),
  ],
};

/** Shown for an animal the frontend doesn't know yet. */
const DEFAULT_FACE: readonly Shape[] = [
  circle(0.5, 0.55, 0.3, "#9CA3AF"),
  ...eyes(0.52),
];

const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

/**
 * Flutter's `drawArc(rect, 0.2, pi - 0.4)` on an ellipse `w` wide and `0.6w`
 * tall: a smile from the lower right round to the lower left.
 */
const smilePath = (y: number, w: number) => {
  const rx = w / 2;
  const ry = (w * 0.6) / 2;
  const start = 0.2;
  const end = Math.PI - 0.2;
  const x0 = r4(0.5 + rx * Math.cos(start));
  const y0 = r4(y + ry * Math.sin(start));
  const x1 = r4(0.5 + rx * Math.cos(end));
  const y1 = r4(y + ry * Math.sin(end));
  return `M${x0} ${y0}A${rx} ${ry} 0 0 1 ${x1} ${y1}`;
};

const renderShape = (s: Shape, key: number): ReactNode => {
  switch (s.t) {
    case "circle":
      return (
        <circle
          key={key}
          cx={r4(s.x)}
          cy={r4(s.y)}
          r={r4(s.r)}
          fill={s.fill}
          fillOpacity={s.opacity}
        />
      );
    case "oval":
      return (
        <ellipse
          key={key}
          cx={s.x}
          cy={s.y}
          rx={s.w / 2}
          ry={s.h / 2}
          fill={s.fill}
          transform={
            s.rot ? `rotate(${r4((s.rot * 180) / Math.PI)} ${s.x} ${s.y})` : undefined
          }
        />
      );
    case "poly":
      return (
        <polygon
          key={key}
          points={s.pts.map((p) => p.join(",")).join(" ")}
          fill={s.fill}
        />
      );
    case "smile":
      return (
        <path
          key={key}
          d={smilePath(s.y, s.w)}
          fill="none"
          stroke={s.stroke}
          strokeWidth={0.025}
          strokeLinecap="round"
        />
      );
    case "line":
      return (
        <line
          key={key}
          x1={s.from[0]}
          y1={r4(s.from[1])}
          x2={s.to[0]}
          y2={r4(s.to[1])}
          stroke={s.stroke}
          strokeWidth={s.width}
        />
      );
    case "path":
      return (
        <path
          key={key}
          d={s.d}
          fill="none"
          stroke={s.stroke}
          strokeWidth={s.width}
          strokeLinecap="round"
        />
      );
    case "part":
      return (
        <g key={key} data-part={s.name}>
          {s.shapes.map(renderShape)}
        </g>
      );
  }
};

export type AnimalFaceProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  animal: Animal;
  /** Diameter in px (Flutter default: 48). */
  size?: number;
  /** Also draw the parts only the winner celebration animates (roar, tongue). */
  lively?: boolean;
};

/**
 * A round cartoon animal face: pastel background, white/24% 2px border, and
 * the animal drawn inside the border. Decorative unless given an `aria-label`.
 */
export const AnimalFace = ({
  animal,
  size = 48,
  lively = false,
  className,
  ...rest
}: AnimalFaceProps) => {
  const shapes = [
    ...(FACES[animal] ?? DEFAULT_FACE),
    ...(lively ? (LIVELY_PARTS[animal] ?? []) : []),
  ];
  // A unique clip id per face (useId also works in server components).
  const clipId = `animal-clip-${useId().replace(/:/g, "")}`;
  const labelled = rest["aria-label"] !== undefined;
  const inner = size - 4;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("shrink-0 select-none", className)}
      {...rest}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={0.5} cy={0.5} r={0.5} />
        </clipPath>
      </defs>
      <g aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={BACKGROUNDS[animal] ?? DEFAULT_BACKGROUND}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          fill="none"
          stroke={WHITE}
          strokeOpacity={WHITE_24}
          strokeWidth={2}
        />
        <g transform={`translate(2 2) scale(${inner})`} clipPath={`url(#${clipId})`}>
          {shapes.map(renderShape)}
        </g>
      </g>
    </svg>
  );
};
