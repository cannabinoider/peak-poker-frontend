"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/lib/components/button";
import { SettlementView } from "@/modules/ledger";
import { Lobby } from "@/modules/lobby";
import { getRoomSummary } from "@/modules/room/api/client-actions";
import { ConnectionBanner } from "@/modules/room/components/connection-banner";
import { JoinForm } from "@/modules/room/components/join-form";
import { RoomClosed } from "@/modules/room/components/room-closed";
import { Toast } from "@/modules/room/components/toast";
import type { RoomSummary } from "@/modules/room/types";
import {
  getLastName,
  getRoomSession,
  secretFromHash,
} from "@/modules/session/session-storage";
import { Table } from "@/modules/table";
import { useTableEffects } from "@/modules/table/hooks/use-table-effects";
import { useGameStore } from "@/modules/table/state/game-store";

/**
 * `/r/[code]`: join (or rejoin with the saved token), then show the lobby, the
 * table, or the settlement, depending on what the server says.
 */
export const RoomScreen = ({ code }: { code: string }) => {
  const upper = code.toUpperCase();
  const { status, me, room, joinError, toast, join, disconnect, dismissToast } =
    useGameStore();
  const closedReason = useGameStore((s) => s.closedReason);
  // Read after mount: the URL hash and localStorage don't exist during server rendering.
  const [boot, setBoot] = useState<{
    secret: string | null;
    initialName: string;
  } | null>(null);
  // Mounted here, not in the table, so the lobby taps unlock sound and the
  // first change after "Start game" is heard.
  const win = useTableEffects();
  // Free seats for the join form; refreshed when a join fails (seat taken).
  const [summary, setSummary] = useState<RoomSummary | null>(null);
  const needsForm = boot !== null && !me && !closedReason;
  useEffect(() => {
    if (!needsForm) {
      return;
    }
    let live = true;
    getRoomSummary(upper)
      .then((s) => live && setSummary(s))
      .catch(() => live && setSummary(null));
    return () => {
      live = false;
    };
  }, [needsForm, upper, joinError]);

  // Browser-only bits: the invite secret in the URL hash and this device's saved seat.
  useEffect(() => {
    const s = secretFromHash(window.location.hash);
    const saved = getRoomSession(upper);
    if (saved) {
      join({ code: upper, token: saved.token, secret: s });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only values, read once after mount
    setBoot({ secret: s, initialName: saved?.name ?? getLastName() });
    return () => disconnect();
  }, [upper, join, disconnect]);

  if (!boot) {
    return <FullScreenSpinner />;
  }
  if (closedReason) {
    return <RoomClosed code={upper} reason={closedReason} />;
  }
  const { secret, initialName } = boot;

  if (!me) {
    const joining = status === "connecting" || status === "open";
    if (joining && !joinError) {
      return <FullScreenSpinner label="Joining…" />;
    }
    return (
      <JoinForm
        code={upper}
        initialName={initialName}
        hasInvite={secret !== null}
        error={joinError}
        busy={joining}
        summary={summary}
        onJoin={(name, seat) => join({ code: upper, name, secret, seat })}
      />
    );
  }

  if (!room) {
    return <FullScreenSpinner label="Loading the table…" />;
  }

  return (
    <>
      <ConnectionBanner status={status} />
      {room.settlement ? (
        <SettlementView room={room} />
      ) : room.started ? (
        <Table win={win} />
      ) : (
        <Lobby room={room} me={me} />
      )}
      <Toast toast={toast} onDone={dismissToast} />
    </>
  );
};

const FullScreenSpinner = ({ label }: { label?: string }) => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-3 text-dim">
    <Spinner className="size-6 text-gold" />
    {label && <p>{label}</p>}
  </main>
);
