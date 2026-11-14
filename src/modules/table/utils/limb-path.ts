/** Half widths of a limb at points along it: `t` runs 0 (joint) to 1 (far end). */
export type LimbProfile = readonly (readonly [t: number, halfWidth: number])[];

type Point = readonly [number, number];

const round = (n: number) => Math.round(n * 100) / 100;

/** Closed Catmull-Rom spline through the points, as cubic Bezier SVG path data. */
export const smoothClosedPath = (points: readonly Point[]): string => {
  const n = points.length;
  if (n < 3) {
    return "";
  }
  const at = (i: number) => points[(i + n) % n];
  const parts = [`M${round(at(0)[0])} ${round(at(0)[1])}`];
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    parts.push(
      `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`,
    );
  }
  return `${parts.join("")}Z`;
};

/**
 * Outline of a limb lying along +y from (0, 0) to (0, length), with rounded
 * ends. `outer` is the -x side, `inner` the +x side.
 */
export const limbPath = (
  length: number,
  outer: LimbProfile,
  inner: LimbProfile,
): string => {
  const top = Math.min(outer[0][1], inner[0][1]);
  const bottom = Math.min(outer[outer.length - 1][1], inner[inner.length - 1][1]);
  const points: Point[] = [
    [0, -top * 0.85],
    [-top * 0.72, -top * 0.55],
    ...outer.map(([t, w]): Point => [-w, t * length]),
    [-bottom * 0.72, length + bottom * 0.55],
    [0, length + bottom * 0.85],
    [bottom * 0.72, length + bottom * 0.55],
    ...[...inner].reverse().map(([t, w]): Point => [w, t * length]),
    [top * 0.72, -top * 0.55],
  ];
  return smoothClosedPath(points);
};
