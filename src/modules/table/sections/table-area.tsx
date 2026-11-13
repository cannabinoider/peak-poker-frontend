"use client";

import { SeatTile } from "@/modules/table/components/seat-tile";
import {
  MAX_OVAL_RATIO,
  SEAT_BET_REACH,
  TILE_H,
  TILE_H_CROWDED,
  TILE_W,
  TILE_W_CROWDED,
} from "@/modules/table/constants";
import { useElementSize } from "@/modules/table/hooks/use-element-size";
import type { Room, Seat } from "@/modules/table/types";
import { canManage } from "@/modules/table/utils/room";
import {
  boardCardWidth,
  centerShift,
  centerWidth,
  type OvalLayout,
  seatPosition,
  tableScale,
} from "@/modules/table/utils/seat-layout";

import { CenterInfo } from "./center-info";

type TableAreaProps = {
  room: Room;
  /** Banker / owner tapped another player's seat. */
  onSeatTap: (seat: Seat) => void;
};

/** The oval felt with seats around it, bets in front of them and the board in the middle. */
export const TableArea = ({ room, onSeatTap }: TableAreaProps) => {
  const [ref, area] = useElementSize<HTMLDivElement>();
  const height = area.height;
  // Keep the oval from getting too flat on wide, short screens.
  const width = Math.min(area.width, Math.max(height * MAX_OVAL_RATIO, 0));
  const crowded = room.maxSeats > 8;
  const baseW = crowded ? TILE_W_CROWDED : TILE_W;
  const baseH = crowded ? TILE_H_CROWDED : TILE_H;
  const scale = tableScale(width, height);
  const tileW = baseW * scale;
  const tileH = baseH * scale;
  const layout: OvalLayout = {
    width,
    height,
    tileW,
    tileH,
    you: room.yourSeat ?? room.seats[0]?.seat ?? 0,
    seats: room.seats.map((s) => s.seat),
    maxSeats: room.maxSeats,
  };
  const cardW = boardCardWidth(width, tileW, 46 * scale);
  const manage = canManage(room);
  const hand = room.hand;
  const boardW = centerWidth(
    layout,
    cardW * 1.45 * (hand?.boards.length ?? 1) + 36,
    SEAT_BET_REACH * scale,
  );

  return (
    <div ref={ref} className="relative min-h-0 flex-1">
      {width > 0 && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width }}>
          {/* Felt with its rim. */}
          <div
            aria-hidden
            className="absolute rounded-full border-[10px] border-rim bg-felt shadow-[0_0_40px_2px_rgb(var(--felt-center)/0.25),0_12px_24px_rgba(0,0,0,0.54)]"
            style={{
              left: tileW * 0.32,
              right: tileW * 0.32,
              top: tileH * 0.36,
              bottom: tileH * 0.36,
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `translateY(${centerShift(layout, boardW)}px)` }}>
            <CenterInfo room={room} cardW={cardW} maxWidth={boardW} />
          </div>
          {room.seats.map((seat) => {
            const p = seatPosition(layout, seat.seat);
            const tappable = manage && seat.seat !== room.yourSeat;
            const tile = (
              <div style={{ zoom: scale }}>
                <SeatTile
                  room={room}
                  seat={seat}
                  width={baseW}
                  betSide={p.x > width / 2 + 1 ? "left" : "right"}
                />
              </div>
            );
            return (
              <div
                key={seat.seat}
                className="absolute transition-[left,top] duration-300"
                style={{
                  left: p.x - tileW / 2,
                  top: p.y - tileH / 2,
                  width: tileW,
                  height: tileH,
                }}>
                {tappable ? (
                  <button
                    type="button"
                    onClick={() => onSeatTap(seat)}
                    aria-label={`Manage ${seat.name}`}
                    className="block h-full w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
                    {tile}
                  </button>
                ) : (
                  tile
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
