import { cn } from "@/lib/utils/styles";

import { ErrorIcon, WarningIcon } from "./icons";

type SetupMessageProps = {
  tone: "error" | "warning";
  children: string;
};

/** One error (red) or warning (gold) line under the summary, with its icon. */
export const SetupMessage = ({ tone, children }: SetupMessageProps) => (
  <p
    className={cn(
      "mt-2.5 flex items-start gap-1.5 text-sm",
      tone === "error" ? "text-red" : "text-gold",
    )}>
    <span
      aria-hidden
      className="mt-px inline-flex size-[18px] shrink-0 [&>svg]:size-full">
      {tone === "error" ? <ErrorIcon /> : <WarningIcon />}
    </span>
    <span className="min-w-0">
      <span className="sr-only">{tone === "error" ? "Error: " : "Warning: "}</span>
      {children}
    </span>
  </p>
);
