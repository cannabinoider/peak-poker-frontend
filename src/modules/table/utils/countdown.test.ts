import assert from "node:assert/strict";
import { it } from "node:test";

import { remainingSeconds, timeFraction, timeTone } from "./countdown.ts";

it("counts down from when the state arrived", () => {
  assert.equal(remainingSeconds(10, 1000, 1000), 10);
  assert.equal(remainingSeconds(10, 1000, 3500), 7.5);
  assert.equal(remainingSeconds(10, 1000, 60_000), 0);
  // A clock that hasn't caught up yet doesn't add time.
  assert.equal(remainingSeconds(10, 1000, 0), 10);
});

it("tones and fractions", () => {
  assert.equal(timeTone(0.8), "green");
  assert.equal(timeTone(0.3), "gold");
  assert.equal(timeTone(0.1), "red");
  assert.equal(timeFraction(15, 30), 0.5);
  assert.equal(timeFraction(40, 30), 1);
  assert.equal(timeFraction(5, 0), 0);
});
