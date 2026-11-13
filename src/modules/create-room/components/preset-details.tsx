import { ChipGroup, ChoiceChip } from "@/lib/components/choice-chip";
import { Pill } from "@/lib/components/pill";
import { SectionTitle } from "@/lib/components/section-title";
import { fmt } from "@/lib/utils/format";

import type { MoneySetup } from "../types";
import { betUnit } from "../utils/game-setup";

type PresetDetailsProps = {
  setup: MoneySetup;
  equalBlinds: boolean;
  onEqualBlinds: (equal: boolean) => void;
};

/** A preset's chip breakdown and the normal / equal blinds choice. */
export const PresetDetails = ({
  setup,
  equalBlinds,
  onEqualBlinds,
}: PresetDetailsProps) => {
  const small = betUnit(setup.chips);
  return (
    <div className="flex flex-col">
      <SectionTitle as="h3">Each player starts with</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {setup.chips.map((c) => (
          <Pill key={c.value} tone="glass" fontSize={13}>
            {`${c.count} × ${fmt(c.value)}`}
          </Pill>
        ))}
      </div>
      <SectionTitle as="h3" id="preset-blinds" className="mt-4">
        Blinds
      </SectionTitle>
      <ChipGroup aria-labelledby="preset-blinds">
        <ChoiceChip selected={!equalBlinds} onClick={() => onEqualBlinds(false)}>
          {`${small} / ${small * 2}`}
        </ChoiceChip>
        <ChoiceChip selected={equalBlinds} onClick={() => onEqualBlinds(true)}>
          {`${small} / ${small}`}
        </ChoiceChip>
      </ChipGroup>
    </div>
  );
};
