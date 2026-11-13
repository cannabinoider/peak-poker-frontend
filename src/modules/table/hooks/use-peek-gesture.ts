"use client";

import { type KeyboardEvent, useEffect, useRef } from "react";

import { HOLD_MS } from "@/modules/table/constants";
import { useCardPrivacy } from "@/modules/table/state/card-privacy-store";

/**
 * Tap = peek for a few seconds; press and hold = show while held (Flutter
 * `_PrivateCards` gestures). Spread the result on the element with the cards.
 */
export const usePeekGesture = (enabled: boolean) => {
  const peek = useCardPrivacy((s) => s.peek);
  const holdStart = useCardPrivacy((s) => s.holdStart);
  const holdEnd = useCardPrivacy((s) => s.holdEnd);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holding = useRef(false);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const finish = (tap: boolean) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      if (tap) {
        peek();
      }
    } else if (holding.current) {
      holding.current = false;
      holdEnd();
    }
  };

  if (!enabled) {
    return {};
  }
  return {
    onPointerDown: () => {
      holding.current = false;
      timer.current = setTimeout(() => {
        timer.current = null;
        holding.current = true;
        holdStart();
      }, HOLD_MS);
    },
    onPointerUp: () => finish(true),
    onPointerCancel: () => finish(false),
    onPointerLeave: () => finish(false),
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        peek();
      }
    },
  };
};
