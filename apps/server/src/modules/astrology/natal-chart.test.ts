import assert from "node:assert/strict";
import test from "node:test";
import { calculateNatalChart, NatalCalculationError } from "./calculator.js";
import { localDateTimeToUtcCandidates, localDateToUtcWindow } from "./timezone.js";

test("resolves IANA time zones with winter and summer offsets", () => {
  const winter = localDateTimeToUtcCandidates(
    { year: 2024, month: 1, day: 1, hour: 12, minute: 0 },
    "Europe/Tallinn",
  );
  const summer = localDateTimeToUtcCandidates(
    { year: 2024, month: 7, day: 1, hour: 12, minute: 0 },
    "Europe/Tallinn",
  );

  assert.equal(winter.length, 1);
  assert.equal(winter[0]!.toISOString(), "2024-01-01T10:00:00.000Z");
  assert.equal(summer.length, 1);
  assert.equal(summer[0]!.toISOString(), "2024-07-01T09:00:00.000Z");
});

test("detects DST gaps and repeated local times", () => {
  const missing = localDateTimeToUtcCandidates(
    { year: 2024, month: 3, day: 31, hour: 3, minute: 30 },
    "Europe/Tallinn",
  );
  const repeated = localDateTimeToUtcCandidates(
    { year: 2024, month: 10, day: 27, hour: 3, minute: 30 },
    "Europe/Tallinn",
  );

  assert.equal(missing.length, 0);
  assert.equal(repeated.length, 2);
});

test("local day window includes 23-hour and 25-hour daylight-saving days", () => {
  const spring = localDateToUtcWindow("2024-03-31", "Europe/Tallinn");
  const autumn = localDateToUtcWindow("2024-10-27", "Europe/Tallinn");

  assert.equal((spring.end.getTime() - spring.start.getTime()) / 3_600_000, 23);
  assert.equal((autumn.end.getTime() - autumn.start.getTime()) / 3_600_000, 25);
});

test("calculates ten tropical zodiac placements from an exact UTC-equivalent moment", () => {
  const chart = calculateNatalChart({
    birthDate: "2024-03-20",
    birthTime: "14:00",
    birthTimeZone: "Europe/Tallinn",
  });

  assert.equal(chart.precision, "exact-time");
  assert.equal(chart.placements.length, 10);
  assert.equal(chart.placements.find((item) => item.id === "sun")?.sign, "Овен");
  assert.ok(chart.placements.every((item) => item.possibleSigns.length === 1));
  assert.equal(chart.ascendant, null);
  assert.equal(chart.houses, null);
});

test("does not invent an Ascendant when birth time is missing", () => {
  const chart = calculateNatalChart({
    birthDate: "1995-05-17",
    birthTimeZone: "Europe/Tallinn",
    birthLatitude: 59.437,
    birthLongitude: 24.7536,
  });

  assert.equal(chart.precision, "date-only");
  assert.equal(chart.ascendant, null);
  assert.equal(chart.houses, null);
  assert.ok(chart.precisionNotes.some((note) => note.includes("не указано")));
});

test("calculates an Ascendant and Whole Sign houses only with an exact time and coordinates", () => {
  const chart = calculateNatalChart({
    birthDate: "1995-05-17",
    birthTime: "12:00",
    birthTimeZone: "Europe/Tallinn",
    birthLatitude: 59.437,
    birthLongitude: 24.7536,
  });

  assert.ok(chart.ascendant);
  assert.equal(chart.houses?.length, 12);
  assert.equal(chart.houseSystem, "whole-sign");
  assert.ok(chart.placements.some((item) => item.houseNumber === 1));
});

test("rejects a nonexistent local wall-clock birth time", () => {
  assert.throws(
    () => calculateNatalChart({
      birthDate: "2024-03-31",
      birthTime: "03:30",
      birthTimeZone: "Europe/Tallinn",
    }),
    (error: unknown) =>
      error instanceof NatalCalculationError &&
      error.code === "nonexistent_local_birth_time",
  );
});

test("shows all possible zodiac signs when time zone is unknown", () => {
  const chart = calculateNatalChart({
    birthDate: "2024-03-20",
    birthTime: "12:00",
  });

  assert.equal(chart.precision, "unknown-timezone");
  assert.ok(chart.placements.every((item) => item.longitudeDegrees === null));
  assert.ok(chart.precisionNotes.some((note) => note.includes("не используется")));
});
