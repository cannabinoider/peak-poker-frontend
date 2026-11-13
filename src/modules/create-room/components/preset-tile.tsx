import { cn } from "@/lib/utils/styles";

type PresetTileProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
};

/** A buy-in preset card (₹300 / ₹50 / Custom): gold tint and border when selected. */
export const PresetTile = ({
  title,
  subtitle,
  selected,
  onSelect,
}: PresetTileProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "flex min-w-0 flex-1 flex-col items-center rounded-[18px] border py-4 outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-gold/60",
      selected ? "border-[1.5px] border-gold bg-gold/[0.16]" : "border-glass bg-glass",
    )}>
    <span
      className={cn(
        "tabular text-xl font-black leading-tight",
        selected ? "text-gold" : "text-text",
      )}>
      {title}
    </span>
    <span className="tabular mt-0.5 text-xs text-dim">{subtitle}</span>
  </button>
);
