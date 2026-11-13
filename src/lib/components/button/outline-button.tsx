import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/styles";

import { Spinner } from "./spinner";

const tones = {
  /** White label, glass border ("Best split", "Go to my seat"). */
  glass: "border-glass text-text",
  /** Red label and border ("End game & settle up"). */
  danger: "border-red text-red",
} as const;

type OutlineButtonProps = ComponentProps<"button"> & {
  tone?: keyof typeof tones;
  /** Leading icon, 18px (Material default). */
  icon?: ReactNode;
  /** Minimum height in px. The app uses 52 (glass) and 50 (danger). */
  height?: number;
  loading?: boolean;
  /** Stretch to the parent's width (`minimumSize: Size.fromHeight`). Default true. */
  fullWidth?: boolean;
};

/**
 * Secondary outlined button (Flutter `OutlinedButton.styleFrom` as used in the app):
 * transparent, 1px border, 16px radius, 14px medium label.
 */
export const OutlineButton = ({
  tone = "glass",
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
}: OutlineButtonProps) => {
  const off = disabled === true || loading;
  return (
    <button
      type={type}
      disabled={off}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-2xl border bg-transparent px-6 text-sm font-medium tracking-[0.1px] transition-colors",
        "outline-none hover:bg-white/[0.08] focus-visible:bg-white/10 active:bg-white/10",
        tones[tone],
        off &&
          "cursor-not-allowed border-white/[0.12] text-white/[0.38] hover:bg-transparent",
        fullWidth && "w-full",
        className,
      )}
      style={{ minHeight: height, ...style }}
      {...props}>
      {loading ? (
        <Spinner className="size-[18px] shrink-0" />
      ) : (
        icon !== undefined && (
          <span
            aria-hidden
            className="inline-flex size-[18px] shrink-0 [&>svg]:size-full">
            {icon}
          </span>
        )
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};

type TextButtonProps = ComponentProps<"button"> & {
  /** "default" = gold (theme primary, e.g. "Keep playing"); "danger" = red ("Close room"). */
  tone?: "default" | "danger";
};

/** Flat text button (Flutter `TextButton`): 44px tall, pill shape, 14px medium label. */
export const TextButton = ({
  tone = "default",
  type = "button",
  className,
  ...props
}: TextButtonProps) => (
  <button
    type={type}
    className={cn(
      "inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-full px-3 text-sm font-medium tracking-[0.1px] transition-colors",
      "outline-none hover:bg-white/[0.08] focus-visible:bg-white/10 active:bg-white/10",
      "disabled:cursor-not-allowed disabled:text-white/[0.38] disabled:hover:bg-transparent",
      tone === "danger" ? "text-red" : "text-gold",
      className,
    )}
    {...props}
  />
);
