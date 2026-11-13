import { PlayingCard } from "@/lib/components/playing-card";
import type { Hand, HandResult } from "@/modules/table/types";
import { boardMark, boardWildRanks } from "@/modules/table/utils/marks";
import { usedPerBoard } from "@/modules/table/utils/results";

import { BoardDot } from "./board-dot";
import { Icon } from "./icons";

type MultiBoardProps = {
  hand: Hand;
  cardW: number;
  result: HandResult | undefined;
};

/**
 * Stacked boards (rows), each with its own wild card at the end: wild on that
 * row, poison on the others (Flutter `_MultiBoard`).
 */
export const MultiBoard = ({ hand, cardW, result }: MultiBoardProps) => {
  const w = hand.boards.length > 2 ? cardW * 0.78 : cardW * 0.88;
  const perBoard = Math.floor(hand.boardSize / hand.boards.length);
  const wilds = boardWildRanks(hand);
  const used = usedPerBoard(result);
  return (
    <div className="flex flex-col items-center">
      {hand.boards.map((board, b) => (
        <div key={b} className="flex items-center py-0.5" aria-label={`Board ${b + 1}`}>
          <span className="mr-1">
            <BoardDot board={b} />
          </span>
          {Array.from({ length: perBoard }, (_, i) => (
            <div key={i} className="p-[1.5px]">
              {i < board.length ? (
                <PlayingCard
                  card={board[i]}
                  width={w}
                  mark={boardMark(wilds, b, board[i])}
                  highlight={used.get(b)?.has(board[i]) ?? false}
                />
              ) : (
                <PlayingCard width={w} placeholder />
              )}
            </div>
          ))}
          <div className="ml-1.5">
            {b < hand.boardWilds.length ? (
              <PlayingCard card={hand.boardWilds[b]} width={w} mark="wild" />
            ) : (
              <div
                role="img"
                aria-label={`Board ${b + 1} wild card, not open yet`}
                className="flex items-center justify-center border-[1.2px] border-gold text-gold/70"
                style={{ width: w, height: w * 1.4, borderRadius: w * 0.14 }}>
                <Icon name="sparkle" size={w * 0.45} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
