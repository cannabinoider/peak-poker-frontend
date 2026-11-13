import { cn } from "@/lib/utils/styles";

type SegmentedControlProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  "aria-label": string;
  className?: string;
};

/**
 * Single-choice segmented button (Flutter `SegmentedButton` without the check):
 * 44px pill, 1px glass outline, selected segment tinted gold.
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className={cn(
      "flex h-11 overflow-hidden rounded-full border border-white/40",
      className,
    )}>
    {options.map((o, i) => {
      const on = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-w-0 flex-1 truncate px-2 text-sm font-medium outline-none transition-colors",
            "hover:bg-white/[0.06] focus-visible:bg-white/10",
            i > 0 && "border-l border-white/40",
            on ? "bg-gold/15 text-gold" : "text-text",
          )}>
          {o.label}
        </button>
      );
    })}
  </div>
);
