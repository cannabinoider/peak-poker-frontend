/**
 * Open sheets, bottom to top. Only the top one answers Escape and keeps focus,
 * so a confirm sheet can open over another sheet. Page scroll stays locked
 * while any sheet is open.
 */
const stack: symbol[] = [];
let savedOverflow = "";

export const pushSheet = (id: symbol) => {
  if (stack.length === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  stack.push(id);
};

export const popSheet = (id: symbol) => {
  const i = stack.indexOf(id);
  if (i >= 0) {
    stack.splice(i, 1);
  }
  if (stack.length === 0) {
    document.body.style.overflow = savedOverflow;
  }
};

export const isTopSheet = (id: symbol) => stack.at(-1) === id;

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Visible, focusable elements inside `root`, in tab order. */
export const focusableIn = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.getClientRects().length > 0,
  );
