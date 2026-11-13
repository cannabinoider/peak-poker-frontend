"use client";

import { useSecondsLeft } from "@/modules/table/hooks/use-clock";

/** "12s", counting down locally from what the server sent. */
export const CountdownText = ({
  seconds,
  className,
}: {
  seconds: number;
  className?: string;
}) => {
  const left = useSecondsLeft(seconds) ?? seconds;
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {Math.ceil(left)}s
    </span>
  );
};
