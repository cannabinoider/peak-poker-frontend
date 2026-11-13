import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/styles";

import { Icon, type IconName } from "./icons";

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: IconName;
  /** Accessible name and tooltip. */
  label: string;
  size?: number;
};

/** Round 44px icon button for the top bar (Flutter compact `IconButton`). */
export const IconButton = ({
  icon,
  label,
  size = 22,
  type = "button",
  className,
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold/60 active:bg-white/15",
      className,
    )}
    {...props}>
    <Icon name={icon} size={size} />
  </button>
);
