import Link from "next/link";

import { Pill } from "@/lib/components/pill";
import { SectionTitle } from "@/lib/components/section-title";
import { fmt } from "@/lib/utils/format";
import { blindsLabel } from "@/modules/rules";

import { BackIcon } from "../components/icons";
import type { Room } from "../types";
import { gameLabel } from "../utils";

/** Back link, game / stakes pills, room name and the big room code. */
export const LobbyHeader = ({ room }: { room: Room }) => (
  <header>
    <div className="flex items-center gap-1.5">
      <Link
        href="/"
        aria-label="Home"
        className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-none hover:bg-white/[0.08] focus-visible:bg-white/10">
        <BackIcon className="size-6" />
      </Link>
      <div className="ml-auto flex min-w-0 items-center gap-1.5">
        <Pill className="min-w-0">{gameLabel(room.setup)}</Pill>
        <Pill className="shrink-0">
          ₹{fmt(room.setup.buyInRupees)} · {blindsLabel(room.setup)}
        </Pill>
      </div>
    </div>
    <h1 className="truncate pt-2 text-center text-xl font-extrabold">
      {room.name || "Peak Poker table"}
    </h1>
    <SectionTitle as="p" className="pb-0 pt-3 text-center">
      Room code
    </SectionTitle>
    <p className="pl-[0.27em] text-center text-[clamp(1.75rem,11vw,2.75rem)] font-black leading-tight tracking-[0.27em] text-gold">
      {room.code}
    </p>
  </header>
);
