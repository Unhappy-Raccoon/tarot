import assert from "node:assert/strict";
import test from "node:test";
import { calculateNatalChart } from "./calculator.js";
import {
  calculateDailyTransits,
  calculateTransitNatalAspects,
  getLocalDate,
  isValidTimeZone,
} from "./transits.js";

test("calculates ten tropical transit positions for local noon", () => {
  const snapshot = calculateDailyTransits("2024-03-31", "Europe/Tallinn");
  assert.equal(snapshot.positions.length, 10);
  assert.equal(snapshot.calculatedForUtc, "2024-03-31T09:00:00.000Z");
  assert.equal(snapshot.zodiac, "tropical");
  assert.ok(snapshot.positions.every((item) =>
    Number.isFinite(item.longitudeDegrees) &&
    item.longitudeDegrees >= 0 &&
    item.longitudeDegrees < 360 &&
    item.degreeInSign >= 0 &&
    item.degreeInSign < 30,
  ));
});

test("detects local calendar date across a UTC boundary", () => {
  assert.equal(getLocalDate(new Date("2024-03-31T21:30:00.000Z"), "Europe/Tallinn"), "2024-04-01");
});

test("rejects invalid time zones and dates", () => {
  assert.equal(isValidTimeZone("Europe/Tallinn"), true);
  assert.equal(isValidTimeZone("Mars/Olympus"), false);
  assert.throws(() => calculateDailyTransits("2024-02-30", "Europe/Tallinn"));
  assert.throws(() => calculateDailyTransits("2024-03-31", "Not/AZone"));
});

test("only returns major transit aspects supported by exact natal longitudes", () => {
  const natal = calculateNatalChart({
    birthDate: "1995-05-17",
    birthTime: "12:00",
    birthTimeZone: "Europe/Tallinn",
  });
  const transits = calculateDailyTransits("2024-03-31", "Europe/Tallinn");
  const aspects = calculateTransitNatalAspects(transits, natal);
  assert.ok(aspects.length <= 8);
  assert.ok(aspects.every((aspect) =>
    Number.isFinite(aspect.orbDegrees) &&
    aspect.orbDegrees >= 0 &&
    aspect.orbDegrees <= 6 &&
    ["соединение", "секстиль", "квадрат", "трин", "оппозиция"].includes(aspect.aspect),
  ));

  const impreciseNatal = calculateNatalChart({
    birthDate: "1995-05-17",
    birthTimeZone: "Europe/Tallinn",
  });
  assert.deepEqual(calculateTransitNatalAspects(transits, impreciseNatal), []);
});
