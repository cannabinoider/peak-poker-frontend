"use client";

import { OutlineButton } from "@/lib/components/button";
import { useGameStore } from "@/modules/table/state/game-store";
import { bankerRelief } from "@/modules/table/utils/banker-relief";

/**
 * Where the table is already waiting on the banker. The server picks who
 * takes over; this stays disabled until the server would allow the request.
 */
export const RelieveBankerButton = ({ bankerAway }: { bankerAway?: boolean }) => {
  const relieveBanker = useGameStore((s) => s.relieveBanker);
  const relief = bankerRelief(bankerAway);
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <OutlineButton height={44} disabled={!relief.enabled} onClick={relieveBanker}>
        Ask for a new banker
      </OutlineButton>
      {relief.reason !== null && (
        <p className="text-center text-xs text-dim">{relief.reason}</p>
      )}
    </div>
  );
};
