import { InfoIcon } from "../components/icons";

/** Plain statement of what Peak Poker is (and is not). */
export const LegalFooter = () => (
  <footer className="mt-auto pt-10 text-xs leading-relaxed text-faint">
    <div className="flex gap-2">
      <span
        aria-hidden
        className="mt-0.5 inline-flex size-4 shrink-0 [&>svg]:size-full">
        <InfoIcon />
      </span>
      <div className="flex flex-col gap-2">
        <p>
          Peak Poker is a free, private chip tracker for home games among friends. It
          does not handle real money: there are no payments, deposits or withdrawals,
          and no fees or rake.
        </p>
        <p>
          Rupee amounts only show what your group agreed the chips stand for. Any
          settling up happens among yourselves, outside the app. Please follow the laws
          where you live.
        </p>
      </div>
    </div>
  </footer>
);
