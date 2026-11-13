"use client";

import { useState } from "react";

import { OutlineButton } from "@/lib/components/button";

import { EndGameConfirm } from "./end-game-confirm";
import { FlagIcon } from "./icons";

type EndGameButtonProps = {
  /** The banker already ended it; the current hand is finishing. */
  ending: boolean;
  /** Called after the banker confirms. */
  onEndGame: () => void;
};

/** Red "End game & settle up" button with its confirmation. */
export const EndGameButton = ({ ending, onEndGame }: EndGameButtonProps) => {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <OutlineButton
        tone="danger"
        height={50}
        icon={<FlagIcon />}
        disabled={ending}
        onClick={() => setConfirming(true)}>
        {ending ? "Ending after this hand…" : "End game & settle up"}
      </OutlineButton>
      <EndGameConfirm
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onEndGame();
        }}
      />
    </>
  );
};
