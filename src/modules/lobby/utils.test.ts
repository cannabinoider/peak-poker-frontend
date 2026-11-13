import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Room } from "./types.ts";
import {
  chipsLabel,
  gameLabel,
  inviteLink,
  lobbyRoles,
  setupSummary,
} from "./utils.ts";

const setup: Room["setup"] = {
  presetId: "rs300",
  buyInRupees: 300,
  chips: [
    { value: 25, count: 2 },
    { value: 500, count: 2 },
    { value: 100, count: 3 },
    { value: 50, count: 3 },
  ],
  smallBlind: 25,
  bigBlind: 50,
  dealersChoice: false,
  games: ["holdem", "omaha"],
  defaultGame: "omaha",
  defaultBetting: "potLimit",
  turnSeconds: 40,
  rebuyRule: "max1",
  playOrbit: true,
  customGames: [],
};

const seat = (n: number, isBanker = false) => ({
  seat: n,
  name: `P${n}`,
  stack: 1500,
  connected: true,
  isOwner: n === 0,
  isBanker,
  animal: "owl",
  sittingOut: false,
});

describe("lobby", () => {
  it("builds the invite link only with a secret", () => {
    assert.equal(
      inviteLink("https://peak.example", "AB12", "#s3cret"),
      "https://peak.example/r/AB12#s3cret",
    );
    assert.equal(inviteLink("https://peak.example", "AB12", ""), null);
    assert.equal(inviteLink("https://peak.example", "AB12", "#"), null);
  });

  it("summarises the setup", () => {
    assert.equal(chipsLabel(setup), "2×500 · 3×100 · 3×50 · 2×25");
    assert.equal(gameLabel(setup), "Omaha");
    assert.equal(gameLabel({ ...setup, dealersChoice: true }), "Dealer's choice");
    assert.deepEqual(
      setupSummary(setup).map((i) => i.value),
      [
        "₹300 = 1,500 chips",
        "2×500 · 3×100 · 3×50 · 2×25",
        "25/50",
        "Omaha · Pot Limit",
        "Max 1 rebuy",
        "40s per move",
      ],
    );
    const dc = setupSummary({ ...setup, dealersChoice: true, turnSeconds: 0 });
    assert.equal(dc[3].value, "Dealer's choice · 2 games · a full orbit each");
    assert.equal(dc[5].value, "No limit");
  });

  it("only lets the banker start, with at least 2 players", () => {
    const one = { seats: [seat(0, true)] };
    const two = { seats: [seat(0, true), seat(1)] };
    assert.equal(lobbyRoles(one, { seat: 0, isOwner: true }).canStart, false);
    assert.equal(lobbyRoles(two, { seat: 0, isOwner: true }).canStart, true);
    const guest = lobbyRoles(two, { seat: 1, isOwner: false });
    assert.equal(guest.canStart, false);
    assert.equal(guest.canPickBanker, false);
    assert.equal(guest.banker?.name, "P0");
  });
});
