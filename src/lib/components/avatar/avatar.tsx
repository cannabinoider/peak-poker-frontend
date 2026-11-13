import type { CSSProperties } from "react";

import { initials } from "@/lib/utils/format";
import { cn } from "@/lib/utils/styles";

import { AnimalFace } from "./animal-face";
import type { Animal } from "./animals";

const SEAT_COUNT = 8;

export type AvatarProps = {
  name: string;
  /** Seat index; picks the seat color (`seat-0`..`seat-7`, wrapping). */
  seat: number;
  /** The player's animal; without one the avatar shows initials. */
  animal?: Animal | null;
  /** Diameter in px (Flutter default: 48). */
  size?: number;
  className?: string;
};

/**
 * Round player avatar: their animal face, or their initials on a
 * seat-colored gradient (seat color lightened 25% toward white, top-left, to
 * the seat color, bottom-right) with a white/24% 2px border.
 */
export const Avatar = ({ name, seat, animal, size = 48, className }: AvatarProps) => {
  if (animal) {
    return (
      <AnimalFace
        animal={animal}
        size={size}
        aria-label={`${name} (${animal})`}
        className={className}
      />
    );
  }
  const color = `rgb(var(--seat-${((seat % SEAT_COUNT) + SEAT_COUNT) % SEAT_COUNT}))`;
  const style: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.36,
    backgroundImage: `linear-gradient(to bottom right, color-mix(in srgb, ${color} 75%, white), ${color})`,
    backgroundOrigin: "border-box",
  };
  return (
    <span
      role="img"
      aria-label={name}
      style={style}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full border-2 border-white/[.24] font-extrabold leading-none text-white",
        className,
      )}>
      <span aria-hidden>{initials(name)}</span>
    </span>
  );
};
