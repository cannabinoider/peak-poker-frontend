"use client";

import { Spinner } from "@/lib/components/button";
import type { SocketStatus } from "@/modules/table/api/game-socket";

/** Thin banner while the connection drops and comes back. Nothing is lost meanwhile. */
export const ConnectionBanner = ({ status }: { status: SocketStatus }) =>
  status === "reconnecting" ? (
    <div
      role="status"
      className="safe-top fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-black/70 py-2 text-sm text-gold backdrop-blur">
      <Spinner className="size-4" />
      Reconnecting… your seat is safe
    </div>
  ) : null;
