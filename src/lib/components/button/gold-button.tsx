import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/styles";

import { Spinner } from "./spinner";

type GoldButtonProps = ComponentProps<"button"> & {
  /** Leading icon, drawn at 20px in the label color. */
  icon?: ReactNode;
  /** Height in px. Flutter default: 52. */
  height?: number;
  /** Shows a spinner in place of the icon and disables the button. */
  loading?: boolean;
  /** Stretch to the parent's width (the Flutter button always does). Default true. */
  fullWidth?: boolean;
};

/**
 * Primary gold gradient button (Flutter `GoldButton`): 16px radius, gold → gold-deep
 * left to right, soft gold glow, black 87% 16px extra-bold label. Disabled = 45% opacity,
 * no glow.
 */
export const GoldButton = ({
  icon,
  height = 52,
  loading = false,
  fullWidth = true,
  disabled,
  type = "button",
  className,
  style,
  children,
  ...props
}: GoldButtonProps) => {
  const off = disabled === true || loading;
  return (
    <button
      type={type}
      disabled={off}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex select-none items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-gold-deep px-4 text-base font-extrabold text-black/[0.87] transition-[filter,opacity]",
        "tabular outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-bottom",
        off
          ? "cursor-not-allowed opacity-45"
          : "shadow-[0_6px_16px_rgb(var(--gold)/0.35)] hover:brightness-105 active:brightness-90",
        fullWidth && "w-full",
        className,
      )}
      style={{ height, ...style }}
      {...props}>
      {loading ? (
        <Spinner className="size-5 shrink-0" />
      ) : (
        icon !== undefined && (
          <span aria-hidden className="inline-flex size-5 shrink-0 [&>svg]:size-full">
            {icon}
          </span>
        )
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};
