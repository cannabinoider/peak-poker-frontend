import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";

import { TransferRow } from "../components/transfer-row";
import type { Settlement } from "../types";

/** Who pays whom, in the fewest transfers (worked out by the server). */
export const SettlementTransfers = ({ settlement }: { settlement: Settlement }) => (
  <section className="pt-5">
    <SectionTitle>Who pays whom</SectionTitle>
    {settlement.transfers.length === 0 ? (
      <p className="text-dim">Everyone is square — nobody owes anything.</p>
    ) : (
      <Glass padding="6px 14px">
        <ul>
          {settlement.transfers.map((t) => (
            <TransferRow key={`${t.from}>${t.to}`} transfer={t} />
          ))}
        </ul>
      </Glass>
    )}
  </section>
);
