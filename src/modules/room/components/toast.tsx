"use client";

import { useEffect } from "react";

import type { Toast as ToastData } from "@/modules/table/state/game-store";

const SHOW_MS = 3500;

/** A short message from the server ("Minimum is 100"), hidden after a few seconds. */
export const Toast = ({
  toast,
  onDone,
}: {
  toast: ToastData | null;
  onDone: () => void;
}) => {
  useEffect(() => {
    if (!toast) {
      return;
    }
    const t = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) {
    return null;
  }
  return (
    <div
      key={toast.id}
      role="alert"
      className="fixed inset-x-4 bottom-28 z-50 mx-auto max-w-sm animate-slide-up rounded-2xl border border-glass bg-black/80 px-4 py-3 text-center text-sm backdrop-blur">
      {toast.text}
    </div>
  );
};
