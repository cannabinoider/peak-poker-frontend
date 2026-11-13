"use client";

import { useEffect, useRef, useState } from "react";

import { OutlineButton } from "@/lib/components/button";

import { SHARE_TEXT } from "../constants";
import { useCanShare } from "../hooks/use-invite-link";

import { CheckIcon, CopyIcon, ShareIcon } from "./icons";

type ShareButtonsProps = {
  link: string;
  code: string;
};

/** Copy link + the phone's native share sheet (when the browser has one). */
export const ShareButtons = ({ link, code }: ShareButtonsProps) => {
  const canShare = useCanShare();
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopy("idle"), 2000);
  };

  const onShare = async () => {
    try {
      await navigator.share({
        title: "Peak Poker",
        text: `${SHARE_TEXT} (room ${code})`,
        url: link,
      });
    } catch {
      // Closed the share sheet, or sharing isn't allowed here: nothing to do.
    }
  };

  return (
    <div className="flex gap-2.5">
      <OutlineButton
        height={44}
        icon={copy === "copied" ? <CheckIcon /> : <CopyIcon />}
        onClick={onCopy}
        aria-live="polite">
        {copy === "copied"
          ? "Copied"
          : copy === "failed"
            ? "Couldn't copy"
            : "Copy link"}
      </OutlineButton>
      {canShare && (
        <OutlineButton height={44} icon={<ShareIcon />} onClick={onShare}>
          Share
        </OutlineButton>
      )}
    </div>
  );
};
