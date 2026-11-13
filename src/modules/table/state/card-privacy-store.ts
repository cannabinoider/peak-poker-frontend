"use client";

import { create } from "zustand";

import { readJson, writeJson } from "@/lib/utils/local-store";

const KEY = "peakpoker.hideMyCards";
/** How long a tap shows your cards. */
export const PEEK_MS = 4000;

interface CardPrivacyStore {
  /** Privacy on: your cards stay face-down unless you peek. */
  hideByDefault: boolean;
  peeking: boolean;
  handKey: string | null;
  setHideByDefault: (value: boolean) => void;
  /** Tap: show for 4 seconds, then hide again. */
  peek: () => void;
  /** Press and hold: show while held. */
  holdStart: () => void;
  holdEnd: () => void;
  /** Call with the current hand's id: a new hand hides the cards again. */
  onHand: (key: string | null) => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;
const clear = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

/**
 * Keeps your own cards face-down so people next to you can't see them (ported
 * from the app's `CardPrivacy`). Each device remembers whether it's on.
 */
export const useCardPrivacy = create<CardPrivacyStore>()((set, get) => ({
  hideByDefault: readJson<boolean>(KEY) ?? true,
  peeking: false,
  handKey: null,
  setHideByDefault: (value) => {
    clear();
    writeJson(KEY, value);
    set({ hideByDefault: value, peeking: false });
  },
  peek: () => {
    clear();
    timer = setTimeout(() => set({ peeking: false }), PEEK_MS);
    set({ peeking: true });
  },
  holdStart: () => {
    clear();
    set({ peeking: true });
  },
  holdEnd: () => {
    clear();
    set({ peeking: false });
  },
  onHand: (key) => {
    if (key === get().handKey) {
      return;
    }
    clear();
    set({ handKey: key, peeking: false });
  },
}));

/** Whether your cards should be face-up right now. */
export const useShowingMyCards = () =>
  useCardPrivacy((s) => !s.hideByDefault || s.peeking);
