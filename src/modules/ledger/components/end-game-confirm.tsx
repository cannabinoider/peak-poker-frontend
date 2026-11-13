import { TextButton } from "@/lib/components/button";
import { Sheet } from "@/lib/components/sheet";

import { END_GAME_TEXT } from "../constants";

import { FlagIcon } from "./icons";

type EndGameConfirmProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** "End the game?" confirmation (Flutter `confirmEndGame`). */
export const EndGameConfirm = ({ open, onCancel, onConfirm }: EndGameConfirmProps) => (
  <Sheet
    open={open}
    onClose={onCancel}
    title="End the game?"
    icon={<FlagIcon />}
    footer={
      <div className="flex items-center justify-end gap-2">
        <TextButton onClick={onCancel}>Keep playing</TextButton>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex min-h-11 items-center rounded-full bg-red px-5 text-sm font-semibold text-black outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-red/60 active:brightness-90">
          End game
        </button>
      </div>
    }>
    <p className="text-dim">{END_GAME_TEXT}</p>
  </Sheet>
);
