"use client";

import { useRouter } from "next/navigation";

import { GoldButton } from "@/lib/components/button";
import { Glass } from "@/lib/components/glass";

type RoomClosedProps = {
  code: string;
  reason: string;
};

/** Shown once the server closed the room for good (the host closed it, or it expired). */
export const RoomClosed = ({ code, reason }: RoomClosedProps) => {
  const router = useRouter();
  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
      <Glass className="flex flex-col items-center gap-3 text-center">
        <span className="tabular text-lg font-black tracking-[3px] text-gold">
          {code}
        </span>
        <h1 className="text-2xl font-black text-text">Room closed</h1>
        <p role="status" className="text-dim">
          {reason}
        </p>
        <GoldButton className="mt-3" onClick={() => router.push("/")}>
          Back to home
        </GoldButton>
      </Glass>
    </main>
  );
};
