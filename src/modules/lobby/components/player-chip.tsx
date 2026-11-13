import { Avatar, isAnimal } from "@/lib/components/avatar";
import { cn } from "@/lib/utils/styles";

import type { Seat } from "../types";

import { BankIcon } from "./icons";

type PlayerChipProps = {
  seat: Seat;
  isYou: boolean;
  /** Tapping offers to make them the banker (owner / banker only). */
  onPick?: () => void;
};

/** A seated player: avatar (faded when offline), banker badge, name and tags. */
export const PlayerChip = ({ seat, isYou, onPick }: PlayerChipProps) => {
  const tags = [isYou && "You", seat.isOwner && "Host", !seat.connected && "Offline"]
    .filter(Boolean)
    .join(" · ");
  const label = `${seat.name}${seat.isBanker ? ", banker" : ""}${tags ? `, ${tags}` : ""}`;
  const body = (
    <>
      <span className="relative inline-flex">
        <span className={cn("inline-flex", !seat.connected && "opacity-40")}>
          <Avatar
            name={seat.name}
            seat={seat.seat}
            animal={isAnimal(seat.animal) ? seat.animal : null}
          />
        </span>
        {seat.isBanker && (
          <span className="absolute -bottom-1 -right-1 inline-flex size-[22px] items-center justify-center rounded-full bg-gold text-black/[0.87]">
            <BankIcon className="size-3" />
          </span>
        )}
      </span>
      <span className="mt-1 block w-full truncate text-xs">{seat.name}</span>
      {tags && (
        <span className="block w-full truncate text-[10px] leading-tight text-faint">
          {tags}
        </span>
      )}
    </>
  );
  const box = "flex w-[68px] flex-col items-center text-center";
  return onPick ? (
    <button
      type="button"
      onClick={onPick}
      aria-label={`${label}. Make banker`}
      className={cn(
        box,
        "rounded-input py-1 outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-gold/60",
      )}>
      {body}
    </button>
  ) : (
    <div className={cn(box, "py-1")} aria-label={label} role="group">
      {body}
    </div>
  );
};
