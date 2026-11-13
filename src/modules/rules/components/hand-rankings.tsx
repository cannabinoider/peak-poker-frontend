import { SectionTitle } from "@/lib/components/section-title";

import { HAND_RANKINGS } from "../constants";

/** Hand rankings, best first; five of a kind only when wild cards are in play. */
export const HandRankings = ({ withFiveOfAKind }: { withFiveOfAKind: boolean }) => {
  const rankings = withFiveOfAKind ? HAND_RANKINGS : HAND_RANKINGS.slice(1);
  return (
    <section className="pt-4">
      <SectionTitle as="h3">Hand rankings (best first)</SectionTitle>
      <ol>
        {rankings.map((r) => (
          <li key={r.name} className="flex items-center gap-3 py-1">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{r.name}</p>
              {r.note && <p className="text-[11px] text-faint">{r.note}</p>}
            </div>
            <span className="tabular shrink-0 text-dim">{r.example}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
