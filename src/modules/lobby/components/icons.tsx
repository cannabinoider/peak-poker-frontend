type IconProps = { className?: string };

const Icon = ({ className, d }: IconProps & { d: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={d} />
  </svg>
);

export const BackIcon = (p: IconProps) => (
  <Icon {...p} d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
);

export const PlayIcon = (p: IconProps) => <Icon {...p} d="M8 5.14v13.72L19 12z" />;

export const CopyIcon = (p: IconProps) => (
  <Icon
    {...p}
    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
  />
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p} d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
);

export const ShareIcon = (p: IconProps) => (
  <Icon
    {...p}
    d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92"
  />
);

export const BankIcon = (p: IconProps) => (
  <Icon
    {...p}
    d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"
  />
);

export const HourglassIcon = (p: IconProps) => (
  <Icon
    {...p}
    d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2zm10 14.5V20H8v-3.5l4-4zm-4-5-4-4V4h8v3.5z"
  />
);
