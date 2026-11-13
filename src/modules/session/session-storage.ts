import { readJson, removeKey, writeJson } from "@/lib/utils/local-store";

/**
 * The only things the browser keeps: who you are in each room (session token
 * and name), the last name you used, and your card-privacy preference. All
 * game state lives on the server.
 */
export interface RoomSession {
  code: string;
  token: string;
  name: string;
  /** When this device last joined, for "your rooms". */
  joinedAt: number;
  /** This device created the room (offers "Close room"; the server checks). */
  isOwner?: boolean;
}

const PREFIX = "peakpoker.";
const sessionKey = (code: string) => `${PREFIX}room.${code.toUpperCase()}`;
const ownerKey = (code: string) => `${PREFIX}owner.${code.toUpperCase()}`;
const LAST_NAME_KEY = `${PREFIX}lastName`;
const ROOMS_KEY = `${PREFIX}rooms`;

export const getRoomSession = (code: string) => readJson<RoomSession>(sessionKey(code));

export const saveRoomSession = (session: RoomSession) => {
  writeJson(sessionKey(session.code), session);
  writeJson(LAST_NAME_KEY, session.name);
  const codes = new Set(readJson<string[]>(ROOMS_KEY) ?? []);
  codes.add(session.code.toUpperCase());
  writeJson(ROOMS_KEY, [...codes].slice(-20));
};

export const forgetRoomSession = (code: string) => {
  removeKey(sessionKey(code));
  const codes = (readJson<string[]>(ROOMS_KEY) ?? []).filter(
    (c) => c !== code.toUpperCase(),
  );
  writeJson(ROOMS_KEY, codes);
};

/** Rooms this device has joined, newest first. */
export const listRoomSessions = (): RoomSession[] =>
  (readJson<string[]>(ROOMS_KEY) ?? [])
    .map((c) => getRoomSession(c))
    .filter((s): s is RoomSession => s !== null)
    .sort((a, b) => b.joinedAt - a.joinedAt);

/**
 * The one-time owner token from creating a room, kept until this device's
 * first join in it uses it up.
 */
export const saveOwnerToken = (code: string, token: string) =>
  writeJson(ownerKey(code), token);

export const getOwnerToken = (code: string) => readJson<string>(ownerKey(code));

export const forgetOwnerToken = (code: string) => removeKey(ownerKey(code));

export const getLastName = () => readJson<string>(LAST_NAME_KEY) ?? "";

/** The join secret from a share link: `/r/CODE#secret`. Never sent to a server log. */
export const secretFromHash = (hash: string) => {
  const s = hash.replace(/^#/, "").trim();
  return s.length > 0 ? decodeURIComponent(s) : null;
};
