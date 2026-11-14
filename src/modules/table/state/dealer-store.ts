"use client";

import { create } from "zustand";

import { readJson, writeJson } from "@/lib/utils/local-store";
import { type DealerId, DEFAULT_DEALER } from "@/modules/table/constants";

const KEY = "peakpoker.dealer";

const isDealer = (value: unknown): value is DealerId =>
  value === "naomi" || value === "nina";

interface DealerStore {
  /** Who deals the cards on this device. A new device starts on Naomi. */
  dealer: DealerId;
  setDealer: (dealer: DealerId) => void;
}

const saved = readJson<unknown>(KEY);

export const useDealerChoice = create<DealerStore>()((set) => ({
  dealer: isDealer(saved) ? saved : DEFAULT_DEALER,
  setDealer: (dealer) => {
    writeJson(KEY, dealer);
    set({ dealer });
  },
}));
