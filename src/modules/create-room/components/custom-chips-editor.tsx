import { TextButton } from "@/lib/components/button";
import { ChipGroup, ChoiceChip } from "@/lib/components/choice-chip";
import { SectionTitle } from "@/lib/components/section-title";
import { TextField } from "@/lib/components/text-field";

import type { SetupFormApi } from "../hooks/use-setup-form";
import { suggestedBlinds } from "../utils/game-setup";

import { AddIcon, CloseIcon } from "./icons";

type CustomChipsEditorProps = Pick<
  SetupFormApi,
  "form" | "setup" | "update" | "setChipRow" | "addChipRow" | "removeChipRow"
>;

const numberProps = {
  inputMode: "numeric",
  autoComplete: "off",
  dense: true,
} as const;

/** Buy-in amount, chip rows (value × count) and blinds for a custom chip set. */
export const CustomChipsEditor = ({
  form,
  setup,
  update,
  setChipRow,
  addChipRow,
  removeChipRow,
}: CustomChipsEditorProps) => {
  const suggested = suggestedBlinds(setup.chips);
  return (
    <div className="flex flex-col">
      <TextField
        {...numberProps}
        label="Buy-in amount"
        prefix="₹ "
        value={form.buyIn}
        onChange={(e) => update({ buyIn: e.target.value })}
      />

      <SectionTitle as="h3" className="mt-[18px]">
        Chips each player starts with
      </SectionTitle>
      <ul className="flex flex-col gap-2">
        {form.chipRows.map((row, i) => (
          <li key={row.id} className="flex items-center">
            <TextField
              {...numberProps}
              containerClassName="min-w-0 flex-1"
              label="Chip value"
              aria-label={`Chip ${i + 1} value`}
              value={row.value}
              onChange={(e) => setChipRow(row.id, { value: e.target.value })}
            />
            <span aria-hidden className="px-2 text-dim">
              ×
            </span>
            <TextField
              {...numberProps}
              containerClassName="min-w-0 flex-1"
              label="Count"
              aria-label={`Chip ${i + 1} count`}
              value={row.count}
              onChange={(e) => setChipRow(row.id, { count: e.target.value })}
            />
            <button
              type="button"
              aria-label={`Remove chip ${i + 1}`}
              title="Remove chip"
              onClick={() => removeChipRow(row.id)}
              className="ml-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-dim outline-none hover:bg-white/[0.08] focus-visible:bg-white/10">
              <span aria-hidden className="inline-flex size-6 [&>svg]:size-full">
                <CloseIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div>
        <TextButton onClick={addChipRow} className="-ml-2 mt-1">
          <span aria-hidden className="inline-flex size-[18px] [&>svg]:size-full">
            <AddIcon />
          </span>
          Add chip
        </TextButton>
      </div>

      <SectionTitle as="h3" id="custom-blinds" className="mt-2">
        Blinds
      </SectionTitle>
      {suggested.length > 0 && (
        <ChipGroup aria-labelledby="custom-blinds">
          {suggested.map(([sb, bb]) => (
            <ChoiceChip
              key={`${sb}/${bb}`}
              selected={setup.smallBlind === sb && setup.bigBlind === bb}
              onClick={() => update({ smallBlind: String(sb), bigBlind: String(bb) })}>
              {`${sb} / ${bb}`}
            </ChoiceChip>
          ))}
        </ChipGroup>
      )}
      <div className="mt-2.5 flex gap-3">
        <TextField
          {...numberProps}
          containerClassName="min-w-0 flex-1"
          label="Small blind"
          value={form.smallBlind}
          onChange={(e) => update({ smallBlind: e.target.value })}
        />
        <TextField
          {...numberProps}
          containerClassName="min-w-0 flex-1"
          label="Big blind"
          value={form.bigBlind}
          onChange={(e) => update({ bigBlind: e.target.value })}
        />
      </div>
    </div>
  );
};
