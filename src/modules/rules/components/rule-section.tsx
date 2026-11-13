import { SectionTitle } from "@/lib/components/section-title";

import type { RuleSection as RuleSectionData } from "../types";

/** A titled list of rules, each with a small gold bullet. */
export const RuleSection = ({ section }: { section: RuleSectionData }) => (
  <section className="pt-2.5">
    <SectionTitle as="h3">{section.title}</SectionTitle>
    <ul className="space-y-2">
      {section.points.map((point) => (
        <li key={point} className="flex gap-2 leading-[1.35]">
          <span
            aria-hidden
            className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold"
          />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  </section>
);
