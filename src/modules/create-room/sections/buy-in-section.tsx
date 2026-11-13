import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import { CustomChipsEditor } from "../components/custom-chips-editor";
import { PresetDetails } from "../components/preset-details";
import { PresetTile } from "../components/preset-tile";
import type { SetupFormApi } from "../hooks/use-setup-form";
import type { PresetId } from "../types";

const PRESETS: { id: PresetId; title: string; subtitle: string }[] = [
  { id: "rs300", title: "₹300", subtitle: "1,500 chips" },
  { id: "rs50", title: "₹50", subtitle: "400 chips" },
  { id: "custom", title: "Custom", subtitle: "Your chips" },
];

type BuyInSectionProps = Pick<
  SetupFormApi,
  "form" | "setup" | "update" | "setChipRow" | "addChipRow" | "removeChipRow"
>;

/** Buy-in presets, then the preset's chips or the custom chip editor. */
export const BuyInSection = (props: BuyInSectionProps) => {
  const { form, setup, update } = props;
  return (
    <section aria-labelledby="buy-in-title">
      <SectionTitle id="buy-in-title">Buy-in</SectionTitle>
      <div role="radiogroup" aria-labelledby="buy-in-title" className="flex gap-2.5">
        {PRESETS.map((p) => (
          <PresetTile
            key={p.id}
            title={p.title}
            subtitle={p.subtitle}
            selected={form.preset === p.id}
            onSelect={() => update({ preset: p.id })}
          />
        ))}
      </div>
      <Glass className="mt-3">
        {form.preset === "custom" ? (
          <CustomChipsEditor {...props} />
        ) : (
          <PresetDetails
            setup={setup}
            equalBlinds={form.equalBlinds}
            onEqualBlinds={(equalBlinds) => update({ equalBlinds })}
          />
        )}
      </Glass>
    </section>
  );
};
