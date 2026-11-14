"use client";

import { useState } from "react";

import { TextButton } from "@/lib/components/button";
import { Sheet } from "@/lib/components/sheet";
import { SwitchTile } from "@/lib/components/switch-tile";
import { DealerChoice } from "@/modules/table/components/dealer-choice";
import { MenuRow } from "@/modules/table/components/menu-row";
import { RelieveBankerButton } from "@/modules/table/components/relieve-banker";
import { useCardPrivacy } from "@/modules/table/state/card-privacy-store";
import { useGameStore } from "@/modules/table/state/game-store";
import { useSoundSettings } from "@/modules/table/state/sound-store";
import type { Room } from "@/modules/table/types";
import {
  canManage,
  cashOutState,
  isComplete,
  playerOf,
  seatOf,
} from "@/modules/table/utils/room";

type MenuSheetProps = {
  room: Room;
  open: boolean;
  onClose: () => void;
  onRules: () => void;
  onLedger: () => void;
};

/** Table menu: card privacy, sounds, sit out / back, rules, ledger; banker: pause, end game. */
export const MenuSheet = ({
  room,
  open,
  onClose,
  onRules,
  onLedger,
}: MenuSheetProps) => {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const hideByDefault = useCardPrivacy((s) => s.hideByDefault);
  const setHideByDefault = useCardPrivacy((s) => s.setHideByDefault);
  const soundOn = useSoundSettings((s) => s.enabled);
  const setSoundOn = useSoundSettings((s) => s.setEnabled);
  const setSittingOut = useGameStore((s) => s.setSittingOut);
  const setPaused = useGameStore((s) => s.setPaused);
  const endGame = useGameStore((s) => s.endGame);
  const requestCashOut = useGameStore((s) => s.requestCashOut);

  const you = room.yourSeat;
  const seat = you === null ? undefined : seatOf(room, you);
  const inRunningHand =
    playerOf(room.hand, you) !== undefined && !isComplete(room.hand);
  const manage = canManage(room) && !room.settlement;
  const leaving = cashOutState(room);
  const close = () => {
    setConfirmEnd(false);
    setConfirmLeave(false);
    onClose();
  };
  const then = (f: () => void) => () => {
    close();
    f();
  };

  if (confirmLeave && leaving.kind === "offer") {
    return (
      <Sheet open={open} onClose={close} title="Leave with your chips?">
        <p className="text-dim">
          You leave the table with the chips you have
          {inRunningHand ? " when this hand ends" : ""}. Your group settles that among
          yourselves — nothing is paid out or withdrawn.
          {leaving.direct
            ? " You're the host, so this happens as soon as you confirm, and the banker role moves to someone still seated."
            : " The banker has to agree first."}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <TextButton onClick={() => setConfirmLeave(false)} className="min-h-11">
            Keep playing
          </TextButton>
          <button
            type="button"
            onClick={then(requestCashOut)}
            className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">
            Leave with my chips
          </button>
        </div>
      </Sheet>
    );
  }

  if (confirmEnd) {
    return (
      <Sheet open={open} onClose={close} title="End the game?">
        <p className="text-dim">
          The current hand is played out, then everyone sees the final settlement. No
          more hands or rebuys.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <TextButton onClick={() => setConfirmEnd(false)} className="min-h-11">
            Keep playing
          </TextButton>
          <button
            type="button"
            onClick={then(endGame)}
            className="min-h-11 rounded-full bg-red px-5 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">
            End game
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={close} title="Table">
      <SwitchTile
        checked={hideByDefault}
        onChange={setHideByDefault}
        title="Hide my cards"
        subtitle="Face-down until you tap to peek or press and hold"
      />
      <SwitchTile
        checked={soundOn}
        onChange={setSoundOn}
        title="Sounds"
        subtitle="Chips, checks and the winner's animal"
      />
      <DealerChoice />
      {seat && !room.settlement && (
        <MenuRow
          icon={seat.sittingOut ? "login" : "seat"}
          tone={seat.sittingOut ? "gold" : "default"}
          title={seat.sittingOut ? "I'm back — deal me in" : "Sit out next hand"}
          subtitle={
            seat.sittingOut
              ? inRunningHand
                ? "You're in this hand; you sit out from the next one"
                : "You play again from the next hand"
              : "You're not dealt in until you come back"
          }
          onClick={then(() => setSittingOut(!seat.sittingOut))}
        />
      )}
      {leaving.kind === "offer" && (
        <MenuRow
          icon="door"
          title="Cash out"
          subtitle={
            leaving.direct
              ? "Leave with your chips. Your group settles them among yourselves."
              : "Ask to leave with your chips. Your group settles them among yourselves."
          }
          onClick={() => setConfirmLeave(true)}
        />
      )}
      {leaving.kind === "pending" && (
        <>
          <MenuRow
            icon="door"
            tone="gold"
            title="Waiting for the banker"
            subtitle="You'll leave with your chips once they agree. Nothing is paid out."
            onClick={close}
          />
          <RelieveBankerButton bankerAway={room.bankerAway} />
        </>
      )}
      {leaving.kind === "afterHand" && (
        <MenuRow
          icon="door"
          tone="gold"
          title="Leaving after this hand"
          subtitle="You'll leave with whatever chips you still have. Nothing is paid out."
          onClick={close}
        />
      )}
      <MenuRow icon="info" title="How to play" onClick={then(onRules)} />
      <MenuRow
        icon="receipt"
        title="Ledger"
        subtitle="Buy-ins and chips"
        onClick={then(onLedger)}
      />
      {manage && (
        <>
          <MenuRow
            icon={room.paused ? "play" : "pause"}
            tone={room.paused ? "gold" : "default"}
            title={room.paused ? "Resume dealing" : "Pause after this hand"}
            onClick={then(() => setPaused(!room.paused))}
          />
          {!room.ending && (
            <MenuRow
              icon="flag"
              tone="danger"
              title="End game & settle up"
              subtitle="After the current hand"
              onClick={() => setConfirmEnd(true)}
            />
          )}
        </>
      )}
    </Sheet>
  );
};
