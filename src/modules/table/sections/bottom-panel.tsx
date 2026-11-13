"use client";

import { Avatar, isAnimal } from "@/lib/components/avatar";
import { Pill } from "@/lib/components/pill";
import { fmt, rupees } from "@/lib/utils/format";
import { CashOutRequests } from "@/modules/table/components/cash-out-request";
import { Icon } from "@/modules/table/components/icons";
import { PrivateCards } from "@/modules/table/components/private-cards";
import { RebuyRequest } from "@/modules/table/components/rebuy-request";
import { RebuyVoteRequest } from "@/modules/table/components/rebuy-vote-request";
import { RelieveBankerButton } from "@/modules/table/components/relieve-banker";
import { TimeUpBanner } from "@/modules/table/components/time-up-banner";
import { TurnBar } from "@/modules/table/components/turn-bar";
import { WIDE_QUERY } from "@/modules/table/constants";
import { useMediaQuery } from "@/modules/table/hooks/use-media-query";
import { useShowingMyCards } from "@/modules/table/state/card-privacy-store";
import { useGameStore } from "@/modules/table/state/game-store";
import type { Room } from "@/modules/table/types";
import { markFor } from "@/modules/table/utils/marks";
import { bestHandLabel } from "@/modules/table/utils/my-hand";
import { handLabel } from "@/modules/table/utils/results";
import {
  canAskMoreTime,
  cashOutState,
  isComplete,
  isDeciding,
  ledgerFor,
  nameOf,
  playerOf,
  rebuyRequestsForYou,
  rebuyVotesForYou,
  rupeesFor,
  seatOf,
  youAreChoosing,
} from "@/modules/table/utils/room";

import { Controls } from "./controls";

