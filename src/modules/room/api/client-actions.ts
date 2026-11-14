import { fetchClient } from "@/lib/fetch";

import type { RoomSummary } from "../types";

import { roomSummaryUrl } from "./constants";

/** What anyone with the code can see before joining (no player names). */
export const getRoomSummary = async (code: string) => {
  const res = await fetchClient.get<RoomSummary>({ url: roomSummaryUrl(code) });
  return res.data;
};
