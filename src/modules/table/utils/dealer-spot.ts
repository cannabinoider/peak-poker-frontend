export type Rect = { left: number; top: number; right: number; bottom: number };

/**
 * Height of the felt's top edge at x. The felt is a fully rounded rectangle
 * (corner radius half its shorter side). Null where x is off the felt.
 */
export const rimTop = (felt: Rect, x: number): number | null => {
  const r = Math.min(felt.right - felt.left, felt.bottom - felt.top) / 2;
  if (x < felt.left || x > felt.right) {
    return null;
  }
  const cx = Math.min(Math.max(x, felt.left + r), felt.right - r);
  const dx = x - cx;
  return felt.top + r - Math.sqrt(Math.max(0, r * r - dx * dx));
};

/**
 * The dealer's box in the top-right corner, moved up or down so the felt's rim
 * crosses her at her left elbow: her body stands behind the table and her
 * forearms reach over it. `elbow` is a fraction of her box. She never moves
 * up by more than a third of her height, nor down by more than a sixth.
 */
export const dealerSpot = ({
  width,
  felt,
  dealerW,
  elbow,
}: {
  width: number;
  felt: Rect;
  dealerW: number;
  elbow: { x: number; y: number };
}) => {
  const w = dealerW;
  const h = dealerW * 1.25;
  const left = width - w - 2;
  const rim = rimTop(felt, left + w * elbow.x);
  const top = rim === null ? 0 : Math.min(h / 6, Math.max(-h / 3, rim - h * elbow.y));
  return { left, top, w, h };
};
