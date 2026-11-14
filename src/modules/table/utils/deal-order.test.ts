import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { dealOrder } from "./deal-order.ts";

describe("dealOrder", () => {
  it("starts left of the button and goes round once per hole card", () => {
    assert.deepEqual(dealOrder([0, 1, 2], 0, 2), [1, 2, 0, 1, 2, 0]);
  });

  it("wraps around when the button is the highest seat", () => {
    assert.deepEqual(dealOrder([2, 5, 7], 7, 1), [2, 5, 7]);
  });

  it("works with gaps and an unsorted seat list", () => {
    assert.deepEqual(dealOrder([6, 1, 4], 4, 2), [6, 1, 4, 6, 1, 4]);
  });

  it("deals nothing to nobody", () => {
    assert.deepEqual(dealOrder([], 0, 2), []);
  });
});
