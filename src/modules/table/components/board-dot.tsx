import { BOARD_COLORS } from "@/modules/table/constants";

/** Numbered colored dot for board `board` (multi-board games). */
export const BoardDot = ({ board }: { board: number }) => (
  <span
    aria-label={`Board ${board + 1}`}
    className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-black leading-none text-black"
    style={{ backgroundColor: BOARD_COLORS[board % BOARD_COLORS.length] }}>
    {board + 1}
  </span>
);
