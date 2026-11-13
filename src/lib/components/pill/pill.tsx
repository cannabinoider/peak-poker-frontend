import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/styles";

/** Color presets matching the `Pill(color:, textColor:)` combinations used in the app. */
const tones = {
  /** Default: 20% black fill, white text. */
  default: "bg-black/20 text-text",
  /** Same fill as Glass (setup chip counts). */
  glass: "bg-glass text-text",
  /** Current game label: gold 15% fill, gold text. */
  gold: "bg-gold/15 text-gold",
  /** Best hand label: green 15% fill, green text. */
  green: "bg-green/15 text-green",
  /** Orbit info: #22C55E at 20%. */
  orbit: "bg-[#22C55E]/20 text-text",
  /** Paused: #3B82F6 at 33%. */
  blue: "bg-[#3B82F6]/[0.33] text-text",
  /** Last hand: #EF4444 at 33%. */
  red: "bg-[#EF4444]/[0.33] text-text",
  /** Reconnecting: #F59E0B at 33%. */
  amber: "bg-[#F59E0B]/[0.33] text-text",
} as const;

export type PillTone = keyof typeof tones;

type PillProps = Omit<ComponentProps<"span">, "color"> & {
  children: ReactNode;
  /** Leading icon (rendered at fontSize + 2 px, in the text color via `currentColor`). */
  icon?: ReactNode;
  tone?: PillTone;
  /** Raw fill color (overrides the tone's fill), e.g. "rgb(255 255 255 / 0.08)". */
  color?: string;
  /** Raw text/icon color (overrides the tone's text color). */
  textColor?: string;
  /** Text size in px. Flutter default: 12. */
  fontSize?: number;
};

/** Small rounded label (Flutter `Pill`), single line with ellipsis. */
export const Pill = ({
  children,
  icon,
  tone = "default",
  color,
  textColor,
  fontSize = 12,
  className,
  style,
  ...props
}: PillProps) => (
  <span
    className={cn(
      "inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-glass px-2.5 py-1",
      tones[tone],
      className,
    )}
    style={{ backgroundColor: color, color: textColor, ...style }}
    {...props}>
    {icon !== undefined && (
      <span
        aria-hidden
        className="inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        style={{ width: fontSize + 2, height: fontSize + 2 }}>
        {icon}
      </span>
    )}
    <span
      className="tabular min-w-0 truncate font-semibold leading-[1.2]"
      style={{ fontSize }}>
      {children}
    </span>
  </span>
);
