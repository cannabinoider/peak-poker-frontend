import { PlayingCard } from "@/lib/components/playing-card";
import type { Hand } from "@/modules/table/types";
import { markFor } from "@/modules/table/utils/marks";

import { SpecialSlot } from "./special-slot";

type SingleBoardProps = {
  hand: Hand;
  cardW: number;
  /** Cards the winners used (gold glow). */
  winning: Set<string>;
};

/** The community cards, empty slots for those still to come, and the special card. */
export const SingleBoard = ({ hand, cardW, winning }: SingleBoardProps) => (
  <div className="flex items-center" aria-label="Board">
    {Array.from({ length: hand.boardSize }, (_, i) => (
      <div key={i} className="p-0.5">
        {i < hand.board.length ? (
          <PlayingCard
            card={hand.board[i]}
            width={cardW}
            highlight={winning.has(hand.board[i])}
            mark={markFor(hand, hand.board[i])}
          />
        ) : (
          <PlayingCard width={cardW} placeholder />
        )}
      </div>
    ))}
    {hand.special !== "none" && (
      <div className="ml-2">
        <SpecialSlot hand={hand} cardW={cardW} />
      </div>
    )}
  </div>
);
