"use client";

import { QRCodeSVG } from "qrcode.react";

import { Glass } from "@/lib/components/glass";

import { ShareButtons } from "../components/share-buttons";
import { NO_INVITE_TEXT } from "../constants";
import { useInviteLink } from "../hooks/use-invite-link";

/**
 * Invite friends: QR code + link with Copy / Share. Only a device that opened
 * the full invite link (secret in the URL hash) can show it; others see the
 * code and a hint to ask the host.
 */
export const ShareSection = ({ code }: { code: string }) => {
  const link = useInviteLink(code);

  if (!link) {
    return (
      <Glass className="text-center">
        <p className="text-dim">{NO_INVITE_TEXT}</p>
      </Glass>
    );
  }
  return (
    <Glass padding={20} className="flex flex-col items-center">
      <div className="rounded-panel bg-white p-3.5">
        <QRCodeSVG
          value={link}
          size={200}
          level="M"
          title={`Invite link for room ${code}`}
          className="block size-[min(200px,55vw)]"
        />
      </div>
      <p className="pt-3.5 text-dim">Scan with the phone camera, or send the link</p>
      <p className="w-full break-all pb-3.5 pt-1 text-center text-sm font-semibold">
        {link}
      </p>
      <div className="w-full">
        <ShareButtons link={link} code={code} />
      </div>
    </Glass>
  );
};
