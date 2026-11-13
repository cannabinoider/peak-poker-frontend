"use client";

import { useEffect, useRef, useState } from "react";

import { isAnimal } from "@/lib/components/avatar";
import {
  playAnimal,
  playCards,
  playCheck,
  playChips,
  playDeal,
  playFanfare,
  playFold,
  playPotWon,
  playYourTurn,
  unlockAudio,
} from "@/lib/sound";
import { useGameStore } from "@/modules/table/state/game-store";
import { useSoundSettings } from "@/modules/table/state/sound-store";
import {
  tableEvents,
  type TableSound,
  type Win,
  winnerOf,
} from "@/modules/table/utils/sound-events";

/** How long the winner celebration stays up. */
export const CELEBRATION_MS = 3600;

const play = (sound: TableSound, delay: number) => {
  switch (sound.kind) {
    case "deal":
      return playDeal(delay);
    case "chips":
      return playChips(sound.count, delay);
    case "check":
      return playCheck(delay);
    case "fold":
      return playFold(delay);
    case "cards":
      return playCards(sound.count, delay);
    case "yourTurn":
      return playYourTurn(delay);
  }
};

const playWin = (win: Win) => {
  playPotWon(0.1);
  if (isAnimal(win.animal)) {
    playAnimal(win.animal, 0.45);
  } else {
    playFanfare(0.45);
  }
};

/**
 * Table sounds and the winner celebration, driven by changes to the room
 * state. Returns the win being celebrated right now (or null).
 */
export const useTableEffects = () => {
  const [win, setWin] = useState<Win | null>(null);
  // A win that landed while this tab was in the background, shown on return.
  const missed = useRef<Win | null>(null);

  useEffect(() => {
    // Browsers only allow sound after the user has touched the page.
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const celebrate = (w: Win) => {
      if (useSoundSettings.getState().enabled) {
        playWin(w);
      }
      setWin(w);
    };
    // Hidden tabs don't animate, so the celebration would run out unseen.
    const onVisible = () => {
      const w = missed.current;
      missed.current = null;
      const room = useGameStore.getState().room;
      if (w && !document.hidden && room && winnerOf(room)?.key === w.key) {
        celebrate(w);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    const unsubscribe = useGameStore.subscribe((s, prev) => {
      if (!s.room || s.room === prev.room) {
        return;
      }
      const events = tableEvents(prev.room, s.room);
      if (useSoundSettings.getState().enabled) {
        events.sounds.forEach((sound, i) => play(sound, i * 0.12));
      }
      if (events.win && document.hidden) {
        missed.current = events.win;
      } else if (events.win) {
        celebrate(events.win);
      }
    });
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!win) {
      return;
    }
    const t = setTimeout(() => setWin(null), CELEBRATION_MS);
    return () => clearTimeout(t);
  }, [win]);

  return win;
};
