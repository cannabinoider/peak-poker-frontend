import { Avatar, isAnimal } from "@/lib/components/avatar";
import { GoldButton } from "@/lib/components/button";
import { Sheet } from "@/lib/components/sheet";

import { MAKE_BANKER_TEXT } from "../constants";
import type { Seat } from "../types";

import { BankIcon } from "./icons";

type MakeBankerSheetProps = {
  open: boolean;
  /** The player to promote (kept while the sheet slides away). */
  seat: Seat | null;
  onClose: () => void;
  onConfirm: (seat: number) => void;
};

/** Confirmation for handing the banker role to a player (Flutter `askMakeBanker`). */
export const MakeBankerSheet = ({
  open,
  seat,
  onClose,
  onConfirm,
}: MakeBankerSheetProps) => (
  <Sheet open={open && seat !== null} onClose={onClose} ariaLabel="Make banker">
    {seat && (
      <div className="flex flex-col items-center pt-3 text-center">
        <Avatar
          name={seat.name}
          seat={seat.seat}
          animal={isAnimal(seat.animal) ? seat.animal : null}
          size={64}
        />
        <p className="pt-3 text-lg font-extrabold">Make {seat.name} the banker?</p>
        <p className="pt-1.5 text-dim">{MAKE_BANKER_TEXT}</p>
        <div className="w-full pt-[18px]">
          <GoldButton icon={<BankIcon />} onClick={() => onConfirm(seat.seat)}>
            Make banker
          </GoldButton>
        </div>
      </div>
    )}
  </Sheet>
);
