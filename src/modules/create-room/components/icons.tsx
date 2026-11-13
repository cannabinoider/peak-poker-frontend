/** Material-style icons used on the setup screen, drawn inline (24×24, currentColor). */
const icon = (d: string, filled = false) => {
  const Icon = () => (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  return Icon;
};

export const BackIcon = icon("M20 12H5M11 5l-7 7 7 7");
export const EditIcon = icon("M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4");
export const AddIcon = icon("M12 5v14M5 12h14");
export const CloseIcon = icon("M6 6l12 12M18 6L6 18");
export const ErrorIcon = icon("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5v5M12 16v.5");
export const WarningIcon = icon("M12 3.5L2.5 20h19L12 3.5zM12 10v4.5M12 17.5v.5");
/** Magic wand (Flutter `Icons.auto_fix_high`), marks custom games. */
export const WandIcon = icon(
  "M4 20L15 9M13 7l4 4M18 3v3M16.5 4.5h3M20 9v2M19 10h2M9 3v2M8 4h2",
);
/** Broadcast (Flutter `Icons.wifi_tethering`), on the create button. */
export const BroadcastIcon = icon(
  "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8",
);
