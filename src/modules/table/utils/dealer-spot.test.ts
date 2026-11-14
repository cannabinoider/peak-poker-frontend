import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { dealerSpot, rimTop } from "./dealer-spot.ts";

/** A tall felt like a phone's: 300 wide, so its ends are half circles of 150. */
const tall = { left: 0, top: 50, right: 300, bottom: 650 };
/** A wide felt: 160 tall, so it has a straight top between its round ends. */
const wide = { left: 0, top: 50, right: 600, bottom: 210 };

describe("rimTop", () => {
  it("is the top of the felt in the middle", () => {
    assert.equal(rimTop(tall, 150), 50);
    assert.equal(rimTop(wide, 300), 50);
  });

  it("drops along the round end towards the side", () => {
    assert.equal(rimTop(tall, 300), 200);
    assert.ok(Math.abs(rimTop(tall, 270)! - 110) < 0.01);
    assert.equal(rimTop(wide, 580), 50 + 80 - Math.sqrt(80 * 80 - 60 * 60));
  });

  it("is null off the felt", () => {
    assert.equal(rimTop(tall, 320), null);
  });
});

describe("dealerSpot", () => {
  it("puts her left elbow on the rim", () => {
    const spot = dealerSpot({
      width: 340,
      felt: tall,
      dealerW: 100,
      elbow: { x: 0.2, y: 0.8 },
    });
    const elbow = { x: spot.left + 20, y: spot.top + 100 };
    assert.equal(spot.left, 238);
    assert.ok(Math.abs(elbow.y - rimTop(tall, elbow.x)!) < 1e-9);
  });

  it("moves up by at most a third of her height", () => {
    const spot = dealerSpot({
      width: 340,
      felt: { left: 0, top: 0, right: 340, bottom: 900 },
      dealerW: 100,
      elbow: { x: 0.2, y: 0.8 },
    });
    assert.equal(spot.top, -125 / 3);
  });

  it("stays at the top when her elbow is beside the felt", () => {
    const spot = dealerSpot({
      width: 600,
      felt: { left: 100, top: 50, right: 400, bottom: 650 },
      dealerW: 100,
      elbow: { x: 0.2, y: 0.8 },
    });
    assert.equal(spot.top, 0);
  });
});
