"use client";

import { useState } from "react";

import { Avatar, isAnimal } from "@/lib/components/avatar";
import { GoldButton } from "@/lib/components/button";
import { Sheet } from "@/lib/components/sheet";
import { Icon } from "@/modules/table/components/icons";
import { MenuRow } from "@/modules/table/components/menu-row";
import { useGameStore } from "@/modules/table/state/game-store";
import type { Seat } from "@/modules/table/types";

type SeatActionsSheetProps = {
  /** The seat tapped, or null when closed. */
  seat: Seat | null;
  onClose: () => void;
};

/** Banker / owner actions for another player's seat (Flutter `showSeatActions`). */
export const SeatActionsSheet = ({ seat, onClose }: SeatActionsSheetProps) => {
  const [confirmBanker, setConfirmBanker] = useState(false);
  const makeBanker = useGameStore((s) => s.makeBanker);
  const setSittingOut = useGameStore((s) => s.setSittingOut);
  // Keep showing the last seat while the sheet slides out.
  const [shown, setShown] = useState(seat);
  if (seat && seat !== shown) {
    setShown(seat);
  }
  const close = () => {
    setConfirmBanker(false);
    onClose();
  };

  const s = seat ?? shown;
  if (!s) {
    return null;
  }
  const avatar = (size: number) => (
    <Avatar
      name={s.name}
      seat={s.seat}
      animal={isAnimal(s.animal) ? s.animal : null}
      size={size}
    />
  );

  return (
    <Sheet open={seat !== null} onClose={close} ariaLabel={`${s.name}'s seat`}>
      {confirmBanker ? (
        <div className="flex flex-col items-center text-center">
          {avatar(64)}
          <h2 className="mt-3 text-lg font-extrabold text-white">
            Make {s.name} the banker?
          </h2>
          <p className="mt-1.5 text-dim">
            The banker starts the game and manages buy-ins. The room&apos;s owner can
            always change it.
          </p>
          <GoldButton
            className="mt-[18px]"
            icon={<Icon name="bank" />}
            onClick={() => {
              makeBanker(s.seat);
              close();
            }}>
            Make banker
          </GoldButton>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {avatar(56)}
          <h2 className="mt-2 text-lg font-extrabold text-white">{s.name}</h2>
          <div className="mt-3 w-full">
            {!s.isBanker && (
              <MenuRow
                icon="bank"
                tone="gold"
                title="Make banker"
                onClick={() => setConfirmBanker(true)}
              />
            )}
            <MenuRow
              icon={s.sittingOut ? "login" : "seat"}
              title={s.sittingOut ? "Deal them back in" : "Sit them out"}
              subtitle={
                s.sittingOut
                  ? "They play again from the next hand"
                  : "Not dealt in until they come back"
              }
              onClick={() => {
                setSittingOut(!s.sittingOut, s.seat);
                close();
              }}
            />
          </div>
        </div>
      )}
    </Sheet>
  );
};
