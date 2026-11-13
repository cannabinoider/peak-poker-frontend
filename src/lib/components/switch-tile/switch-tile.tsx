import { type ReactNode, useId } from "react";

import { cn } from "@/lib/utils/styles";

type SwitchTileProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Bold title (the app's main switches) or regular weight. Default true. */
  strong?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * A row with a title, an optional dim subtitle and a switch on the right (Flutter
 * `SwitchListTile` with a gold thumb). The whole row toggles the switch.
 */
export const SwitchTile = ({
  checked,
  onChange,
  title,
  subtitle,
  strong = true,
  disabled = false,
  className,
}: SwitchTileProps) => {
  const id = useId();
  return (
    <div
      className={cn(
        "flex items-center gap-4 py-2",
        disabled && "opacity-[0.38]",
        className,
      )}>
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span
          id={`${id}-title`}
          className={cn("block text-base text-text", strong && "font-bold")}>
          {title}
        </span>
        {subtitle !== undefined && (
          <span id={`${id}-sub`} className="block text-sm text-dim">
            {subtitle}
          </span>
        )}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-title`}
        aria-describedby={subtitle !== undefined ? `${id}-sub` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-8 w-[52px] shrink-0 rounded-full border-2 outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-bottom",
          checked ? "border-gold/40 bg-gold/40" : "border-white/40 bg-white/10",
        )}>
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full transition-all",
            checked ? "left-[22px] size-6 bg-gold" : "left-1.5 size-4 bg-white/60",
          )}
        />
      </button>
    </div>
  );
};
