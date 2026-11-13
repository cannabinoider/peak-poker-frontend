"use client";

import { useState } from "react";

import { ANIMALS } from "@/lib/components/avatar";
import { playAnimal, playPotWon, unlockAudio } from "@/lib/sound";
import { WinnerCelebration } from "@/modules/table/components/winner-celebration";
import type { Win } from "@/modules/table/utils/sound-events";

/** Replays each animal's winner celebration (and voice) on a felt patch. */
export const CelebrationPreview = () => {
  const [win, setWin] = useState<Win | null>(null);
  const [runs, setRuns] = useState(0);
  const show = (animal: (typeof ANIMALS)[number]) => {
    unlockAudio();
    playPotWon(0.1);
    playAnimal(animal, 0.45);
    setRuns((n) => n + 1);
    setWin({
      key: `preview:${runs}`,
      seat: 0,
      name: animal[0].toUpperCase() + animal.slice(1),
      animal,
      amount: 1250,
      you: false,
    });
  };
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ANIMALS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => show(a)}
            className="rounded-full bg-glass px-3 py-1.5 text-sm capitalize">
            {a}
          </button>
        ))}
      </div>
      <div className="relative mt-3 h-80 overflow-hidden rounded-[48%] border-8 border-rim bg-felt">
        {win && <WinnerCelebration win={win} />}
      </div>
    </>
  );
};
