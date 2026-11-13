import { fetchClient } from "@/lib/fetch";

import { closeRoomUrl } from "./constants";

/**
 * The owner closes a room for everyone. The backend checks that `token` (this
 * device's session token for the room) belongs to the room's owner.
 */
export const closeRoom = async (code: string, token: string) => {
  await fetchClient.post<null>({ url: closeRoomUrl(code), headers: { token } });
};
