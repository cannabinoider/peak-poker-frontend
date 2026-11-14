import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/styles";
import type { DealMode } from "@/modules/table/components/card-deal";
import { type DealerLayer, fanCentre } from "@/modules/table/components/dealer-rig";
import type { DealerId } from "@/modules/table/constants";

import s from "./dealer-figure.module.css";
import { NAOMI_ELBOW, NAOMI_FAN, NAOMI_VIEW_BOX, NaomiFigure } from "./naomi-figure";
import {
  NINA_ELBOW,
  NINA_FAN,
  NINA_VIEW_BOX,
  NinaRiggedFigure,
} from "./nina-rigged-figure";

export type DealerMood = "idle" | "cheer";

export interface DealerFigureProps {
  /** Naomi unless the device has picked Nina. */
  who?: DealerId;
  mode: DealMode;
  /** Cards to pitch this deal (one arm swing each). */
  throws: number;
  /** "cheer" at a showdown: she winks and smiles. */
  mood?: DealerMood;
  /** Glance down at you when it's your turn. */
  lookAtYou?: boolean;
  /**
   * Which pass of the table this is: "back" (her body) is drawn before the
   * felt, "front" (her forearms, hands and cards) after it.
   */
  layer?: DealerLayer;
}

type Point = { x: number; y: number };
type ViewBox = { x: number; y: number; w: number; h: number };

/** A point in a dealer's view box as a fraction of her 4:5 box. */
const inBox = (vb: ViewBox, p: Point): Point => ({
  x: (p.x - vb.x) / vb.w,
  y: (p.y - vb.y) / vb.h,
});

/**
 * Where each dealer's cards and left elbow are, as fractions of her box (both
 * view boxes have the box's 4:5 shape). Dealt cards start at `deck`; the table
 * places her so its rim passes her `elbow`, with her arms reaching over it.
 */
export const DEALER_GEOMETRY: Record<DealerId, { deck: Point; elbow: Point }> = {
  naomi: {
    deck: inBox(NAOMI_VIEW_BOX, fanCentre(NAOMI_FAN)),
    elbow: inBox(NAOMI_VIEW_BOX, NAOMI_ELBOW),
  },
  nina: {
    deck: inBox(NINA_VIEW_BOX, fanCentre(NINA_FAN)),
    elbow: inBox(NINA_VIEW_BOX, NINA_ELBOW),
  },
};

/** The dealer, from the waist up, standing behind the table in its corner. */
export const DealerFigure = ({
  who = "naomi",
  mode,
  throws,
  mood = "idle",
  lookAtYou = false,
  layer = "back",
}: DealerFigureProps) => {
  const name = who === "nina" ? "Nina" : "Naomi";
  const label =
    mode === "shuffle"
      ? `${name} is shuffling`
      : mode === "deal"
        ? `${name} is dealing`
        : name;
  const props = {
    className: cn(
      s.figure,
      mode === "shuffle" && s.shuffling,
      mode === "deal" && s.dealing,
      mood === "cheer" && s.cheer,
      lookAtYou && s.glance,
    ),
    style: { "--throws": Math.max(1, throws) } as CSSProperties,
    label,
    mode,
    layer,
  };
  return who === "nina" ? <NinaRiggedFigure {...props} /> : <NaomiFigure {...props} />;
};
