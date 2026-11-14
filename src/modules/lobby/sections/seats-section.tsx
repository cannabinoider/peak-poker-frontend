"use client";

import { useState } from "react";

import { Avatar, isAnimal } from "@/lib/components/avatar";
import { SeatRing } from "@/lib/components/seat-ring";
import { SectionTitle } from "@/lib/components/section-title";
import { cn } from "@/lib/utils/styles";
import { useGameStore } from "@/modules/table/state/game-store";

import type { Me, Room } from "../types";
import { lobbyRoles } from "../utils";

const ring = "outline-none focus-visible:ring-2 focus-visible:ring-gold/60";

/**
 * Before the start, the seating around the table. Anyone taps an empty seat to
 * move there. The owner or banker taps a player, then a seat, to move them
 * there (or swap, if it's taken). Seats are fixed once the game starts.
 */
export const SeatsSection = ({ room, me }: { room: Room; me: Me }) => {
  const moveSeat = useGameStore((s) => s.moveSeat);
  const { canPickBanker: canArrange } = lobbyRoles(room, me);
  const [picked, setPicked] = useState<number | null>(null);
  const pickedSeat = room.seats.find((s) => s.seat === picked) ?? null;

  const tapSeat = (i: number) => {
    const taken = room.seats.some((s) => s.seat === i);
    if (canArrange && pickedSeat) {
      if (i !== pickedSeat.seat) {
        moveSeat(i, pickedSeat.seat);
      }
      setPicked(null);
    } else if (canArrange && taken) {
      setPicked(i);
    } else if (!taken) {
      moveSeat(i);
    }
  };

  return (
    <section className="pt-5">
      <SectionTitle>Seating</SectionTitle>
      <p className="pb-2 text-faint">
        {pickedSeat
          ? `Tap a seat to move ${pickedSeat.name} there, or another player to swap.`
          : canArrange
            ? "Tap an empty seat to sit there, or a player and then a seat to move them."
            : "Tap an empty seat to sit there."}
      </p>
      <SeatRing
        count={room.maxSeats}
        center="Seats lock when the game starts"
        renderSeat={(i) => {
          const s = room.seats.find((x) => x.seat === i);
          const isYou = s?.seat === me.seat;
          if (!s) {
            return (
              <button
                type="button"
                onClick={() => tapSeat(i)}
                aria-label={
                  pickedSeat
                    ? `Move ${pickedSeat.name} to seat ${i + 1}`
                    : `Sit in seat ${i + 1}`
                }
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 border-dashed text-sm transition-colors",
                  pickedSeat
                    ? "border-gold/70 text-gold"
                    : "border-white/25 text-faint hover:border-white/50",
                  ring,
                )}>
                {i + 1}
              </button>
            );
          }
          const avatar = (
            <span
              className={cn(
                "inline-flex rounded-full",
                picked === i && "ring-2 ring-gold ring-offset-2 ring-offset-bg-top",
                isYou && picked !== i && "ring-2 ring-white/50",
                !s.connected && "opacity-40",
              )}>
              <Avatar
                name={s.name}
                seat={s.seat}
                size={40}
                animal={isAnimal(s.animal) ? s.animal : null}
              />
            </span>
          );
          const label = (
            <span className="mt-0.5 block max-w-[64px] truncate text-center text-[11px]">
              {isYou ? "You" : s.name}
            </span>
          );
          return canArrange ? (
            <button
              type="button"
              onClick={() => tapSeat(i)}
              aria-pressed={picked === i}
              aria-label={
                pickedSeat && picked !== i
                  ? `Swap ${pickedSeat.name} with ${s.name}`
                  : `${s.name}, seat ${i + 1}. Move`
              }
              className={cn("flex flex-col items-center rounded-input", ring)}>
              {avatar}
              {label}
            </button>
          ) : (
            <div
              className="flex flex-col items-center"
              role="group"
              aria-label={`${s.name}, seat ${i + 1}`}>
              {avatar}
              {label}
            </div>
          );
        }}
      />
    </section>
  );
};
