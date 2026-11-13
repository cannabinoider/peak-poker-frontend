import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/styles";

type SectionTitleProps = ComponentProps<"h2"> & {
  /** Heading level to render; looks the same either way. */
  as?: "h2" | "h3" | "h4" | "p" | "div";
};

/** Section header (Flutter `SectionTitle`): faint, 12px bold, uppercase, 1.4px tracking. */
export const SectionTitle = ({
  as: Tag = "h2",
  className,
  ...props
}: SectionTitleProps) => (
  <Tag
    className={cn(
      "pb-2.5 text-xs font-bold uppercase leading-[1.2] tracking-[1.4px] text-faint",
      className,
    )}
    {...props}
  />
);
