/*
 * Seat positions around the oval (Flutter `_TableArea.posOf`): you at the
 * bottom, everyone else clockwise around an ellipse inside the area. The
 * table's spots stay where the app has them, but the players are spread over
 * those spots as evenly as possible, so three players don't bunch up on one side.
 */

const ACTION_OVERHANG = 14;

export interface Point {
  x: number;
  y: number;
}

export interface OvalLayout {
  width: number;
  height: number;
  tileW: number;
  tileH: number;
  /** Your seat (it sits at the bottom). */
  you: number;
  /** Seat numbers of everyone at the table. */
  seats: readonly number[];
  maxSeats: number;
}

export const seatPosition = (l: OvalLayout, seat: number): Point => {
  const cx = l.width / 2;
  const cy = l.height / 2;
  const rx = Math.max(0, l.width / 2 - l.tileW / 2 - 2);
  const ry = Math.max(0, l.height / 2 - l.tileH / 2 - 2);
  const order = [...new Set([...l.seats, l.you, seat])].sort((a, b) => a - b);
  const n = order.length;
  const spots = Math.max(l.maxSeats, n);
  const step = (order.indexOf(seat) - order.indexOf(l.you) + n) % n;
  const spot = Math.round((step * spots) / n);
  const a = Math.PI / 2 + (spot * 2 * Math.PI) / spots;
  return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
};

/**
 * Width free for the board in the middle: the gap between the seats whose
 * tiles reach the band of height `bandH` around the centre (at least 40% of
 * the area, so the board never disappears). `reach` is how far a seat (with
 * its bet beside the avatar) sticks out towards the centre.
 */
export const centerWidth = (l: OvalLayout, bandH: number, reach = l.tileW / 2) => {
  const cx = l.width / 2;
  const cy = l.height / 2;
  let half = cx;
  for (const seat of l.seats) {
    const p = seatPosition(l, seat);
    if (Math.abs(p.y - cy) < bandH / 2 + l.tileH / 2) {
      half = Math.min(half, Math.abs(p.x - cx) - Math.max(l.tileW / 2, reach) - 4);
    }
  }
  return Math.max(l.width * 0.4, 2 * half);
};

/**
 * How far to move the board down (or up) from the centre so it sits midway
 * between the seats above and below it that it would otherwise touch.
 */
export const centerShift = (l: OvalLayout, boardW: number) => {
  const cx = l.width / 2;
  const cy = l.height / 2;
  let top = 0;
  let bottom = l.height;
  for (const seat of l.seats) {
    const p = seatPosition(l, seat);
    if (Math.abs(p.x - cx) - l.tileW / 2 >= boardW / 2) {
      continue;
    }
    if (p.y < cy) {
      // The last-action pill hangs a little below an upper seat's tile.
      top = Math.max(top, p.y + l.tileH / 2 + ACTION_OVERHANG);
    } else {
      bottom = Math.min(bottom, p.y - l.tileH / 2);
    }
  }
  return top < bottom ? (top + bottom) / 2 - cy : 0;
};

/** Board card width for the space between the side seats (26px up to `max`). */
export const boardCardWidth = (width: number, tileW: number, max = 46) =>
  Math.min(max, Math.max(26, (width - 2 * tileW - 20) / 5.4));

/**
 * How much to enlarge seats and cards on big screens (1 on a normal phone,
 * up to 1.4). A short phone table — the dealer picker leaves little felt —
 * shrinks seats so they don't pile on top of the board. Wide screens stay
 * at 1 or above.
 */
export const tableScale = (width: number, height: number) => {
  const grow = Math.min(1.4, Math.max(1, Math.min(width / 760, height / 440)));
  if (width >= 760 || height >= 420) {
    return Math.round(grow * 100) / 100;
  }
  return Math.round(Math.max(0.7, height / 420) * 100) / 100;
};
