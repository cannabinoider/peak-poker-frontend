import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import { ResultRow } from "../components/result-row";
import type { Room, Settlement } from "../types";
import { sortedResults, yourName } from "../utils";

/** Everyone's final result, biggest winner first. */
export const SettlementResults = ({
  room,
  settlement,
}: {
  room: Room;
  settlement: Settlement;
}) => {
  const seatOf = new Map(room.seats.map((s) => [s.name, s]));
  const you = yourName(room);
  return (
    <section className="pt-5">
      <SectionTitle>Results</SectionTitle>
      <Glass padding="8px 14px">
        <ul>
          {sortedResults(settlement).map((p) => (
            <ResultRow
              key={p.name}
              player={p}
              seat={seatOf.get(p.name)?.seat ?? 0}
              animal={seatOf.get(p.name)?.animal}
              isYou={p.name === you}
            />
          ))}
        </ul>
      </Glass>
    </section>
  );
};
