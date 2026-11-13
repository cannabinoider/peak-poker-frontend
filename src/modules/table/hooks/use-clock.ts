"use client";

import { useSyncExternalStore } from "react";

import { useGameStore } from "@/modules/table/state/game-store";
import type { Room } from "@/modules/table/types";
import { remainingSeconds } from "@/modules/table/utils/countdown";

const TICK_MS = 250;

/*
 * When each state message arrived. The server sends "seconds left" with every
 * state; we count down locally from the moment it came in.
 */
const arrivals = new WeakMap<object, number>();
const stamp = (room: Room | null) => {
  if (room && !arrivals.has(room)) {
    now = Date.now();
    arrivals.set(room, now);
  }
};

let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

stamp(useGameStore.getState().room);
useGameStore.subscribe((s) => stamp(s.room));

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
};

/** A clock (ms) that ticks four times a second while anything listens. */
export const useNow = () =>
  useSyncExternalStore(
    subscribe,
    () => now,
    () => 0,
  );

/**
 * Seconds left (fractional) on a server timer sent with the current state, or
 * null without one. Resets whenever a new state arrives.
 */
export const useSecondsLeft = (seconds: number | null | undefined) => {
  const room = useGameStore((s) => s.room);
  const clock = useNow();
  if (seconds === null || seconds === undefined || !room) {
    return null;
  }
  return remainingSeconds(seconds, arrivals.get(room) ?? clock, clock);
};
