/**
 * Where seat `i` of `count` sits around an oval, as percentages of the box:
 * seat 0 at the top, then clockwise, the way the table deals.
 */
export const seatRingPosition = (i: number, count: number) => {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
  return {
    left: 50 + 40 * Math.cos(angle),
    top: 50 + 38 * Math.sin(angle),
  };
};
