import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { limbPath, smoothClosedPath } from "./limb-path.ts";

/** Points the curve passes through (start, then the end of each segment). */
const onCurve = (d: string) =>
  [...d.matchAll(/M(-?[\d.]+) (-?[\d.]+)|(-?[\d.]+) (-?[\d.]+)(?=C|Z)/g)].map((m) =>
    m[1] === undefined ? [Number(m[3]), Number(m[4])] : [Number(m[1]), Number(m[2])],
  );

describe("limbPath", () => {
  it("is a closed curve that starts above the joint", () => {
    const d = limbPath(
      50,
      [
        [0, 6],
        [1, 5],
      ],
      [
        [0, 6],
        [1, 5],
      ],
    );
    assert.match(d, /^M0 -5\.1C/);
    assert.ok(d.endsWith("Z"));
  });

  it("stays within the widths and just past both ends", () => {
    const d = limbPath(
      40,
      [
        [0, 6],
        [0.5, 7],
        [1, 5],
      ],
      [
        [0, 5],
        [1, 4],
      ],
    );
    const points = onCurve(d);
    assert.equal(points.length, 12);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    assert.deepEqual([Math.min(...xs), Math.max(...xs)], [-7, 5]);
    assert.deepEqual([Math.min(...ys), Math.max(...ys)], [-4.25, 43.4]);
  });
});

describe("smoothClosedPath", () => {
  it("needs at least three points", () => {
    assert.equal(
      smoothClosedPath([
        [0, 0],
        [1, 1],
      ]),
      "",
    );
  });

  it("draws one curve per point", () => {
    const d = smoothClosedPath([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]);
    assert.equal(d.match(/C/g)?.length, 4);
  });
});
