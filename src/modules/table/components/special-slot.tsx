import { PlayingCard } from "@/lib/components/playing-card";
import { POISON_COLOR } from "@/modules/table/constants";
import type { Hand } from "@/modules/table/types";

import { Icon } from "./icons";

const STREETS = ["", "flop", "turn", "river"];

/** The wild / poison card beside the board (an outlined slot until it opens). */
export const SpecialSlot = ({ hand, cardW }: { hand: Hand; cardW: number }) => {
  const wild = hand.special === "wild";
  const color = wild ? "rgb(var(--gold))" : POISON_COLOR;
  const card = hand.specialCard;
  const word = wild ? "WILD" : "POISON";
  const street = hand.specialStreet < STREETS.length ? STREETS[hand.specialStreet] : "";
  return (
    <div className="flex flex-col items-center">
      <div
        className="p-0.5"
        style={{ border: `1.5px solid ${color}`, borderRadius: cardW * 0.18 }}>
        {card ? (
          <PlayingCard card={card} width={cardW} mark={wild ? "wild" : "poison"} />
        ) : (
          <div
            role="img"
            aria-label={`${wild ? "Wild" : "Poison"} card opens on the ${street}`}
            className="flex items-center justify-center opacity-70"
            style={{ width: cardW, height: cardW * 1.4, color }}>
            <Icon name={wild ? "sparkle" : "dangerous"} size={cardW * 0.5} />
          </div>
        )}
      </div>
      <span
        className="mt-0.5 text-[9px] font-black leading-tight tracking-[1px]"
        style={{ color }}>
        {card ? word : `${word} · ${street}`}
      </span>
    </div>
  );
};
