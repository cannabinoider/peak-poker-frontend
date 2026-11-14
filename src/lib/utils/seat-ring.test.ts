import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { seatRingPosition } from "./seat-ring.ts";

const round = (p: { left: number; top: number }) => [
  Math.round(p.left * 10) / 10,
  Math.round(p.top * 10) / 10,
];

describe("seatRingPosition", () => {
  it("puts seat 0 at the top and goes clockwise", () => {
    assert.deepEqual(round(seatRingPosition(0, 4)), [50, 12]);
    assert.deepEqual(round(seatRingPosition(1, 4)), [90, 50]);
    assert.deepEqual(round(seatRingPosition(2, 4)), [50, 88]);
    assert.deepEqual(round(seatRingPosition(3, 4)), [10, 50]);
  });

  it("spreads any seat count evenly", () => {
    const xs = Array.from({ length: 8 }, (_, i) => seatRingPosition(i, 8));
    assert.equal(new Set(xs.map((p) => round(p).join(","))).size, 8);
  });
});
