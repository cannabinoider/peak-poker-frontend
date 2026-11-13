import { SuitIcon } from "@/lib/components/playing-card";

/** Felt-green rounded square with a white spade, the name and the tagline. */
export const Logo = () => (
  <div className="flex flex-col items-center text-center">
    <div
      aria-hidden
      className="flex size-[72px] items-center justify-center rounded-[22px] bg-gradient-to-br from-felt-center to-felt-edge shadow-[0_0_24px_rgb(var(--felt-center)/0.5)]">
      <SuitIcon suit="spades" size={38} color="#fff" />
    </div>
    <h1 className="mt-4 text-[28px] font-black leading-tight tracking-[-0.5px] text-text md:text-[40px]">
      Peak Poker
    </h1>
    <p className="mt-1 text-dim">
      Poker night with friends · we keep track of the chips
    </p>
  </div>
);
