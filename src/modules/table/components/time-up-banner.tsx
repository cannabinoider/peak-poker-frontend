import { CountdownText } from "./countdown-text";
import { Icon } from "./icons";

type TimeUpBannerProps = {
  seconds: number;
  canAsk: boolean;
  /** "you check", "you fold", "the default game is dealt". */
  autoText: string;
  onMoreTime: () => void;
};

/** Time's up: a few seconds to ask for more before the automatic choice. */
export const TimeUpBanner = ({
  seconds,
  canAsk,
  autoText,
  onMoreTime,
}: TimeUpBannerProps) => (
  <div
    role="alert"
    className="flex items-center gap-2 rounded-[14px] border border-red bg-red/15 py-2 pl-3 pr-2">
    <Icon name="timer" size={22} className="shrink-0 text-red" />
    <div className="min-w-0 flex-1">
      <p className="font-extrabold text-white">Time&apos;s up!</p>
      <p className="truncate text-xs">
        <CountdownText seconds={seconds} className="font-extrabold text-red" />
        <span className="text-dim"> then {autoText}</span>
      </p>
    </div>
    {canAsk && (
      <button
        type="button"
        onClick={onMoreTime}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">
        <Icon name="timer" size={18} />
        More time
      </button>
    )}
  </div>
);