/** Your cards, chips, turn timer and controls, pinned to the bottom (Flutter `_BottomPanel`). */
export const BottomPanel = ({
  room,
  celebrating,
}: {
  room: Room;
  /** The winner celebration is on: the next-hand countdown waits for it. */
  celebrating: boolean;
}) => {
  const askMoreTime = useGameStore((s) => s.askMoreTime);
  const decideRebuy = useGameStore((s) => s.decideRebuy);
  const voteRebuy = useGameStore((s) => s.voteRebuy);
  const setSittingOut = useGameStore((s) => s.setSittingOut);
  const showing = useShowingMyCards();
  const wide = useMediaQuery(WIDE_QUERY);

  const you = room.yourSeat;
  const hand = room.hand;
  const mine = playerOf(hand, you);
  const seat = you === null ? undefined : seatOf(room, you);
  const stack = mine?.stack ?? seat?.stack ?? 0;
  const folded = mine?.folded ?? false;
  const hole = mine?.hole ?? null;
  const complete = isComplete(hand);
  const showdown = hand?.result !== undefined;

  const shownLabel =
    showdown && hand?.result && you !== null ? handLabel(hand.result, you) : null;
  const bestLabel = shownLabel ?? (hand && !folded ? bestHandLabel(hand, hole) : null);
  const holeCount = hand?.holeCards ?? 2;
  const cardScale = wide ? 1.4 : 1;
  const cardW = (holeCount <= 2 ? 54 : holeCount === 4 ? 42 : 36) * cardScale;
  const picking =
    you !== null &&
    ((hand?.discarding.includes(you) ?? false) ||
      (hand?.splitting.includes(you) ?? false));
  const requests = rebuyRequestsForYou(room);
  const votes = rebuyVotesForYou(room);
  const leaving = cashOutState(room);
  const deciding = you !== null && isDeciding(room, you);
  const canAsk = you !== null && canAskMoreTime(room, you);

  return (
    <section
      aria-label="Your seat"
      className="safe-bottom relative flex w-full min-w-0 flex-col overflow-hidden rounded-t-3xl border-t border-glass bg-[#0B1224]/80 px-4 pt-3.5 backdrop-blur max-lg:min-h-0 max-lg:shrink lg:overflow-visible lg:px-8 lg:pt-5">
      <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col gap-2.5 max-lg:min-h-0 max-lg:flex-1 max-lg:overflow-hidden lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-x-10 lg:pb-3">
        <div className="flex shrink-0 items-center gap-3.5 overflow-x-auto lg:gap-5">
          {hole && hand && !picking ? (
            <PrivateCards
              handKey={`${room.code}/${hand.handNumber}`}
              forceShow={showdown}
              hole={hole}
              cardW={cardW}
              overlap={holeCount <= 2 ? 0.12 : 0.35}
              dimmed={folded}
              markOf={(c) => markFor(hand, c)}
            />
          ) : (
            <Avatar
              name={seat?.name ?? "?"}
              seat={you ?? 0}
              animal={seat && isAnimal(seat.animal) ? seat.animal : null}
              size={44}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className="max-w-full truncate text-base font-extrabold text-white lg:text-xl">
              {seat?.name ?? ""}
            </p>
            <p className="tabular mt-0.5 text-dim lg:text-base">
              {fmt(stack)} chips · {rupees(rupeesFor(room.setup, stack))}
            </p>
            {bestLabel && (showing || showdown) && (
              <Pill tone="green" className="mt-1.5">
                {bestLabel}
              </Pill>
            )}
            {folded && <Pill className="mt-1.5">Folded</Pill>}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2.5 max-lg:flex-1 max-lg:overflow-hidden lg:overflow-visible">
          <div className="flex shrink-0 flex-col gap-2.5">
            {deciding && room.graceSecondsLeft !== undefined ? (
              <TimeUpBanner
                seconds={room.graceSecondsLeft}
                canAsk={canAsk}
                autoText={
                  youAreChoosing(room)
                    ? "the default game is dealt"
                    : (hand?.legal?.canCheck ?? true)
                      ? "you check"
                      : "you fold"
                }
                onMoreTime={askMoreTime}
              />
            ) : (
              deciding &&
              room.turnSecondsLeft !== undefined && (
                <div className="flex items-center gap-2">
                  <TurnBar
                    seconds={room.turnSecondsLeft}
                    total={room.setup.turnSeconds}
                  />
                  {canAsk && (
                    <button
                      type="button"
                      onClick={askMoreTime}
                      aria-label="Ask for 30 more seconds"
                      className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg border border-glass px-3 text-sm font-medium text-white outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-gold/60">
                      <Icon name="timer" size={16} />
                      +30s
                    </button>
                  )}
                </div>
              )
            )}

            <CashOutRequests room={room} />

            {leaving.kind === "pending" && (
              <div className="flex flex-col items-center gap-2">
                <p role="status" className="text-sm text-dim">
                  Waiting for the banker
                </p>
                <RelieveBankerButton bankerAway={room.bankerAway} />
              </div>
            )}
            {leaving.kind === "afterHand" && (
              <p role="status" className="text-sm text-dim">
                You&apos;ll leave with your chips after this hand.
              </p>
            )}

            {requests.map((s) => (
              <RebuyRequest
                key={s}
                name={nameOf(room, s)}
                buyIn={(ledgerFor(room, s)?.buyIns ?? 1) + 1}
                onDecide={(ok) => decideRebuy(s, ok)}
              />
            ))}

            {votes.map((v) => (
              <RebuyVoteRequest
                key={`vote${v.seat}`}
                name={nameOf(room, v.seat)}
                buyIn={(ledgerFor(room, v.seat)?.buyIns ?? 1) + 1}
                approve={v.approve}
                needed={v.needed}
                yourVote={v.yourVote}
                onVote={(ok) => voteRebuy(v.seat, ok)}
              />
            ))}
          </div>

          <div className="flex min-h-0 flex-col max-lg:flex-1 max-lg:overflow-hidden">
            <Controls room={room} celebrating={celebrating} />
          </div>

          {seat?.sittingOut && !room.settlement && mine && !complete && (
            <button
              type="button"
              onClick={() => setSittingOut(false)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-end rounded-full px-3 text-sm font-medium text-gold outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-gold/60">
              <Icon name="login" size={16} />
              Sitting out next hand · I&apos;m back
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
