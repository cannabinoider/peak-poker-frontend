"use client";

import { GoldButton, OutlineButton } from "@/lib/components/button";
import { fmt, rupees } from "@/lib/utils/format";
import { CountdownText } from "@/modules/table/components/countdown-text";
import { DiscardPicker } from "@/modules/table/components/discard-picker";
import { Hint } from "@/modules/table/components/hint";
import { Icon } from "@/modules/table/components/icons";
import { RelieveBankerButton } from "@/modules/table/components/relieve-banker";
import { SplitPicker } from "@/modules/table/components/split-picker";
import { useDealStore } from "@/modules/table/state/deal-store";
import { useGameStore } from "@/modules/table/state/game-store";
import type { Room } from "@/modules/table/types";
import { markFor } from "@/modules/table/utils/marks";
import {
  canManage,
  isComplete,
  nameOf,
  playerOf,
  rebuyState,
  seatOf,
  youAreChoosing,
} from "@/modules/table/utils/room";

import { ActionBar } from "./action-bar";
import { DealerPicker } from "./dealer-picker";

const plural = (n: number, word: string) =>
  `${n} player${n === 1 ? "" : "s"} to ${word}`;

/** What you can do right now (the lower half of Flutter `_BottomPanel`). */
export const Controls = ({
  room,
  celebrating = false,
}: {
  room: Room;
  celebrating?: boolean;
}) => {
  const act = useGameStore((s) => s.act);
  const discard = useGameStore((s) => s.discard);
  const split = useGameStore((s) => s.split);
  const choose = useGameStore((s) => s.choose);
  const rebuy = useGameStore((s) => s.rebuy);
  const setSittingOut = useGameStore((s) => s.setSittingOut);
  const dealNow = useGameStore((s) => s.dealNow);
  const cardsAreDealing = useDealStore((s) => s.landed !== null);

  const you = room.yourSeat;
  const hand = room.hand;
  const mine = playerOf(hand, you);
  const seat = you === null ? undefined : seatOf(room, you);
  const stack = mine?.stack ?? seat?.stack ?? 0;
  const hole = mine?.hole ?? [];
  const complete = isComplete(hand);
  const choosing = room.choosing;

  // Sitting out starts next hand: while still in this hand, keep the normal controls.
  if (seat?.sittingOut && !room.settlement && (!mine || complete)) {
    return (
      <GoldButton icon={<Icon name="login" />} onClick={() => setSittingOut(false)}>
        I&apos;m back — deal me in
      </GoldButton>
    );
  }

  const rebuyNow = rebuyState(room);
  switch (rebuyNow.kind) {
    case "pending":
      return (
        <div className="flex w-full flex-col items-center gap-2">
          <Hint>Rebuy requested — waiting for the banker…</Hint>
          <RelieveBankerButton bankerAway={room.bankerAway} />
        </div>
      );
    case "voting":
      return (
        <Hint>
          Rebuy requested — waiting for votes ({rebuyNow.approve}/{rebuyNow.needed})
        </Hint>
      );
    case "limit":
      return (
        <Hint>
          {rebuyNow.noRebuys
            ? "You are out of chips (no rebuys at this table)"
            : "You are out of chips (rebuy limit reached)"}
        </Hint>
      );
    case "offer":
      return (
        <GoldButton icon={<Icon name="add" />} onClick={rebuy}>
          Rebuy · {fmt(rebuyNow.chips)} chips for {rupees(rebuyNow.rupees)}
        </GoldButton>
      );
    case "ending":
    case "none":
      break;
  }

  if (choosing && youAreChoosing(room)) {
    return (
      <DealerPicker
        key={`pick${hand?.handNumber ?? 0}`}
        choosing={choosing}
        onDeal={(c) =>
          choose({
            game: c.game,
            betting: c.betting,
            special: c.special,
            specialStreet: c.specialStreet,
            discard: c.discard,
          })
        }
      />
    );
  }
  if (choosing) {
    return <Hint>{nameOf(room, choosing.seat)} is choosing the game…</Hint>;
  }
  if (hand && you !== null && hand.splitting.includes(you)) {
    return (
      <SplitPicker
        key={`split${hand.handNumber}`}
        hand={hand}
        hole={hole}
        onSplit={split}
      />
    );
  }
  if (hand && hand.splitting.length > 0) {
    return (
      <Hint>Waiting for {plural(hand.splitting.length, "split their cards")}…</Hint>
    );
  }
  if (hand && you !== null && hand.discarding.includes(you)) {
    return (
      <DiscardPicker
        key={`discard${hand.handNumber}`}
        hole={hole}
        markOf={(c) => markFor(hand, c)}
        onDiscard={discard}
      />
    );
  }
  if (hand && hand.discarding.length > 0) {
    return <Hint>Waiting for {plural(hand.discarding.length, "discard")}…</Hint>;
  }
  if (hand?.legal && mine) {
    return (
      <ActionBar
        key={`${hand.handNumber}/${hand.street}/${hand.legal.minRaiseTo}`}
        legal={hand.legal}
        hand={hand}
        you={mine}
        disabled={cardsAreDealing}
        onAct={act}
      />
    );
  }
  if (hand && !complete) {
    const actor = hand.toActSeat === null ? undefined : seatOf(room, hand.toActSeat);
    return (
      <Hint>
        {!mine ? "You join next hand" : actor ? `Waiting for ${actor.name}…` : ""}
      </Hint>
    );
  }
  if (stack === 0) {
    return <Hint>You are out of chips</Hint>;
  }
  if (room.paused) {
    return (
      <Hint>
        {canManage(room)
          ? "Paused — open the menu and tap Resume dealing"
          : "Game paused by the banker"}
      </Hint>
    );
  }
  if (room.nextHandIn !== undefined && celebrating) {
    return <Hint>And the winner is…</Hint>;
  }
  if (room.nextHandIn !== undefined) {
    return (
      <div className="flex min-h-[52px] items-center justify-center gap-3">
        <p role="status" className="text-dim">
          Next hand in&nbsp;
          <CountdownText
            seconds={room.nextHandIn}
            className="font-extrabold text-gold"
          />
        </p>
        {canManage(room) && (
          <OutlineButton
            height={44}
            fullWidth={false}
            className="px-4"
            onClick={dealNow}>
            Deal now
          </OutlineButton>
        )}
      </div>
    );
  }
  return <Hint>Next hand starting…</Hint>;
};
