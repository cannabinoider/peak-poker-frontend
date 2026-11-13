import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cardLabel,
  cardName,
  parseCard,
  parseSuit,
  SUIT_BLACK,
  SUIT_RED,
} from "./card-utils.ts";

describe("parseCard", () => {
  it("parses engine codes", () => {
    assert.deepEqual(parseCard("As"), {
      code: "As",
      rank: "A",
      rankValue: 14,
      rankLabel: "A",
      suit: "spades",
      color: "black",
      hex: SUIT_BLACK,
    });
    assert.equal(parseCard("2c")?.rankValue, 2);
    assert.equal(parseCard("2c")?.suit, "clubs");
    assert.equal(parseCard("Kd")?.suit, "diamonds");
  });

  it("shows ten as 10, from T or 10", () => {
    const t = parseCard("Td");
    assert.equal(t?.rankLabel, "10");
    assert.equal(t?.rank, "T");
    assert.equal(t?.rankValue, 10);
    const ten = parseCard("10h");
    assert.equal(ten?.code, "Th");
    assert.equal(ten?.rankLabel, "10");
  });

  it("colors hearts and diamonds red", () => {
    assert.equal(parseCard("Qh")?.color, "red");
    assert.equal(parseCard("Qh")?.hex, SUIT_RED);
    assert.equal(parseCard("3d")?.color, "red");
    assert.equal(parseCard("3c")?.color, "black");
    assert.equal(parseCard("3s")?.hex, SUIT_BLACK);
  });

  it("ignores case and surrounding spaces", () => {
    assert.equal(parseCard(" aS ")?.code, "As");
    assert.equal(parseCard("tH")?.code, "Th");
    assert.equal(parseCard("jC")?.code, "Jc");
  });

  it("rejects non-cards", () => {
    for (const bad of ["", "A", "1s", "11h", "Ax", "AKs", "Zs", "s", "  "]) {
      assert.equal(parseCard(bad), null, bad);
    }
  });
});

describe("labels", () => {
  it("cardLabel matches the Flutter text", () => {
    assert.equal(cardLabel(parseCard("Th")!), "10 of hearts");
    assert.equal(cardLabel(parseCard("As")!), "A of spades");
  });

  it("cardName spells the rank", () => {
    assert.equal(cardName(parseCard("As")!), "Ace of spades");
    assert.equal(cardName(parseCard("10d")!), "Ten of diamonds");
    assert.equal(cardName(parseCard("7c")!), "Seven of clubs");
  });
});

describe("parseSuit", () => {
  it("accepts letters and names", () => {
    assert.equal(parseSuit("h"), "hearts");
    assert.equal(parseSuit("S"), "spades");
    assert.equal(parseSuit("Clubs"), "clubs");
    assert.equal(parseSuit("x"), null);
  });
});
