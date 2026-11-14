"use client";

import { type CSSProperties, useLayoutEffect, useState } from "react";

import { useDealStore } from "@/modules/table/state/deal-store";
import type { Room } from "@/modules/table/types";
import { dealOrder } from "@/modules/table/utils/deal-order";
import { type OvalLayout, seatPosition } from "@/modules/table/utils/seat-layout";

import s from "./card-deal.module.css";

/** She riffles long enough to see the shuffle, then pitches cards one at a time. */
const SHUFFLE_MS = 2800;
/** Flight time of one card from her hand to a seat. */
export const THROW_MS = 600;
/** Time between two cards leaving her hand (one wrist flick each). */
export const DEAL_GAP_MS = 560;

type Flight = {
  key: string;
  phase: "shuffle" | "deal";
  cards: { seat: number; delay: number; n: number }[];
};

export type DealMode = "idle" | "shuffle" | "deal";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A staged throw from the card fan to the receiving player's cards. Longer
 * throws rise higher, so a card sent to the far side does not slide flat over
 * the felt. The final point is the card shelf above the avatar, not its centre.
 */
const throwStyle = (
  from: { x: number; y: number },
  seat: { x: number; y: number },
  tileH: number,
  n: number,
): CSSProperties => {
  const to = { x: seat.x, y: seat.y - tileH * 0.37 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const step = clamp(distance * 0.12, 14, 28);
  const ux = distance === 0 ? 0 : dx / distance;
  const uy = distance === 0 ? 0 : dy / distance;
  const lift = clamp(distance * 0.18, 24, 72);
  const spin = n % 2 === 0 ? -1 : 1;

  return {
    "--x0": `${from.x}px`,
    "--y0": `${from.y}px`,
    "--x-launch": `${from.x + ux * step}px`,
    "--y-launch": `${from.y + uy * step - 8}px`,
    "--x-apex": `${from.x + dx * 0.52}px`,
    "--y-apex": `${from.y + dy * 0.52 - lift}px`,
    "--x-approach": `${from.x + dx * 0.88}px`,
    "--y-approach": `${from.y + dy * 0.88 - lift * 0.32}px`,
    "--x1": `${to.x}px`,
    "--y1": `${to.y}px`,
    "--r-launch": `${spin * 4}deg`,
    "--r-apex": `${spin * 22}deg`,
    "--r-approach": `${spin * 38}deg`,
    "--r-land": `${spin * 48}deg`,
  } as CSSProperties;
};

/**
 * Last hand this page has seen, kept across remounts of the table (switching
 * screens must not replay a deal). `undefined` until the first hand.
 */
let lastSeenHand: string | null | undefined;

/** Just dealt: still preflop and nobody has acted beyond posting blinds. */
const isFreshHand = (hand: Room["hand"]) =>
  hand !== null &&
  hand.street === 0 &&
  hand.result === undefined &&
  hand.players.every((p) => p.lastAction === null || /^(SB|BB) /.test(p.lastAction));

/**
 * When a new hand starts she shuffles, then deals the hole cards in real order
 * (clockwise from the player left of the button, one per round). Seats only
 * show cards that have landed. A hand already on screen when the table opens
 * is not dealt again.
 */
export const useDealerDeal = (room: Room) => {
  const [flight, setFlight] = useState<Flight | null>(null);
  const hand = room.hand;
  const handKey = hand ? `${room.code}:${hand.handNumber}` : null;
  const dealSeats = hand?.players.map((p) => p.seat).join(",") ?? "";
  const buttonSeat = hand?.buttonSeat ?? 0;
  const holeCards = hand?.holeCards ?? 0;
  const fresh = isFreshHand(hand);

  // Layout effect: hide the new hand's cards before the browser paints them.
  useLayoutEffect(() => {
    const isNew = handKey !== null && handKey !== lastSeenHand;
    lastSeenHand = handKey;
    // A hand already under way (e.g. after a reload) is not dealt again.
    if (!isNew || !handKey || !fresh) {
      return;
    }
    const seats = dealSeats.split(",").filter(Boolean).map(Number);
    const order = dealOrder(seats, buttonSeat, holeCards);
    const deal = useDealStore.getState();
    deal.start(seats);
    // Synchronous on purpose: the cards must be hidden in this same frame.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlight({
      key: handKey,
      phase: "shuffle",
      cards: order.map((seat, i) => ({ seat, delay: i * DEAL_GAP_MS, n: i })),
    });

    let done = false;
    const timers = [
      window.setTimeout(() => {
        setFlight((prev) =>
          prev?.key === handKey ? { ...prev, phase: "deal" } : prev,
        );
      }, SHUFFLE_MS),
      ...order.map((seat, i) =>
        window.setTimeout(
          () => useDealStore.getState().land(seat),
          SHUFFLE_MS + i * DEAL_GAP_MS + THROW_MS,
        ),
      ),
      window.setTimeout(
        () => {
          done = true;
          setFlight((prev) => (prev?.key === handKey ? null : prev));
          useDealStore.getState().finish();
        },
        SHUFFLE_MS + Math.max(0, order.length - 1) * DEAL_GAP_MS + THROW_MS + 80,
      ),
    ];
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      useDealStore.getState().finish();
      if (!done) {
        // Interrupted mid-deal (the hand's seats changed, or the table left the
        // screen): stop showing it, and deal again from the start if the hand
        // is still fresh when the effect runs next.
        lastSeenHand = null;
        setFlight((prev) => (prev?.key === handKey ? null : prev));
      }
    };
    // `fresh` is read once, when the hand first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handKey, dealSeats, buttonSeat, holeCards]);

  const mode: DealMode = flight ? flight.phase : "idle";
  return {
    mode,
    throws: flight?.cards.length ?? 0,
    flight,
  };
};

/** The riffle in her hands, then the cards travelling out to the seats in order. */
export const FlyingCards = ({
  flight,
  layout,
  from,
  riffle = true,
}: {
  flight: Flight | null;
  layout: OvalLayout;
  from: { x: number; y: number };
  /** Show a riffling deck while she shuffles (off when the dealer draws her own). */
  riffle?: boolean;
}) => {
  if (!flight) {
    return null;
  }
  if (flight.phase === "shuffle") {
    if (!riffle) {
      return null;
    }
    return (
      <span aria-hidden className={s.deck} style={{ left: from.x, top: from.y }}>
        <i />
        <i />
        <i />
      </span>
    );
  }
  return (
    <>
      {flight.cards.map((card) => {
        const seat = seatPosition(layout, card.seat);
        return (
          <span
            key={`${flight.key}-${card.n}`}
            aria-hidden
            className={s.card}
            style={{
              ...throwStyle(from, seat, layout.tileH, card.n),
              animationDuration: `${THROW_MS}ms`,
              animationDelay: `${card.delay}ms`,
            }}
          />
        );
      })}
    </>
  );
};
