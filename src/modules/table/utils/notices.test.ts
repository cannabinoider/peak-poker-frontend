import assert from "node:assert/strict";
import { it } from "node:test";

import { freshNotices, newestNoticeId } from "./notices.ts";

it("shows only notices newer than the last one seen", () => {
  const notices = [
    { id: 1, text: "a" },
    { id: 2, text: "b" },
    { id: 3, text: "c" },
  ];
  assert.equal(newestNoticeId(notices), 3);
  assert.equal(newestNoticeId([]), null);
  assert.deepEqual(freshNotices(notices, null), []);
  assert.deepEqual(
    freshNotices(notices, 1).map((n) => n.text),
    ["b", "c"],
  );
});
