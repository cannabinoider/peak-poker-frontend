import { fmt } from "../../lib/utils/format.ts";
import {
  bettingLabel,
  blindsLabel,
  gameDisplayName,
  rebuyLabel,
  startingStack,
} from "../rules/utils.ts";

import { MIN_PLAYERS } from "./constants.ts";
import type { Me, Room, SetupItem } from "./types.ts";

/**
 * The share link `origin/r/CODE#secret`, or null when this device has no
 * invite secret in its URL hash (then only the code can be shared).
 */
export const inviteLink = (origin: string, code: string, hash: string) => {
  const secret = hash.replace(/^#/, "").trim();
  return secret ? `${origin}/r/${encodeURIComponent(code)}#${secret}` : null;
};

/** "2×500 · 3×100 · 3×50 · 2×25", biggest chip first. */
export const chipsLabel = (setup: Room["setup"]) =>
  [...setup.chips]
    .sort((a, b) => b.value - a.value)
    .map((c) => `${c.count}×${fmt(c.value)}`)
    .join(" · ");

/** The table's game in a few words, for the header pill. */
export const gameLabel = (setup: Room["setup"]) =>
  setup.dealersChoice ? "Dealer's choice" : gameDisplayName(setup, setup.defaultGame);

/** Setup summary rows for the lobby. */
export const setupSummary = (setup: Room["setup"]): SetupItem[] => [
  {
    label: "Buy-in",
    value: `₹${fmt(setup.buyInRupees)} = ${fmt(startingStack(setup))} chips`,
  },
  { label: "Chips", value: chipsLabel(setup) },
  { label: "Blinds", value: blindsLabel(setup) },
  {
    label: "Game",
    value: setup.dealersChoice
      ? `Dealer's choice · ${setup.games.length} games${setup.playOrbit ? " · a full orbit each" : ""}`
      : `${gameDisplayName(setup, setup.defaultGame)} · ${bettingLabel(setup.defaultBetting)}`,
  },
  { label: "Rebuys", value: rebuyLabel(setup.rebuyRule) },
  {
    label: "Turn time",
    value: setup.turnSeconds > 0 ? `${setup.turnSeconds}s per move` : "No limit",
  },
];

/** Who may do what in the lobby (the server checks again). */
export const lobbyRoles = (
  room: Pick<Room, "seats">,
  me: Pick<Me, "seat" | "isOwner">,
) => {
  const you = room.seats.find((s) => s.seat === me.seat);
  const isBanker = you?.isBanker ?? false;
  return {
    isBanker,
    /** Owner or banker: may hand the banker role to someone else. */
    canPickBanker: me.isOwner || isBanker,
    canStart: isBanker && room.seats.length >= MIN_PLAYERS,
    banker: room.seats.find((s) => s.isBanker) ?? null,
  };
};
