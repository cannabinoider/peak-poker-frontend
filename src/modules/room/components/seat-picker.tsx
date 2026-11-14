import { SeatRing } from "@/lib/components/seat-ring";
import { cn } from "@/lib/utils/styles";

type SeatPickerProps = {
  maxSeats: number;
  freeSeats: number[];
  /** The picked seat, or null for "any free seat". */
  value: number | null;
  onChange: (seat: number | null) => void;
};

/**
 * Pick where to sit before joining. Taken seats show as filled dots (no names
 * before you join); tap a free one, or tap it again for any free seat.
 */
export const SeatPicker = ({
  maxSeats,
  freeSeats,
  value,
  onChange,
}: SeatPickerProps) => (
  <div>
    <p className="pb-1 text-sm text-dim">
      Seat{" "}
      <span className="text-faint">
        · {value === null ? "any free seat" : `seat ${value + 1}`}
      </span>
    </p>
    <SeatRing
      count={maxSeats}
      className="max-w-[260px]"
      renderSeat={(i) => {
        const free = freeSeats.includes(i);
        if (!free) {
          return (
            <span
              aria-label={`Seat ${i + 1}, taken`}
              role="img"
              className="block size-8 rounded-full bg-white/25"
            />
          );
        }
        const picked = value === i;
        return (
          <button
            type="button"
            onClick={() => onChange(picked ? null : i)}
            aria-pressed={picked}
            aria-label={`Seat ${i + 1}, free`}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border-2 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/60",
              picked
                ? "border-gold bg-gold text-black/[0.87]"
                : "border-dashed border-white/40 text-dim hover:border-white/70",
            )}>
            {i + 1}
          </button>
        );
      }}
    />
  </div>
);
