import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bankerRelief } from "./banker-relief.ts";

describe("bankerRelief", () => {
  it("stays disabled until the server says the banker is away", () => {
    const waiting = {
      enabled: false,
      reason: "The banker is still responding",
    };
    assert.deepEqual(bankerRelief(undefined), waiting);
    assert.deepEqual(bankerRelief(false), waiting);
    assert.deepEqual(bankerRelief(true), { enabled: true, reason: null });
  });
});
