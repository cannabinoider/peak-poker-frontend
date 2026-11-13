import assert from "node:assert/strict";
import { it } from "node:test";

import {
  boardCardWidth,
  centerShift,
  centerWidth,
  seatPosition,
  tableScale,
} from "./seat-layout.ts";

const layout = {
  width: 400,
  height: 600,
  tileW: 92,
  tileH: 118,
  you: 2,
  seats: [0, 1, 2, 3],
  maxSeats: 4,
};

it("puts you at the bottom and the others clockwise", () => {
  const you = seatPosition(layout, 2);
  assert.ok(Math.abs(you.x - 200) < 1e-9);
  assert.ok(you.y > 500);
  const next = seatPosition(layout, 3);
  assert.ok(next.x < 100); // left
  const across = seatPosition(layout, 0);
  assert.ok(across.y < 100); // top
});

it("spreads players over the table's spots, not bunched by seat number", () => {
  // 3 players at an 8-seat table: you at the bottom, the others top-left and top-right.
  const three = { ...layout, you: 0, seats: [0, 1, 2], maxSeats: 8 };
  const left = seatPosition(three, 1);
  const right = seatPosition(three, 2);
  assert.ok(left.x < 200 && left.y < 300);
  assert.ok(right.x > 200 && right.y < 300);
  assert.ok(Math.abs(left.x - 200 - (200 - right.x)) < 1e-9);
  // Gaps in seat numbers don't matter: heads-up faces straight across.
  const headsUp = { ...layout, you: 5, seats: [1, 5], maxSeats: 8 };
  const other = seatPosition(headsUp, 1);
  assert.ok(Math.abs(other.x - 200) < 1e-9);
  assert.ok(other.y < 100);
});

it("the board gets the gap between the seats beside it", () => {
  // 4 seats: left and right seats sit level with the centre, 2px from the edges.
  const gap = 400 - 2 * (2 + 92 + 4);
  assert.ok(Math.abs(centerWidth(layout, 80) - gap) < 1e-9);
  // Bets beside the side seats' avatars reach further in: the board leaves room.
  const wide = { ...layout, width: 800 };
  const withBets = 800 - 2 * (2 + 46 + 80 + 4);
  assert.ok(Math.abs(centerWidth(wide, 80, 80) - withBets) < 1e-9);
  // Nobody level with the centre (heads-up): the full width.
  assert.equal(centerWidth({ ...layout, seats: [0, 2] }, 80), 400);
  // Never less than 40% of the area.
  assert.equal(centerWidth({ ...layout, width: 200 }, 80), 80);
});

it("the board moves into the free space between the seats above and below", () => {
  // Nothing in the way: stays centred.
  assert.equal(centerShift({ ...layout, seats: [] }, 100), 0);
  // Seats straight above and below: only nudged down by the top seat's action pill.
  assert.ok(Math.abs(centerShift(layout, 100) - 7) < 1e-9);
  // 3 players, wide board: midway between the upper seats' bottoms and your top.
  const three = { ...layout, you: 0, seats: [0, 1, 2], maxSeats: 8 };
  const upper = seatPosition(three, 1).y + 59 + 14;
  const yours = seatPosition(three, 0).y - 59;
  assert.ok(Math.abs(centerShift(three, 300) - ((upper + yours) / 2 - 300)) < 1e-9);
});

it("board card width is clamped", () => {
  assert.equal(boardCardWidth(375, 92), (375 - 184 - 20) / 5.4);
  assert.equal(boardCardWidth(200, 92), 26);
  assert.equal(boardCardWidth(2000, 92), 46);
  assert.equal(boardCardWidth(2000, 92, 64), 64);
});

it("table scale: 1 on phones, grows with the room, capped", () => {
  assert.equal(tableScale(375, 500), 1);
  assert.equal(tableScale(1200, 400), 1);
  assert.equal(tableScale(1400, 590), 1.34);
  assert.equal(tableScale(950, 650), 1.25);
  assert.equal(tableScale(2400, 1400), 1.4);
});

it("shrinks seats on a short phone table so they clear the board", () => {
  assert.equal(tableScale(360, 200), 0.7);
  assert.equal(tableScale(390, 300), 0.71);
  assert.equal(tableScale(390, 450), 1);
});
