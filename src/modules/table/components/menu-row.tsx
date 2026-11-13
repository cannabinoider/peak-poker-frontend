import type { ReactNode } from "react";

import { cn } from "@/lib/utils/styles";

import { Icon, type IconName } from "./icons";

type MenuRowProps = {
  icon: IconName;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: "default" | "gold" | "danger";
  onClick: () => void;
};

/** A tappable row in a sheet (Flutter `ListTile`). */
export const MenuRow = ({
  icon,
  title,
  subtitle,
  tone = "default",
  onClick,
}: MenuRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-14 w-full items-center gap-4 rounded-xl px-2 py-2 text-left outline-none hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-gold/60">
    <Icon
      name={icon}
      className={cn(
        "shrink-0",
        tone === "gold" ? "text-gold" : tone === "danger" ? "text-red" : "text-dim",
      )}
    />
    <span className="min-w-0 flex-1">
      <span
        className={cn(
          "block text-base",
          tone === "danger" ? "text-red" : "text-white",
        )}>
        {title}
      </span>
      {subtitle && <span className="block text-sm text-dim">{subtitle}</span>}
    </span>
  </button>
);
