import type { ComponentProps } from "react";

import { fmt } from "@/lib/utils/format";
import { cn } from "@/lib/utils/styles";

import { Chip } from "./chip";

type BetChipProps = ComponentProps<"span"> & {
  /** Chip amount, shown grouped ("1,500"). */
  amount: number;
};

/**
 * A seat's bet on the felt (Flutter `_BetChip`): dark pill with a gold chip and the
 * amount in 12px bold tabular white.
 */
export const BetChip = ({ amount, className, ...props }: BetChipProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-[5px] rounded-full bg-black/45 py-[3px] pl-1 pr-[9px]",
      className,
    )}
    {...props}>
    <Chip size={16} />
    <span className="tabular text-xs font-bold leading-[1.2] text-white">
      {fmt(amount)}
    </span>
  </span>
);
