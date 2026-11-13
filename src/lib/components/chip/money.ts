import { fmt, rupees } from "@/lib/utils/format";

/** Exact rupees with a sign: +₹12.50, −₹300, ₹0 (|v| < 0.005 counts as zero). */
export const signedRupees = (v: number) => {
  const s = rupees(Math.abs(v));
  if (v > 0.004) {
    return `+${s}`;
  }
  if (v < -0.004) {
    return `−${s}`;
  }
  return s;
};

/** Whole rupees with a sign: +₹1,200, −₹300, ₹0. */
export const signedWholeRupees = (v: number) =>
  v > 0 ? `+₹${fmt(v)}` : v < 0 ? `−₹${fmt(-v)}` : "₹0";

/** Tailwind text color for a profit/loss: green up, red down, dim when even. */
export const netColorClass = (v: number) =>
  v > 0 ? "text-green" : v < 0 ? "text-red" : "text-dim";
