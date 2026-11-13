import { Spinner } from "@/lib/components/button";
import { Pill } from "@/lib/components/pill";
import { fmt } from "@/lib/utils/format";
import { CountdownText } from "@/modules/table/components/countdown-text";
import { MultiBoard } from "@/modules/table/components/multi-board";
import { SingleBoard } from "@/modules/table/components/single-board";
import type { Room } from "@/modules/table/types";
import { resultLines, winningCards } from "@/modules/table/utils/results";
import { nameOf, youAreChoosing } from "@/modules/table/utils/room";

type CenterInfoProps = {
  room: Room;
  cardW: number;
  /** Room for the board between the side seats, in px. */
  maxWidth: number;
};

/** Middle of the felt: the board(s), the pot(s), then who won (Flutter `_CenterInfo`). */
export const CenterInfo = ({ room, cardW, maxWidth }: CenterInfoProps) => {
  const hand = room.hand;
  const choosing = room.choosing;

  if (choosing && !youAreChoosing(room)) {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <Spinner className="size-[22px] text-gold" />
        <p className="mt-2.5 font-bold text-white">
          {nameOf(room, choosing.seat)} is choosing the game
        </p>
        <CountdownText seconds={choosing.secondsLeft} className="text-dim" />
      </div>
    );
  }

  if (!hand) {
    return <p className="text-center text-dim">Waiting for players…</p>;
  }

  const result = hand.result;
  const pots = hand.pots ?? [];
  // Scale the board down to fit between the side seats (Flutter `FittedBox`).
  const naturalW =
    hand.boards.length > 1
      ? 22 + (hand.boardSize / hand.boards.length + 1) * (cardW * 0.88 + 3) + 6
      : hand.boardSize * (cardW + 4) + (hand.special !== "none" ? cardW + 16 : 0);
  const scale = Math.min(1, maxWidth / naturalW);
  const multi = hand.boards.length > 1;

  return (
    <div className="flex flex-col items-center" style={{ maxWidth }}>
      <div style={{ zoom: scale }}>
        {multi ? (
          <MultiBoard hand={hand} cardW={cardW} result={result} />
        ) : (
          <SingleBoard hand={hand} cardW={cardW} winning={winningCards(result)} />
        )}
      </div>
      <div className="mt-2 flex flex-col items-center gap-[3px]" aria-live="polite">
        {!result ? (
          <>
            <Pill fontSize={14} color="rgb(0 0 0 / 0.35)">
              POT {fmt(hand.pot)}
            </Pill>
            {pots.length > 1 &&
              pots.map((p, i) => (
                <p
                  key={i}
                  className="tabular line-clamp-2 text-center text-[11px] text-dim">
                  {i === 0 ? "Main" : `Side ${i}`} {fmt(p.amount)} ·{" "}
                  {p.eligibleSeats.map((s) => nameOf(room, s)).join(", ")}
                </p>
              ))}
          </>
        ) : (
          resultLines(room, result, hand).map((line, i) => (
            <p
              key={i}
              className="max-w-full text-balance break-words px-1 text-center text-[13px] font-bold leading-snug text-gold">
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
};
