import { ANIMALS, Avatar } from "@/lib/components/avatar";
import { GoldButton, OutlineButton, TextButton } from "@/lib/components/button";
import { BetChip, Chip, ChipStack, NetAmount } from "@/lib/components/chip";
import { Glass } from "@/lib/components/glass";
import { Pill } from "@/lib/components/pill";
import { PlayingCard, SuitIcon } from "@/lib/components/playing-card";
import { SectionTitle } from "@/lib/components/section-title";
import { TextField } from "@/lib/components/text-field";

import { CelebrationPreview } from "./celebration-preview";

const SUITS = ["spades", "hearts", "diamonds", "clubs"] as const;

/** Every shared component on one page, to compare against the phone app. */
export const DesignPreview = () => (
  <main className="mx-auto flex max-w-md flex-col gap-6 p-4 pb-16">
    <h1 className="text-2xl font-black text-gold">Design preview</h1>

    <Glass>
      <SectionTitle>Playing cards</SectionTitle>
      <div className="flex flex-wrap items-end gap-2">
        <PlayingCard card="As" width={48} />
        <PlayingCard card="Kh" width={48} />
        <PlayingCard card="10d" width={48} />
        <PlayingCard card="7c" width={48} highlight />
        <PlayingCard card="Qs" width={48} mark="wild" />
        <PlayingCard card="5h" width={48} mark="poison" />
        <PlayingCard card={null} width={48} />
        <PlayingCard card={null} width={48} placeholder />
        <PlayingCard card="2s" width={40} dimmed animate={false} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-dim">
        {SUITS.map((s) => (
          <SuitIcon key={s} suit={s} size={20} title={s} />
        ))}
        <span>
          Discard 10 <SuitIcon suit="hearts" size="1em" />
        </span>
      </div>
    </Glass>

    <Glass>
      <SectionTitle>Players</SectionTitle>
      <div className="grid grid-cols-5 gap-3">
        {ANIMALS.map((a, i) => (
          <Avatar key={a} name={a} seat={i} animal={a} size={48} />
        ))}
      </div>
      <div className="mt-3 flex gap-3">
        {["Amit Shah", "Bina", "Chetan K"].map((n, i) => (
          <Avatar key={n} name={n} seat={i} size={40} />
        ))}
      </div>
    </Glass>

    <Glass>
      <SectionTitle>Chips and money</SectionTitle>
      <div className="flex items-center gap-4">
        <Chip />
        <ChipStack count={4} size={20} />
        <BetChip amount={1500} />
        <NetAmount value={412.5} />
        <NetAmount value={-300} variant="whole" />
        <NetAmount value={0} />
      </div>
    </Glass>

    <Glass>
      <SectionTitle>Labels</SectionTitle>
      <div className="flex flex-wrap gap-2">
        <Pill>Friday big game</Pill>
        <Pill tone="gold">Hold&apos;em · NL</Pill>
        <Pill tone="glass">10 × 100</Pill>
        <Pill tone="green">Your turn</Pill>
        <Pill tone="red">All-in</Pill>
      </div>
    </Glass>

    <Glass>
      <SectionTitle>Inputs and buttons</SectionTitle>
      <div className="flex flex-col gap-3">
        <TextField label="Your name" hint="e.g. Amit" maxLength={20} />
        <TextField label="Buy-in amount" prefix="₹ " dense defaultValue="300" />
        <TextField
          label="Room code"
          error="Room ABCD2345 not found."
          defaultValue="ABCD2345"
        />
        <GoldButton>Create room</GoldButton>
        <GoldButton loading>Joining…</GoldButton>
        <OutlineButton>Best split</OutlineButton>
        <OutlineButton tone="danger" height={50}>
          End game &amp; settle up
        </OutlineButton>
        <TextButton>Rules</TextButton>
      </div>
    </Glass>

    <Glass>
      <SectionTitle>Winner celebration</SectionTitle>
      <CelebrationPreview />
    </Glass>
  </main>
);
