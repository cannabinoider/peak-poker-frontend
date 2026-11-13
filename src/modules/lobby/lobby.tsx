"use client";

import { RebuyRequests } from "@/modules/ledger";
import type { StateMessage, WelcomeMessage } from "@/modules/table/api/contracts";

import { LobbyHeader } from "./sections/lobby-header";
import { PlayersSection } from "./sections/players-section";
import { SetupSection } from "./sections/setup-section";
import { ShareSection } from "./sections/share-section";
import { StartSection } from "./sections/start-section";

export interface LobbyProps {
  room: StateMessage;
  me: WelcomeMessage;
}

/**
 * Before the game starts, for everyone in the room: the room code and invite
 * (QR, copy, share), who is seated (banker badge, make banker), the table
 * setup, and Start game for the banker. Wide screens put the invite on the
 * left and the players and setup on the right.
 */
export const Lobby = ({ room, me }: LobbyProps) => (
  <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] lg:max-w-5xl lg:px-8">
    <LobbyHeader room={room} />
    <div className="lg:grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pt-4">
      <div className="pt-4 lg:sticky lg:top-6 lg:pt-0">
        <ShareSection code={room.code} />
      </div>
      <div>
        <PlayersSection room={room} me={me} />
        <RebuyRequests room={room} className="pt-3" />
        <SetupSection setup={room.setup} />
        <div className="pt-6">
          <StartSection room={room} me={me} />
        </div>
      </div>
    </div>
  </main>
);
