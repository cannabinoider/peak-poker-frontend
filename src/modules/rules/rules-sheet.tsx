"use client";

import { Sheet } from "@/lib/components/sheet";
import type { HandView, StateMessage } from "@/modules/table/api/contracts";

import { HandRankings } from "./components/hand-rankings";
import { InfoIcon } from "./components/info-icon";
import { RuleSection } from "./components/rule-section";
import { rulesFor, showsFiveOfAKind } from "./utils";

export interface RulesSheetProps {
  /** The current hand (its game, twists and betting), or null between hands. */
  hand: HandView | null;
  setup: StateMessage["setup"];
  open: boolean;
  onClose: () => void;
}

/** The ⓘ "How to play" sheet: rules for the current game and hand rankings. */
export const RulesSheet = ({ hand, setup, open, onClose }: RulesSheetProps) => (
  <Sheet open={open} onClose={onClose} title="How to play" icon={<InfoIcon />}>
    {rulesFor(setup, hand).map((section) => (
      <RuleSection key={section.title} section={section} />
    ))}
    <HandRankings withFiveOfAKind={showsFiveOfAKind(hand)} />
  </Sheet>
);
