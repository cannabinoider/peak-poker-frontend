import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/styles";

const tones = {
  red: {
    outlined: "border-red/70 text-red hover:bg-red/[0.06]",
    tinted: "border-red/25 bg-red/[0.12] text-red hover:bg-red/[0.18]",
  },
  white: {
    outlined: "border-white/70 text-white hover:bg-white/[0.06]",
    tinted: "border-white/25 bg-white/[0.12] text-white hover:bg-white/[0.18]",
  },
  gold: {
    outlined: "border-gold/70 text-gold hover:bg-gold/[0.06]",
    tinted: "border-gold/25 bg-gold/[0.12] text-gold hover:bg-gold/[0.18]",
  },
} as const;

type ActionButtonProps = ComponentProps<"button"> & {
  tone: keyof typeof tones;
  /** Outlined (70% border) vs tinted (12% fill, 25% border). */
  outlined?: boolean;
};

/** Fold / Check / Match / All-in buttons (Flutter `_ActionButton`), 52px tall. */
export const ActionButton = ({
  tone,
  outlined = false,
  type = "button",
  className,
  children,
  ...props
}: ActionButtonProps) => (
  <button
    type={type}
    className={cn(
      "tabular flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-2xl border px-2 text-base font-extrabold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60 active:brightness-90",
      tones[tone][outlined ? "outlined" : "tinted"],
      className,
    )}
    {...props}>
    <span className="truncate">{children}</span>
  </button>
);
