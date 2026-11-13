import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fmt, initials, rupees } from "./format.ts";

describe("format", () => {
  it("groups thousands", () => {
    assert.equal(fmt(0), "0");
    assert.equal(fmt(1500), "1,500");
    assert.equal(fmt(-1234567), "-1,234,567");
  });

  it("shows exact rupees", () => {
    assert.equal(rupees(300), "₹300");
    assert.equal(rupees(0.625), "₹0.63");
    assert.equal(rupees(12000), "₹12,000");
  });

  it("makes initials", () => {
    assert.equal(initials("Amit Shah"), "AS");
    assert.equal(initials("bina"), "B");
    assert.equal(initials("  "), "?");
  });
});
