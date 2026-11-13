import { Icon } from "./icons";

type RebuyRequestProps = {
  name: string;
  /** Which buy-in this would be (2 = first rebuy). */
  buyIn: number;
  onDecide: (approve: boolean) => void;
};

/** Banker: approve or deny a busted player's rebuy. */
export const RebuyRequest = ({ name, buyIn, onDecide }: RebuyRequestProps) => (
  <div className="flex items-center gap-2 rounded-[14px] border border-gold/60 bg-gold/[0.12] py-2 pl-3 pr-2">
    <Icon name="bank" size={18} className="shrink-0 text-gold" />
    <p className="min-w-0 flex-1 text-sm text-white">
      {name} wants to rebuy (buy-in #{buyIn})
    </p>
    <button
      type="button"
      onClick={() => onDecide(false)}
      aria-label={`Deny ${name}'s rebuy`}
      className="min-h-11 shrink-0 rounded-full px-3 text-sm font-medium text-red outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-red">
      Deny
    </button>
    <button
      type="button"
      onClick={() => onDecide(true)}
      aria-label={`Approve ${name}'s rebuy`}
      className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">
      Approve
    </button>
  </div>
);
