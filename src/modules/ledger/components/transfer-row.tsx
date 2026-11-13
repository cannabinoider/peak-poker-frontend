import { fmt } from "@/lib/utils/format";

import type { Transfer } from "../types";

/** "Amit pays Bina ₹250". */
export const TransferRow = ({ transfer: t }: { transfer: Transfer }) => (
  <li className="flex items-center gap-3 py-2">
    <p className="min-w-0 flex-1 break-words">
      <span className="font-extrabold text-red">{t.from}</span>
      <span className="text-dim">{" pays "}</span>
      <span className="font-extrabold text-green">{t.to}</span>
    </p>
    <span className="tabular shrink-0 text-lg font-black">₹{fmt(t.amount)}</span>
  </li>
);
