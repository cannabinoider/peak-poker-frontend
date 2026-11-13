"use client";

import { RebuyVoteRequest } from "@/modules/table/components/rebuy-vote-request";
import { useGameStore } from "@/modules/table/state/game-store";
import { rebuyRequestsForYou, rebuyVotesForYou } from "@/modules/table/utils/room";

import { RebuyRequest } from "../components/rebuy-request";
import type { Room } from "../types";

const nameAt = (room: Room, seat: number) =>
  room.seats.find((s) => s.seat === seat)?.name ?? `Seat ${seat + 1}`;

const nextBuyIn = (room: Room, seat: number) =>
  (room.ledger.find((l) => l.seat === seat)?.buyIns ?? 1) + 1;

/**
 * Pending rebuy requests with Approve / Deny, shown only to the owner or
 * banker (who the server lets decide; never their own), plus the broke
 * banker's own rebuy for the other players to vote on. Renders nothing otherwise.
 */
export const RebuyRequests = ({
  room,
  className,
}: {
  room: Room;
  className?: string;
}) => {
  const decideRebuy = useGameStore((s) => s.decideRebuy);
  const voteRebuy = useGameStore((s) => s.voteRebuy);
  const requests = rebuyRequestsForYou(room);
  const votes = rebuyVotesForYou(room);
  if (requests.length === 0 && votes.length === 0) {
    return null;
  }
  return (
    <div className={className}>
      <ul className="space-y-2.5" aria-label="Rebuy requests">
        {requests.map((seat) => (
          <li key={seat}>
            <RebuyRequest
              name={nameAt(room, seat)}
              buyIn={nextBuyIn(room, seat)}
              onDecide={(approve) => decideRebuy(seat, approve)}
            />
          </li>
        ))}
        {votes.map((v) => (
          <li key={`vote${v.seat}`}>
            <RebuyVoteRequest
              name={nameAt(room, v.seat)}
              buyIn={nextBuyIn(room, v.seat)}
              approve={v.approve}
              needed={v.needed}
              yourVote={v.yourVote}
              onVote={(approve) => voteRebuy(v.seat, approve)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
