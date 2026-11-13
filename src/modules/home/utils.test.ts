import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { closeRoomError, invitePath, parseInvite } from "./utils.ts";

describe("parseInvite", () => {
  it("reads full links and paths", () => {
    assert.deepEqual(parseInvite("https://peak.example/r/AB23CD45#s3cr%2Bt"), {
      code: "AB23CD45",
      secret: "s3cr%2Bt",
    });
    assert.deepEqual(parseInvite(" /r/ab23cd45#xyz "), {
      code: "AB23CD45",
      secret: "xyz",
    });
    assert.deepEqual(parseInvite("peak.example/r/AB23CD45?x=1"), {
      code: "AB23CD45",
      secret: null,
    });
  });

  it("reads bare codes", () => {
    assert.deepEqual(parseInvite("ab23 cd45"), { code: "AB23CD45", secret: null });
    assert.deepEqual(parseInvite("AB23CD45#abc"), { code: "AB23CD45", secret: "abc" });
  });

  it("rejects junk", () => {
    assert.equal(parseInvite(""), null);
    assert.equal(parseInvite("abc"), null);
    assert.equal(parseInvite("https://peak.example/"), null);
    assert.equal(parseInvite("not a code!"), null);
  });

  it("builds the room path", () => {
    assert.equal(invitePath({ code: "AB23CD45", secret: "x" }), "/r/AB23CD45#x");
    assert.equal(invitePath({ code: "AB23CD45", secret: null }), "/r/AB23CD45");
  });
});

describe("closeRoomError", () => {
  it("treats a room that's already gone as closed", () => {
    assert.equal(closeRoomError(404), null);
  });

  it("explains who may close it", () => {
    assert.equal(closeRoomError(403), "Only the host can close this room.");
    assert.equal(closeRoomError(401), "Only the host can close this room.");
  });

  it("asks to retry on other failures", () => {
    assert.match(closeRoomError(429)!, /Too many tries/);
    assert.match(closeRoomError(500)!, /Couldn't close the room/);
    assert.match(closeRoomError(null)!, /Couldn't reach the server/);
  });
});
