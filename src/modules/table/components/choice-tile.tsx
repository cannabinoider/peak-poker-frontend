import type { ReactNode } from "react";

import { cn } from "@/lib/utils/styles";

import { Icon } from "./icons";

type ChoiceTileProps = {
  selected: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Centred, single line (twists, betting). */
  compact?: boolean;
  /** "radio" for one-of-a-group, "toggle" for on/off. */
  kind?: "radio" | "toggle";
  onClick: () => void;
};

/** A selectable tile in the dealer's-choice panel (Flutter `_Tile`). */
export const ChoiceTile = ({
  selected,
  title,
  subtitle,
  icon,
  compact = false,
  kind = "radio",
  onClick,
}: ChoiceTileProps) => (
  <button
    type="button"
    onClick={onClick}
    role={kind === "radio" ? "radio" : undefined}
    aria-checked={kind === "radio" ? selected : undefined}
    aria-pressed={kind === "toggle" ? selected : undefined}
    className={cn(
      "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-[14px] px-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gold/60",
      compact ? "justify-center py-2.5" : "py-2",
      selected
        ? "border-[1.5px] border-gold bg-gold/[0.16]"
        : "border border-glass bg-white/5 hover:bg-white/[0.08]",
    )}>
    {icon && (
      <span
        aria-hidden
        className={cn(
          "inline-flex size-[18px] shrink-0",
          selected ? "text-gold" : "text-dim",
        )}>
        {icon}
      </span>
    )}
    <span className={cn("flex min-w-0 flex-col", compact ? "items-center" : "flex-1")}>
      <span
        className={cn(
          "truncate text-[13px] font-bold",
          selected ? "text-gold" : "text-white",
        )}>
        {title}
      </span>
      {subtitle && (
        <span className="line-clamp-2 text-[11px] text-dim">{subtitle}</span>
      )}
    </span>
    {!compact && selected && (
      <Icon name="checkCircle" size={16} className="shrink-0 text-gold" />
    )}
  </button>
);
