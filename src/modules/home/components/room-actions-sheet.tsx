"use client";

import { type ReactNode, useState } from "react";

import { Spinner, TextButton } from "@/lib/components/button";
import { Sheet } from "@/lib/components/sheet";
import { ClientError } from "@/lib/fetch";
import { cn } from "@/lib/utils/styles";
import { forgetRoomSession, type RoomSession } from "@/modules/session/session-storage";

import { closeRoom } from "../api/client-actions";
import { CLOSE_ROOM_TEXT, REMOVE_ROOM_TEXT } from "../constants";
import { closeRoomError } from "../utils";

import { CloseRoomIcon, MoreIcon, RemoveIcon } from "./icons";

type RoomActionsSheetProps = {
  /** The room whose menu is open, or null when closed. */
  room: RoomSession | null;
  onClose: () => void;
  /** The room left this device's list (closed for everyone, or just forgotten here). */
  onRemoved: (code: string) => void;
};

/**
 * The "⋮" menu for one of "your rooms": the host can close the room for
 * everyone (after a confirmation); anyone can forget it on this device.
 */
export const RoomActionsSheet = ({
  room,
  onClose,
  onRemoved,
}: RoomActionsSheetProps) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Remember the last room so the sheet keeps its content while it slides out.
  const [shown, setShown] = useState(room);
  if (room !== null && room !== shown) {
    setShown(room);
    setConfirming(false);
    setError(null);
  }

  const remove = (code: string) => {
    forgetRoomSession(code);
    onRemoved(code);
  };

  const confirmClose = async () => {
    if (!shown || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    let message: string | null = null;
    try {
      await closeRoom(shown.code, shown.token);
    } catch (e) {
      message = closeRoomError(e instanceof ClientError ? e.status : null);
    }
    setBusy(false);
    if (message) {
      setError(message);
    } else {
      remove(shown.code);
    }
  };

  const close = () => {
    if (!busy) {
      onClose();
    }
  };

  return (
    <Sheet
      open={room !== null}
      onClose={close}
      title={confirming ? `Close room ${shown?.code ?? ""}?` : (shown?.code ?? "")}
      icon={confirming ? <CloseRoomIcon /> : <MoreIcon />}
      footer={
        confirming ? (
          <div className="flex items-center justify-end gap-2">
            <TextButton disabled={busy} onClick={() => setConfirming(false)}>
              Keep it open
            </TextButton>
            <button
              type="button"
              disabled={busy}
              aria-busy={busy || undefined}
              onClick={confirmClose}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-black outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-red/60 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60">
              {busy && <Spinner className="size-4" />}
              Close room
            </button>
          </div>
        ) : undefined
      }>
      {confirming ? (
        <p className="text-dim">{CLOSE_ROOM_TEXT}</p>
      ) : (
        <div className="grid gap-1">
          {shown?.isOwner && (
            <ActionRow
              icon={<CloseRoomIcon />}
              title="Close room"
              subtitle="End it for everyone. Only the host can do this."
              danger
              onClick={() => setConfirming(true)}
            />
          )}
          <ActionRow
            icon={<RemoveIcon />}
            title="Remove from this device"
            subtitle={REMOVE_ROOM_TEXT}
            onClick={() => shown && remove(shown.code)}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red">
          {error}
        </p>
      )}
    </Sheet>
  );
};

type ActionRowProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  danger?: boolean;
  onClick: () => void;
};

const ActionRow = ({
  icon,
  title,
  subtitle,
  danger = false,
  onClick,
}: ActionRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-14 w-full items-center gap-4 rounded-xl px-2 py-2 text-left outline-none hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-gold/60">
    <span
      aria-hidden
      className={cn(
        "inline-flex size-6 shrink-0 [&>svg]:size-full",
        danger ? "text-red" : "text-dim",
      )}>
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className={cn("block text-base", danger ? "text-red" : "text-white")}>
        {title}
      </span>
      <span className="block text-sm text-dim">{subtitle}</span>
    </span>
  </button>
);
