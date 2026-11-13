"use client";

import { useEffect, useState } from "react";

/** Measures an element (pass the returned callback as its `ref`). */
export const useElementSize = <T extends HTMLElement>() => {
  const [el, setEl] = useState<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) =>
        s.width === width && s.height === height ? s : { width, height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, size] as const;
};
