import assert from "node:assert/strict";
import test from "node:test";
import { tarotDeck } from "./cards.js";
import { createReadingSummary, drawTarotCards } from "./engine.js";
import { tarotSpreads } from "./spreads.js";

test("catalog contains 78 unique cards", () => {
  assert.equal(tarotDeck.length, 78);
  assert.equal(new Set(tarotDeck.map((card) => card.id)).size, 78);
  assert.equal(tarotDeck.filter((card) => card.arcana === "major").length, 22);
  assert.equal(tarotDeck.filter((card) => card.arcana === "minor").length, 56);
});

test("all approved spreads draw the expected number of unique cards", () => {
  for (const spread of tarotSpreads) {
    const cards = drawTarotCards(spread.id);
    assert.equal(cards.length, spread.positions.length);
    assert.equal(new Set(cards.map((card) => card.cardId)).size, cards.length);
    assert.ok(cards.every((card) => card.interpretation.length > 20));
  }
});

test("daily spread always draws exactly one card", () => {
  const reading = drawTarotCards("daily");
  assert.equal(reading.length, 1);
  assert.equal(reading[0]?.positionId, "day");
});

test("reading summaries explain the reflective nature of each spread", () => {
  for (const spread of tarotSpreads) {
    const cards = drawTarotCards(spread.id);
    const summary = createReadingSummary(spread.id, cards);
    assert.ok(summary.length > 40);
  }
});
