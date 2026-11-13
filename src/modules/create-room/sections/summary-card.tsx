import { fmt, rupees } from "@/lib/utils/format";

import type { MoneySetup } from "../types";
import {
  betUnit,
  bigBlindsDeep,
  blindsLabel,
  rupeesFor,
  startingStack,
} from "../utils/game-setup";

/** Felt-green summary: chips per buy-in, blinds, chip values and stack depth. */
export const SummaryCard = ({ setup }: { setup: MoneySetup }) => {
  const stack = startingStack(setup.chips);
  const unit = betUnit(setup.chips);
  const ok = stack > 0 && setup.buyInRupees > 0;
  return (
    <section
      aria-label="Summary"
      aria-live="polite"
      className="tabular rounded-panel border border-glass bg-gradient-to-br from-felt-center/50 to-felt-edge/50 p-[18px]">
      <p className="text-[22px] font-black leading-tight text-text">
        {`${fmt(stack)} chips = ₹${fmt(setup.buyInRupees)}`}
      </p>
      <div className="mt-1.5 text-sm text-dim">
        <p>{`Blinds ${blindsLabel(setup)} · bets in steps of ${unit}`}</p>
        {ok && (
          <>
            <p>
              {`1 chip = ${rupees(rupeesFor(setup, 1))} · ` +
                `${unit} chips = ${rupees(rupeesFor(setup, unit))}`}
            </p>
            {setup.bigBlind > 0 && (
              <p>{`Stack depth: ${bigBlindsDeep(setup).toFixed(0)} big blinds`}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
};
