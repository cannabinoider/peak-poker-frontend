/** Backend path for a room's public summary. */
export const roomSummaryUrl = (code: string) =>
  `/rooms/${encodeURIComponent(code.toUpperCase())}`;
