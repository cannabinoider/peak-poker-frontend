"use client";

import { create } from "zustand";

import { readJson, writeJson } from "@/lib/utils/local-store";

const KEY = "peakpoker.sound";

interface SoundStore {
  /** Table sounds on (chips, checks, the winner's animal). Each device remembers it. */
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

export const useSoundSettings = create<SoundStore>()((set) => ({
  enabled: readJson<boolean>(KEY) ?? true,
  setEnabled: (value) => {
    writeJson(KEY, value);
    set({ enabled: value });
  },
}));
