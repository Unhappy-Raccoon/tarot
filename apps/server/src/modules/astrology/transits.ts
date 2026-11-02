import * as Astronomy from "astronomy-engine";
import { localDateTimeToUtcCandidates } from "./timezone.js";
import type { NatalChartResult } from "./types.js";

const BODIES = [
  { id: "sun", name: "Солнце", glyph: "☉", body: null },
  { id: "moon", name: "Луна", glyph: "☾", body: null },
  { id: "mercury", name: "Меркурий", glyph: "☿", body: Astronomy.Body.Mercury },
  { id: "venus", name: "Венера", glyph: "♀", body: Astronomy.Body.Venus },
  { id: "mars", name: "Марс", glyph: "♂", body: Astronomy.Body.Mars },
  { id: "jupiter", name: "Юпитер", glyph: "♃", body: Astronomy.Body.Jupiter },
  { id: "saturn", name: "Сатурн", glyph: "♄", body: Astronomy.Body.Saturn },
  { id: "uranus", name: "Уран", glyph: "♅", body: Astronomy.Body.Uranus },
  { id: "neptune", name: "Нептун", glyph: "♆", body: Astronomy.Body.Neptune },
  { id: "pluto", name: "Плутон", glyph: "♇", body: Astronomy.Body.Pluto },
] as const;

const SIGNS = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
] as const;

export interface TransitPosition {
  id: string;
  name: string;
  glyph: string;
  longitudeDegrees: number;
  sign: string;
  degreeInSign: number;
  retrograde: boolean;
}

export interface DailyTransitSnapshot {
  localDate: string;
  timeZone: string;
  calculatedForUtc: string;
  zodiac: "tropical";
  positions: TransitPosition[];
}

export interface TransitNatalAspect {
  transitPlanetId: string;
  transitPlanetName: string;
  natalPlanetId: string;
  natalPlanetName: string;
  aspect: "соединение" | "секстиль" | "квадрат" | "трин" | "оппозиция";
  exactAngle: number;
  orbDegrees: number;
}

function normalize(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signedDelta(value: number): number {
  return ((value + 540) % 360) - 180;
}

function longitude(id: string, date: Date): number {
  if (id === "sun") return Astronomy.SunPosition(date).elon;
  if (id === "moon") return Astronomy.EclipticGeoMoon(date).lon;
  const entry = BODIES.find((item) => item.id === id);
  if (!entry?.body) throw new Error(`Unsupported transit body: ${id}`);
  return Astronomy.Ecliptic(Astronomy.GeoVector(entry.body, date, true)).elon;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function getLocalDate(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

export function calculateDailyTransits(localDate: string, timeZone: string): DailyTransitSnapshot {
  if (!validDate(localDate)) throw new Error("invalid_local_date");
  if (!isValidTimeZone(timeZone)) throw new Error("invalid_time_zone");
  const [year, month, day] = localDate.split("-").map(Number);
  const instants = localDateTimeToUtcCandidates(
    { year: year!, month: month!, day: day!, hour: 12, minute: 0, second: 0 },
    timeZone,
  );
  const instant = instants[0];
  if (!instant) throw new Error("local_noon_not_resolvable");

  const previous = new Date(instant.getTime() - 86_400_000);
  const next = new Date(instant.getTime() + 86_400_000);
  const positions = BODIES.map((entry): TransitPosition => {
    const currentLongitude = normalize(longitude(entry.id, instant));
    const before = normalize(longitude(entry.id, previous));
    const after = normalize(longitude(entry.id, next));
    const motion = signedDelta(after - before);
    return {
      id: entry.id,
      name: entry.name,
      glyph: entry.glyph,
      longitudeDegrees: currentLongitude,
      sign: SIGNS[Math.floor(currentLongitude / 30)]!,
      degreeInSign: currentLongitude % 30,
      retrograde: entry.id !== "sun" && entry.id !== "moon" && motion < 0,
    };
  });

  return {
    localDate,
    timeZone,
    calculatedForUtc: instant.toISOString(),
    zodiac: "tropical",
    positions,
  };
}

const ASPECTS = [
  { angle: 0, orb: 6, name: "соединение" as const },
  { angle: 60, orb: 3, name: "секстиль" as const },
  { angle: 90, orb: 4, name: "квадрат" as const },
  { angle: 120, orb: 4, name: "трин" as const },
  { angle: 180, orb: 6, name: "оппозиция" as const },
] as const;

export function calculateTransitNatalAspects(
  transits: DailyTransitSnapshot,
  natalChart: NatalChartResult,
): TransitNatalAspect[] {
  const natal = natalChart.placements.filter(
    (placement) => placement.longitudeDegrees !== null,
  );
  if (natal.length === 0) return [];

  const aspects: TransitNatalAspect[] = [];
  for (const transit of transits.positions) {
    for (const natalPlanet of natal) {
      const separation = Math.abs(signedDelta(
        transit.longitudeDegrees - natalPlanet.longitudeDegrees!,
      ));
      const match = ASPECTS
        .map((aspect) => ({ ...aspect, orbDegrees: Math.abs(separation - aspect.angle) }))
        .filter((aspect) => aspect.orbDegrees <= aspect.orb)
        .sort((left, right) => left.orbDegrees - right.orbDegrees)[0];
      if (!match) continue;
      aspects.push({
        transitPlanetId: transit.id,
        transitPlanetName: transit.name,
        natalPlanetId: natalPlanet.id,
        natalPlanetName: natalPlanet.name,
        aspect: match.name,
        exactAngle: match.angle,
        orbDegrees: Number(match.orbDegrees.toFixed(2)),
      });
    }
  }
  return aspects.sort((left, right) => left.orbDegrees - right.orbDegrees).slice(0, 8);
}
