import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/styles";

import { netColorClass, signedRupees, signedWholeRupees } from "./money";

type NetAmountProps = ComponentProps<"span"> & {
  /** Profit (+) or loss (−) in rupees. */
  value: number;
  /**
   * `exact` (live ledger): up to 2 decimals, 14px extra-bold.
   * `whole` (final settlement): rounded rupees, 18px black weight.
   */
  variant?: "exact" | "whole";
};

/** Signed rupee result colored green/red/dim, as in the ledger and settlement rows. */
export const NetAmount = ({
  value,
  variant = "exact",
  className,
  ...props
}: NetAmountProps) => (
  <span
    className={cn(
      "tabular",
      netColorClass(value),
      variant === "whole" ? "text-lg font-black" : "text-sm font-extrabold",
      className,
    )}
    {...props}>
    {variant === "whole" ? signedWholeRupees(Math.round(value)) : signedRupees(value)}
  </span>
);
