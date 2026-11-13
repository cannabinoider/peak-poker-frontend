import { ChipGroup, ChoiceChip } from "@/lib/components/choice-chip";
import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import { TURN_OPTIONS, turnLabel } from "../utils/game-setup";

type TurnTimeSectionProps = {
  value: number;
  onChange: (seconds: number) => void;
};

/** Seconds each player gets to act. */
export const TurnTimeSection = ({ value, onChange }: TurnTimeSectionProps) => (
  <section aria-labelledby="turn-title">
    <SectionTitle id="turn-title">Time to act</SectionTitle>
    <Glass>
      <ChipGroup aria-labelledby="turn-title">
        {TURN_OPTIONS.map((t) => (
          <ChoiceChip key={t} selected={value === t} onClick={() => onChange(t)}>
            {turnLabel(t)}
          </ChoiceChip>
        ))}
      </ChipGroup>
      <p className="mt-2 text-sm text-dim">
        {value === 0
          ? "Players can take as long as they like."
          : "Out of time: check if possible, otherwise fold."}
      </p>
    </Glass>
  </section>
);
