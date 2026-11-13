import { ChipGroup, ChoiceChip } from "@/lib/components/choice-chip";
import { Glass } from "@/lib/components/glass";
import { SectionTitle } from "@/lib/components/section-title";
import { SegmentedControl } from "@/lib/components/segmented-control";
import { SwitchTile } from "@/lib/components/switch-tile";

import { AddIcon, WandIcon } from "../components/icons";
import type { SetupFormApi } from "../hooks/use-setup-form";
import { allGames, defaultGameChoices } from "../utils/setup-form";
import { BETTING_LABELS, BETTING_STRUCTURES, isCustomGameId } from "../utils/variant";

const BETTING_OPTIONS = BETTING_STRUCTURES.map((b) => ({
  value: b,
  label: BETTING_LABELS[b].label,
}));

type GamesSectionProps = Pick<
  SetupFormApi,
  "form" | "setup" | "update" | "toggleGame" | "removeCustomGame" | "canAddCustomGame"
> & {
  onCreateGame: () => void;
};

/** Dealer's choice, orbit, the games list (with custom games) and the default game. */
export const GamesSection = ({
  form,
  setup,
  update,
  toggleGame,
  removeCustomGame,
  canAddCustomGame,
  onCreateGame,
}: GamesSectionProps) => {
  const choices = defaultGameChoices(form);
  return (
    <section aria-labelledby="games-title">
      <SectionTitle id="games-title">Games</SectionTitle>
      <Glass>
        <SwitchTile
          checked={form.dealersChoice}
          onChange={(dealersChoice) => update({ dealersChoice })}
          title="Dealer's choice"
          subtitle="The dealer picks the game and betting each hand"
        />
        {form.dealersChoice ? (
          <>
            <SwitchTile
              className="mt-2"
              strong={false}
              checked={form.playOrbit}
              onChange={(playOrbit) => update({ playOrbit })}
              title="Play one orbit"
              subtitle="The dealer's game is played once around the table before the next dealer picks"
            />
            <SectionTitle as="h3" id="dealer-games" className="mt-2">
              Games the dealer can pick
            </SectionTitle>
            <ChipGroup role="group" aria-labelledby="dealer-games">
              {allGames(form).map((v) => {
                const custom = isCustomGameId(v.id);
                return (
                  <ChoiceChip
                    key={v.id}
                    kind="toggle"
                    selected={form.selectedGames.includes(v.id)}
                    icon={custom ? <WandIcon /> : undefined}
                    onClick={() => toggleGame(v.id, !form.selectedGames.includes(v.id))}
                    onDelete={custom ? () => removeCustomGame(v.id) : undefined}
                    deleteLabel={`Delete ${v.name}`}>
                    {v.name}
                  </ChoiceChip>
                );
              })}
              {canAddCustomGame && (
                <ChoiceChip
                  kind="action"
                  selected={false}
                  icon={<AddIcon />}
                  onClick={onCreateGame}>
                  Create a game
                </ChoiceChip>
              )}
            </ChipGroup>
            <SectionTitle as="h3" id="default-game" className="mt-4">
              If the dealer doesn&apos;t choose in time
            </SectionTitle>
          </>
        ) : (
          <SectionTitle as="h3" id="default-game" className="mt-2">
            Game
          </SectionTitle>
        )}
        <ChipGroup aria-labelledby="default-game">
          {choices.map((v) => (
            <ChoiceChip
              key={v.id}
              selected={setup.defaultGame === v.id}
              onClick={() => update({ defaultGame: v.id })}>
              {v.name}
            </ChoiceChip>
          ))}
        </ChipGroup>
        <SegmentedControl
          className="mt-3"
          aria-label="Betting"
          options={BETTING_OPTIONS}
          value={form.defaultBetting}
          onChange={(defaultBetting) => update({ defaultBetting })}
        />
      </Glass>
    </section>
  );
};
