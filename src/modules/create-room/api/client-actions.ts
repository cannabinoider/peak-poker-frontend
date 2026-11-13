import { fetchClient } from "@/lib/fetch";

import type { ICreatedRoom, ICreateRoomRequest } from "../types";

import { ROOMS_URL } from "./constants";

/**
 * Creates a room. Called from the browser (not a server action): the backend rate
 * limits room creation per IP, so the request must come from the player's own IP.
 */
export const createRoom = async (request: ICreateRoomRequest) => {
  const res = await fetchClient.post<ICreatedRoom, ICreateRoomRequest>({
    url: ROOMS_URL,
    data: request,
  });
  return res.data;
};
