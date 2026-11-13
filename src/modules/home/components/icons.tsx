/** Icons used on the home page, drawn inline (24×24, currentColor). */
const icon = (d: string) => {
  const Icon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  return Icon;
};

export const AddIcon = icon("M12 5v14M5 12h14");
/** Three vertical dots (the row's "more" menu). */
export const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);
export const CloseRoomIcon = icon("M5 5l14 14M19 5L5 19");
export const RemoveIcon = icon("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3");
export const ChevronRightIcon = icon("M9 6l6 6-6 6");
export const LinkIcon = icon(
  "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
);
export const InfoIcon = icon("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 7.5v.5");
