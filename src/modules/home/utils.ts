/** Room codes the backend accepts (letters and digits, 4–12 long). */
const CODE_RE = /^[A-Za-z0-9]{4,12}$/;

export interface ParsedInvite {
  code: string;
  /** The join secret after `#`, still URL-encoded as it was in the link. */
  secret: string | null;
}

/**
 * Reads what a player pasted: a full invite link (`https://…/r/CODE#secret`), a path
 * (`/r/CODE#secret`) or a bare code (`abcd 2345`). Null if it isn't any of those.
 */
export const parseInvite = (input: string): ParsedInvite | null => {
  const s = input.trim();
  if (s.length === 0) {
    return null;
  }
  const hash = s.indexOf("#");
  const before = hash >= 0 ? s.slice(0, hash) : s;
  const secret = hash >= 0 ? s.slice(hash + 1).trim() : "";
  const match = /(?:^|\/)r\/([^/?#\s]+)/i.exec(before);
  const code = match ? match[1] : before.replace(/[\s-]+/g, "");
  if (!CODE_RE.test(code)) {
    return null;
  }
  return { code: code.toUpperCase(), secret: secret.length > 0 ? secret : null };
};

/** Where to go for a parsed invite: `/r/CODE#secret` or `/r/CODE`. */
export const invitePath = ({ code, secret }: ParsedInvite) =>
  secret === null ? `/r/${code}` : `/r/${code}#${secret}`;

/**
 * What a failed "Close room" request means. Null: the room is already gone
 * (closed or expired), so it can leave the list just like after a success.
 * Otherwise the message to show. `status` is null when the server wasn't reached.
 */
export const closeRoomError = (status: number | null): string | null => {
  if (status === 404) {
    return null;
  }
  if (status === 401 || status === 403) {
    return "Only the host can close this room.";
  }
  if (status === 429) {
    return "Too many tries. Wait a moment and try again.";
  }
  return status === null
    ? "Couldn't reach the server. Check your connection and try again."
    : "Couldn't close the room. Try again.";
};
