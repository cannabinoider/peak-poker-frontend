import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/styles";

type ChoiceChipProps = Omit<ComponentProps<"button">, "role"> & {
  selected: boolean;
  /**
   * "radio": one of a group (wrap in `ChipGroup`), announced with `aria-checked`.
   * "toggle": independent on/off (Flutter `FilterChip`), announced with `aria-pressed`.
   * "action": a plain button (Flutter `ActionChip`); `selected` is ignored.
   */
  kind?: "radio" | "toggle" | "action";
  /** Leading icon (18px) shown when not selected; selected chips show a check. */
  icon?: ReactNode;
  /** Shows a small remove button after the chip (Flutter `onDeleted`). */
  onDelete?: () => void;
  /** Accessible name for the remove button. Default "Remove". */
  deleteLabel?: string;
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 7l10 10M17 7L7 17" strokeLinecap="round" />
  </svg>
);

/**
 * Material chip as used on the setup screens (Flutter `ChoiceChip`, `FilterChip`,
 * `ActionChip`): 32px tall, 8px radius, 1px glass border; selected = gold tint with
 * a check.
 */
export const ChoiceChip = ({
  selected,
  kind = "radio",
  icon,
  onDelete,
  deleteLabel = "Remove",
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ChoiceChipProps) => {
  const on = kind !== "action" && selected;
  const lead = on ? <CheckIcon /> : icon;
  const a11y =
    kind === "radio"
      ? { role: "radio" as const, "aria-checked": on }
      : kind === "toggle"
        ? { "aria-pressed": on }
        : {};
  return (
    <span
      className={cn(
        "inline-flex h-8 max-w-full items-stretch overflow-hidden rounded-lg border text-sm font-medium transition-colors",
        on
          ? "border-gold/60 bg-gold/15 text-gold"
          : "border-glass bg-transparent text-text",
        disabled && "opacity-[0.38]",
        className,
      )}>
      <button
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 px-3 outline-none",
          "hover:bg-white/[0.06] focus-visible:bg-white/10 disabled:cursor-not-allowed disabled:hover:bg-transparent",
          lead !== undefined && "pl-2",
          onDelete !== undefined && "pr-1.5",
        )}
        {...a11y}
        {...props}>
        {lead !== undefined && (
          <span
            aria-hidden
            className="inline-flex size-[18px] shrink-0 [&>svg]:size-full">
            {lead}
          </span>
        )}
        <span className="tabular truncate">{children}</span>
      </button>
      {onDelete !== undefined && (
        <button
          type="button"
          aria-label={deleteLabel}
          onClick={onDelete}
          disabled={disabled}
          className="inline-flex w-7 shrink-0 items-center justify-center text-dim outline-none hover:bg-white/[0.08] hover:text-text focus-visible:bg-white/10">
          <span aria-hidden className="inline-flex size-4 [&>svg]:size-full">
            <CloseIcon />
          </span>
        </button>
      )}
    </span>
  );
};

type ChipGroupProps = ComponentProps<"div"> & {
  /** "radiogroup" for single choice (default), "group" for toggles. */
  role?: "radiogroup" | "group";
};

/** Wrapping row of chips, 8px apart (Flutter `Wrap(spacing: 8, runSpacing: 8)`). */
export const ChipGroup = ({
  role = "radiogroup",
  className,
  ...props
}: ChipGroupProps) => (
  <div role={role} className={cn("flex flex-wrap gap-2", className)} {...props} />
);
