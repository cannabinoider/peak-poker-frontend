type IconProps = { className?: string };

/** Material "account_balance" (the banker). */
export const BankIcon = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z" />
  </svg>
);

/** Material "flag_outlined" (end the game). */
export const FlagIcon = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="m14 6-1-2H5v17h2v-7h5l1 2h7V6zm4 8h-4l-1-2H7V6h5l1 2h5z" />
  </svg>
);

/** Material "emoji_events_outlined" (game over trophy). */
export const TrophyIcon = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2M5 8V7h2v3.82C5.84 10.4 5 9.3 5 8m7 6c-1.65 0-3-1.35-3-3V5h6v6c0 1.65-1.35 3-3 3m7-6c0 1.3-.84 2.4-2 2.82V7h2z" />
  </svg>
);

/** Material "receipt_long" (the ledger). */
export const LedgerIcon = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2zM15 20H6c-.55 0-1-.45-1-1v-1h10zm4-1c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11z" />
    <path d="M9 7h6v2H9zm7 0h2v2h-2zm-7 3h6v2H9zm7 0h2v2h-2z" />
  </svg>
);
