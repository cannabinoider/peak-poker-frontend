import { ChipGroup, ChoiceChip } from "@/lib/components/choice-chip";
import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import type { RebuyRule } from "../types";
import { REBUY_RULE_LABELS, REBUY_RULES } from "../utils/game-setup";

type RebuysSectionProps = {
  value: RebuyRule;
  onChange: (rule: RebuyRule) => void;
};

/** When busted players may buy back in. */
export const RebuysSection = ({ value, onChange }: RebuysSectionProps) => (
  <section aria-labelledby="rebuys-title">
    <SectionTitle id="rebuys-title">Rebuys</SectionTitle>
    <Glass>
      <ChipGroup aria-labelledby="rebuys-title">
        {REBUY_RULES.map((r) => (
          <ChoiceChip key={r} selected={value === r} onClick={() => onChange(r)}>
            {REBUY_RULE_LABELS[r]}
          </ChoiceChip>
        ))}
      </ChipGroup>
      <p className="mt-2 text-sm text-dim">
        {value === "none"
          ? "Busted players are out for the night."
          : "A rebuy gives a full starting stack for one more buy-in."}
      </p>
    </Glass>
  </section>
);
