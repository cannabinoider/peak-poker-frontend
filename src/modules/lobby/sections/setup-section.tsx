import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import type { Room } from "../types";
import { setupSummary } from "../utils";

/** What the table is playing: buy-in, chips, blinds, games, rebuys, turn time. */
export const SetupSection = ({ setup }: { setup: Room["setup"] }) => (
  <section className="pt-5">
    <SectionTitle>Table setup</SectionTitle>
    <Glass blur={false} padding="6px 16px">
      <dl>
        {setupSummary(setup).map((item) => (
          <div
            key={item.label}
            className="flex items-baseline gap-3 border-b border-white/[0.06] py-2 last:border-b-0">
            <dt className="shrink-0 text-dim">{item.label}</dt>
            <dd className="tabular min-w-0 flex-1 text-right font-semibold">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Glass>
  </section>
);
