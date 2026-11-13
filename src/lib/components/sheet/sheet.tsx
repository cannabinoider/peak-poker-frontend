"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/styles";

import { CloseIcon } from "./icons";
import { focusableIn, isTopSheet, popSheet, pushSheet } from "./sheet-stack";

export type SheetProps = {
  open: boolean;
  /** Called on Escape, a backdrop tap or the close button. */
  onClose: () => void;
  /** Heading at the top (22px black weight, like the app's sheets). */
  title?: ReactNode;
  /** Small gold icon before the title. */
  icon?: ReactNode;
  /** Accessible name when there is no title. */
  ariaLabel?: string;
  /** Pinned below the scrolling body (e.g. action buttons). */
  footer?: ReactNode;
  /** Extra classes for the scrolling body. */
  className?: string;
  children?: ReactNode;
};

const IN_MS = 220;
const OUT_MS = 180;
/** Tailwind `sm`: from here the sheet is a centred dialog. */
const CENTRED_QUERY = "(min-width: 640px)";
const SAFE_PAD = "pb-[max(20px,calc(env(safe-area-inset-bottom)+12px))]";

const noop = () => undefined;
const subscribeNothing = () => noop;

/**
 * Modal bottom sheet (Flutter `showModalBottomSheet` as the app styles it):
 * slides up over a dimmed backdrop, #111827 with 24px top corners, a drag
 * handle, a scrollable body and safe-area bottom padding. Closes on Escape and
 * on a backdrop tap; keeps keyboard focus inside while open and gives it back
 * afterwards. Sheets can stack (the top one handles keys). From the `sm`
 * breakpoint up it is a centred dialog with all corners rounded.
 */
export const Sheet = (props: SheetProps) => {
  const isClient = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  // Stay mounted while the closing slide plays.
  const [mounted, setMounted] = useState(props.open);
  if (props.open && !mounted) {
    setMounted(true);
  }
  const onExited = useCallback(() => setMounted(false), []);

  if (!isClient || !mounted) {
    return null;
  }
  return createPortal(<SheetPanel {...props} onExited={onExited} />, document.body);
};

const SheetPanel = ({
  open,
  onClose,
  title,
  icon,
  ariaLabel,
  footer,
  className,
  children,
  onExited,
}: SheetProps & { onExited: () => void }) => {
  const titleId = useId();
  const [id] = useState(() => Symbol("sheet"));
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(() => onClose());

  // Register, trap focus, handle Escape; restore focus when gone.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    pushSheet(id);
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (!isTopSheet(id)) {
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") {
        return;
      }
      const items = focusableIn(panel);
      const first = items[0];
      const last = items.at(-1);
      const active = document.activeElement;
      if (!first || !last) {
        e.preventDefault();
        panel.focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (e: FocusEvent) => {
      if (isTopSheet(id) && e.target instanceof Node && !panel.contains(e.target)) {
        panel.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
      popSheet(id);
      previous?.focus({ preventScroll: true });
    };
  }, [id]);

  // Slide in when opened, out when closed (then unmount).
  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop || typeof panel.animate !== "function") {
      if (!open) {
        onExited();
      }
      return;
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Wide screens show a centred dialog: rise a little instead of sliding up.
    const centred = window.matchMedia(CENTRED_QUERY).matches;
    const hidden: Keyframe = centred
      ? { transform: "translateY(16px)", opacity: 0 }
      : { transform: "translateY(100%)" };
    const shown: Keyframe = centred
      ? { transform: "translateY(0)", opacity: 1 }
      : { transform: "translateY(0)" };
    if (open) {
      const duration = still ? 0 : IN_MS;
      const slide = panel.animate([hidden, shown], {
        duration,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      });
      const fade = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
      return () => {
        slide.cancel();
        fade.cancel();
      };
    }
    const duration = still ? 0 : OUT_MS;
    const slide = panel.animate([shown, hidden], {
      duration,
      easing: "ease-in",
      fill: "forwards",
    });
    const fade = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      fill: "forwards",
    });
    slide.onfinish = onExited;
    return () => {
      // Reopened mid-close: snap back and slide in again.
      slide.onfinish = null;
      slide.cancel();
      fade.cancel();
    };
  }, [open, onExited]);

  const hasHeader = title !== undefined || icon !== undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6",
        !open && "pointer-events-none",
      )}>
      <div
        ref={backdropRef}
        aria-hidden
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title !== undefined ? titleId : undefined}
        aria-label={title === undefined ? ariaLabel : undefined}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[24px] border border-b-0 border-glass bg-[#111827] text-text shadow-[0_-12px_40px_rgb(0_0_0/0.5)] outline-none sm:max-h-[85dvh] sm:max-w-lg sm:rounded-[24px] sm:border-b">
        <div className="flex shrink-0 justify-center pt-3 sm:pt-2">
          <span aria-hidden className="h-1 w-10 rounded-sm bg-white/[0.24] sm:hidden" />
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-2 pl-5 pr-2",
            hasHeader ? "pt-1.5" : "absolute right-0 top-1.5",
          )}>
          {icon !== undefined && (
            <span
              aria-hidden
              className="inline-flex size-6 shrink-0 text-gold [&>svg]:size-full">
              {icon}
            </span>
          )}
          {title !== undefined && (
            <h2
              id={titleId}
              className="min-w-0 flex-1 truncate text-[22px] font-black leading-tight">
              {title}
            </h2>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full text-dim outline-none transition-colors hover:bg-white/[0.08] focus-visible:bg-white/10">
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-3",
            footer === undefined ? SAFE_PAD : "pb-4",
            className,
          )}>
          {children}
        </div>
        {footer !== undefined && (
          <div className={cn("shrink-0 border-t border-glass px-5 pt-3", SAFE_PAD)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
