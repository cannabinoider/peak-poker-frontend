"use client";

import { useSyncExternalStore } from "react";

import { inviteLink } from "../utils";

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

const noop = () => undefined;
const subscribeNothing = () => noop;

/** This room's share link from the current URL (null without the invite secret). */
export const useInviteLink = (code: string) =>
  useSyncExternalStore(
    subscribeHash,
    () => inviteLink(window.location.origin, code, window.location.hash),
    () => null,
  );

/** Whether the browser has the native share sheet. */
export const useCanShare = () =>
  useSyncExternalStore(
    subscribeNothing,
    () => typeof navigator.share === "function",
    () => false,
  );
