import type { ReactNode } from "react";

/** A centred dim line where the controls would be (Flutter `_hint`). */
export const Hint = ({ children }: { children: ReactNode }) => (
  <p
    role="status"
    className="flex min-h-[52px] items-center justify-center text-center text-dim">
    {children}
  </p>
);
