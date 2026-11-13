"use client";

import Link from "next/link";
import { useState } from "react";

import { GoldButton } from "@/lib/components/button";

import { GameBuilderSheet } from "./components/game-builder-sheet";
import { BackIcon, BroadcastIcon } from "./components/icons";
import { SetupMessage } from "./components/setup-message";
import { useSetupForm } from "./hooks/use-setup-form";
import { BuyInSection } from "./sections/buy-in-section";
import { GamesSection } from "./sections/games-section";
import { RebuysSection } from "./sections/rebuys-section";
import { RoomNameSection } from "./sections/room-name-section";
import { SummaryCard } from "./sections/summary-card";
import { TurnTimeSection } from "./sections/turn-time-section";

/** "New room": money, chips, games and rules for tonight, then create the room. */
export const CreateRoom = () => {
  const api = useSetupForm();
  const { form, setup, validation, creating, createErrors, update } = api;
  const [builderOpen, setBuilderOpen] = useState(false);
  const canCreate = validation.errors.length === 0 && !creating;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] lg:max-w-6xl lg:px-8">
      <Link
        href="/"
        aria-label="Back to home"
        className="-ml-2 inline-flex size-12 items-center justify-center self-start rounded-full text-text outline-none hover:bg-white/[0.08] focus-visible:bg-white/10">
        <span aria-hidden className="inline-flex size-6 [&>svg]:size-full">
          <BackIcon />
        </span>
      </Link>
      <h1 className="text-[30px] font-black leading-tight tracking-[-0.5px]">
        New room
      </h1>
      <p className="text-dim">Set the money, chips and games for tonight</p>

      <div className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
        <div>
          <div className="mt-4 lg:mt-0">
            <RoomNameSection
              value={form.roomName}
              onChange={(roomName) => update({ roomName })}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <BuyInSection {...api} />
            <GamesSection {...api} onCreateGame={() => setBuilderOpen(true)} />
            <div className="flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:gap-8">
              <RebuysSection
                value={form.rebuyRule}
                onChange={(rebuyRule) => update({ rebuyRule })}
              />
              <TurnTimeSection
                value={form.turnSeconds}
                onChange={(turnSeconds) => update({ turnSeconds })}
              />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6">
          <div className="mt-6 lg:mt-0">
            <SummaryCard setup={setup} />
            <div role="status" aria-live="polite">
              {validation.errors.map((e) => (
                <SetupMessage key={e} tone="error">
                  {e}
                </SetupMessage>
              ))}
              {validation.warnings.map((w) => (
                <SetupMessage key={w} tone="warning">
                  {w}
                </SetupMessage>
              ))}
            </div>
            <div role="alert">
              {createErrors.map((e) => (
                <SetupMessage key={e} tone="error">
                  {e}
                </SetupMessage>
              ))}
            </div>
          </div>

          <GoldButton
            className="mt-5 w-full"
            icon={<BroadcastIcon />}
            loading={creating}
            disabled={!canCreate}
            onClick={() => void api.submit()}>
            {creating ? "Creating…" : "Create room"}
          </GoldButton>
          <p className="mt-2.5 text-center text-sm text-faint">
            Next you&apos;ll pick your name and get the invite link to share.
          </p>
        </aside>
      </div>

      {builderOpen && (
        <GameBuilderSheet
          onAdd={api.addCustomGame}
          onClose={() => setBuilderOpen(false)}
        />
      )}
    </main>
  );
};
