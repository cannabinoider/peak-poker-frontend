import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils/styles";

type GlassProps = ComponentProps<"div"> & {
  /** Inner padding in px (number) or any CSS padding. Flutter default: 16. */
  padding?: number | string;
  /** Corner radius in px. Flutter default: 20. */
  radius?: number;
  /** Frost what is behind the panel (blur 14). Turn off for panels over plain backgrounds. */
  blur?: boolean;
};

/** Frosted glass panel (Flutter `Glass`): 8% white fill, 12% white border. */
export const Glass = ({
  padding = 16,
  radius = 20,
  blur = true,
  className,
  style,
  ...props
}: GlassProps) => {
  const box: CSSProperties = {
    padding: typeof padding === "number" ? `${padding}px` : padding,
    borderRadius: `${radius}px`,
    ...style,
  };
  return (
    <div
      className={cn(
        "border border-glass bg-glass",
        blur && "overflow-hidden backdrop-blur-[14px]",
        className,
      )}
      style={box}
      {...props}
    />
  );
};
