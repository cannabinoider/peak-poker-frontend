/** Backend path the owner posts to (with their session token) to close a room. */
export const closeRoomUrl = (code: string) =>
  `/rooms/${encodeURIComponent(code.toUpperCase())}/close`;
