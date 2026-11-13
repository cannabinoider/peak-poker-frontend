import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createRoomErrorLines } from "./api-errors.ts";

const clientError = (status: number, body: unknown) =>
  Object.assign(new Error("x"), { status, body });

describe("createRoomErrorLines", () => {
  it("lists setup problems", () => {
    const err = clientError(400, {
      message: "The room setup has problems",
      errors: ["Big blind must be a multiple of 10."],
    });
    assert.deepEqual(createRoomErrorLines(err), [
      "Big blind must be a multiple of 10.",
    ]);
  });

  it("formats Zod issues", () => {
    const err = clientError(400, {
      message: "Invalid request",
      errors: [{ path: ["setup", "chips", 0, "value"], message: "Too small" }],
    });
    assert.deepEqual(createRoomErrorLines(err), ["chips.0.value: Too small"]);
  });

  it("falls back to the message", () => {
    assert.deepEqual(createRoomErrorLines(clientError(500, { message: "Boom" })), [
      "Boom",
    ]);
    assert.equal(createRoomErrorLines(clientError(429, { message: "x" })).length, 1);
  });

  it("explains network failures", () => {
    assert.match(
      createRoomErrorLines(new TypeError("fetch failed"))[0],
      /reach the server/,
    );
    const timeout = Object.assign(new Error("t"), { name: "TimeoutError" });
    assert.match(createRoomErrorLines(timeout)[0], /too long/);
  });
});
