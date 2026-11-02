import * as Astronomy from "astronomy-engine";
import {
  localDateToUtcWindow,
  localDateTimeToUtcCandidates,
  sampleUtcWindow,
  unknownTimeZoneDateWindow,
} from "./timezone.js";
import type {
  ChartPrecision,
  NatalAngle,
  NatalChartResult,
  NatalHouse,
  NatalPlanetPlacement,
} from "./types.js";

export const NATAL_ALGORITHM_VERSION = "pcj-natal-1.0.0";

const ZODIAC_SIGNS = [
  "Овен",
  "Телец",
  "Близнецы",
  "Рак",
  "Лев",
  "Дева",
  "Весы",
  "Скорпион",
  "Стрелец",
  "Козерог",
  "Водолей",
  "Рыбы",
] as const;

const PLANETS = [
  { id: "sun", name: "Солнце", glyph: "☉" },
  { id: "moon", name: "Луна", glyph: "☾" },
  { id: "mercury", name: "Меркурий", glyph: "☿", body: Astronomy.Body.Mercury },
  { id: "venus", name: "Венера", glyph: "♀", body: Astronomy.Body.Venus },
  { id: "mars", name: "Марс", glyph: "♂", body: Astronomy.Body.Mars },
  { id: "jupiter", name: "Юпитер", glyph: "♃", body: Astronomy.Body.Jupiter },
  { id: "saturn", name: "Сатурн", glyph: "♄", body: Astronomy.Body.Saturn },
  { id: "uranus", name: "Уран", glyph: "♅", body: Astronomy.Body.Uranus },
  { id: "neptune", name: "Нептун", glyph: "♆", body: Astronomy.Body.Neptune },
  { id: "pluto", name: "Плутон", glyph: "♇", body: Astronomy.Body.Pluto },
] as const;

export interface NatalBirthData {
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  birthTimeZone?: string;
  birthLatitude?: number;
  birthLongitude?: number;
}

export class NatalCalculationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "NatalCalculationError";
  }
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function zodiacIndex(longitude: number): number {
  return Math.floor(normalizeDegrees(longitude) / 30);
}

function signForLongitude(longitude: number): string {
  return ZODIAC_SIGNS[zodiacIndex(longitude)]!;
}

function angleForLongitude(longitude: number): NatalAngle {
  const normalized = normalizeDegrees(longitude);
  return {
    sign: signForLongitude(normalized),
    longitudeDegrees: normalized,
    degreeInSign: normalized % 30,
  };
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year!, month! - 1, day!);
  date.setUTCHours(0, 0, 0, 0);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day;
}

function bodyLongitude(planetId: string, date: Date): number {
  if (planetId === "sun") return Astronomy.SunPosition(date).elon;
  if (planetId === "moon") return Astronomy.EclipticGeoMoon(date).lon;

  const planet = PLANETS.find((item) => item.id === planetId);
  if (!planet || !("body" in planet)) {
    throw new Error(`Unsupported planet: ${planetId}`);
  }

  return Astronomy.Ecliptic(
    Astronomy.GeoVector(planet.body, date, true),
  ).elon;
}

function localDateTimeParts(birth: NatalBirthData) {
  const [year, month, day] = birth.birthDate.split("-").map(Number);
  const [hour, minute] = (birth.birthTime ?? "12:00").split(":").map(Number);
  return {
    year: year!,
    month: month!,
    day: day!,
    hour: hour!,
    minute: minute!,
    second: 0,
  };
}

function resolveCalculationInstants(birth: NatalBirthData): {
  precision: ChartPrecision;
  instants: Date[];
  start: Date;
  end: Date;
  notes: string[];
} {
  if (!isValidDate(birth.birthDate)) {
    throw new NatalCalculationError("invalid_birth_date", "Проверь дату рождения в профиле.");
  }

  const notes: string[] = [];
  if (birth.birthTime && birth.birthTimeZone) {
    const candidates = localDateTimeToUtcCandidates(
      localDateTimeParts(birth),
      birth.birthTimeZone,
    );

    if (candidates.length === 0) {
      throw new NatalCalculationError(
        "nonexistent_local_birth_time",
        "Указанное местное время не существовало в этом часовом поясе из-за перевода часов. Проверь время рождения.",
      );
    }

    if (candidates.length === 1) {
      const instant = candidates[0]!;
      return {
        precision: "exact-time",
        instants: [instant],
        start: instant,
        end: new Date(instant.getTime() + 1),
        notes: ["Планетарные положения рассчитаны для указанного местного времени и часового пояса."],
      };
    }

    notes.push("В этот день местное время повторялось при окончании летнего времени. Показаны знаки, общие для обоих возможных моментов; Асцендент и дома не рассчитываются.");
    return {
      precision: "ambiguous-local-time",
      instants: candidates,
      start: candidates[0]!,
      end: candidates[candidates.length - 1]!,
      notes,
    };
  }

  let window;
  let precision: ChartPrecision;
  if (birth.birthTime && !birth.birthTimeZone) {
    notes.push("Часовой пояс не указан. Введённое время не используется, чтобы не подменять его догадкой.");
    precision = "unknown-timezone";
    window = unknownTimeZoneDateWindow(birth.birthDate);
  } else if (birth.birthTimeZone) {
    try {
      window = localDateToUtcWindow(birth.birthDate, birth.birthTimeZone);
    } catch {
      throw new NatalCalculationError(
        "invalid_birth_timezone",
        "Не удалось определить календарный день в указанном часовом поясе. Проверь формат IANA, например Europe/Tallinn.",
      );
    }
    precision = "date-only";
    notes.push("Время рождения не указано. Знаки показаны только там, где они остаются одинаковыми во всём местном дне; градусы, Асцендент и дома не рассчитываются.");
  } else {
    notes.push("Не указаны ни время, ни часовой пояс. Рассмотрен расширенный возможный интервал с учётом часовых поясов Земли; точные градусы, Асцендент и дома не рассчитываются.");
    precision = "unknown-timezone";
    window = unknownTimeZoneDateWindow(birth.birthDate);
  }

  return {
    precision,
    instants: sampleUtcWindow(window),
    start: window.start,
    end: window.end,
    notes,
  };
}

function getAscendant(date: Date, latitude: number, longitude: number): NatalAngle | null {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const eclipticToEquator = Astronomy.Rotation_ECT_EQD(date);
  const equatorToHorizon = Astronomy.Rotation_EQD_HOR(date, observer);
  const astroTime = new Astronomy.AstroTime(date);

  const horizonVector = (eclipticLongitude: number) => {
    const radians = (eclipticLongitude * Math.PI) / 180;
    const eclipticVector = new Astronomy.Vector(
      Math.cos(radians),
      Math.sin(radians),
      0,
      astroTime,
    );
    const equatorialVector = Astronomy.RotateVector(eclipticToEquator, eclipticVector);
    return Astronomy.RotateVector(equatorToHorizon, equatorialVector);
  };

  const roots: number[] = [];
  const stepDegrees = 1;
  let previousLongitude = 0;
  let previousVector = horizonVector(previousLongitude);

  for (let currentLongitude = stepDegrees; currentLongitude <= 360; currentLongitude += stepDegrees) {
    const normalizedLongitude = normalizeDegrees(currentLongitude);
    const currentVector = horizonVector(normalizedLongitude);

    if (previousVector.z === 0 || previousVector.z * currentVector.z < 0) {
      let low = previousLongitude;
      let high = currentLongitude;
      let lowZ = previousVector.z;

      for (let iteration = 0; iteration < 36; iteration += 1) {
        const middle = (low + high) / 2;
        const middleVector = horizonVector(normalizeDegrees(middle));
        if (middleVector.z === 0) {
          low = middle;
          high = middle;
          break;
        }
        if (lowZ * middleVector.z <= 0) {
          high = middle;
        } else {
          low = middle;
          lowZ = middleVector.z;
        }
      }

      const root = normalizeDegrees((low + high) / 2);
      if (!roots.some((existing) => Math.abs(normalizeDegrees(existing - root)) < 0.01)) {
        roots.push(root);
      }
    }

    previousLongitude = currentLongitude;
    previousVector = currentVector;
  }

  // Astronomy Engine's HOR frame uses +Y toward the west. The eastern
  // horizon therefore has a negative Y component.
  const easternRoot = roots.find((root) => horizonVector(root).y < 0);
  return easternRoot === undefined ? null : angleForLongitude(easternRoot);
}

function makeHouses(ascendant: NatalAngle): NatalHouse[] {
  const firstSign = zodiacIndex(ascendant.longitudeDegrees);
  return Array.from({ length: 12 }, (_, index) => {
    const signIndex = (firstSign + index) % 12;
    return {
      number: index + 1,
      sign: ZODIAC_SIGNS[signIndex]!,
      startLongitude: signIndex * 30,
    };
  });
}

function houseForLongitude(longitude: number, ascendant: NatalAngle): number {
  return (
    (zodiacIndex(longitude) - zodiacIndex(ascendant.longitudeDegrees) + 12) % 12
  ) + 1;
}

export function calculateNatalChart(birth: NatalBirthData): NatalChartResult {
  if (
    (birth.birthLatitude === undefined) !==
    (birth.birthLongitude === undefined)
  ) {
    throw new NatalCalculationError(
      "incomplete_birth_coordinates",
      "Для расчёта Асцендента укажи и широту, и долготу места рождения.",
    );
  }

  if (
    birth.birthLatitude !== undefined &&
    (birth.birthLatitude < -90 || birth.birthLatitude > 90 ||
      birth.birthLongitude! < -180 || birth.birthLongitude! > 180)
  ) {
    throw new NatalCalculationError(
      "invalid_birth_coordinates",
      "Координаты места рождения выходят за допустимый диапазон.",
    );
  }

  const resolved = resolveCalculationInstants(birth);
  const samples = resolved.instants.map((instant) => ({
    instant,
    positions: PLANETS.map((planet) => ({
      planet,
      longitude: normalizeDegrees(bodyLongitude(planet.id, instant)),
    })),
  }));

  const exact = resolved.precision === "exact-time";
  const hasCoordinates =
    birth.birthLatitude !== undefined && birth.birthLongitude !== undefined;
  let ascendant: NatalAngle | null = null;
  let houses: NatalHouse[] | null = null;

  if (exact && hasCoordinates) {
    ascendant = getAscendant(
      resolved.instants[0]!,
      birth.birthLatitude!,
      birth.birthLongitude!,
    );
    if (ascendant) {
      houses = makeHouses(ascendant);
    } else {
      resolved.notes.push("Асцендент не удалось определить для этой комбинации времени и координат. Проверь данные места рождения.");
    }
  } else if (exact && !hasCoordinates) {
    resolved.notes.push("Для Асцендента и домов нужны координаты места рождения. Планетарные положения рассчитаны по точному времени.");
  } else if (!exact && hasCoordinates) {
    resolved.notes.push("Координаты места сохранены, но без однозначного момента рождения Асцендент и дома не рассчитываются.");
  }

  const placements: NatalPlanetPlacement[] = PLANETS.map((planet, index) => {
    const longitudes = samples.map((sample) => sample.positions[index]!.longitude);
    const possibleSigns = [...new Set(longitudes.map(signForLongitude))];
    const exactLongitude = exact ? longitudes[0]! : null;

    return {
      id: planet.id,
      name: planet.name,
      glyph: planet.glyph,
      sign: exactLongitude !== null
        ? signForLongitude(exactLongitude)
        : possibleSigns.length === 1
          ? possibleSigns[0]!
          : null,
      possibleSigns,
      longitudeDegrees: exactLongitude,
      degreeInSign: exactLongitude === null
        ? null
        : normalizeDegrees(exactLongitude) % 30,
      houseNumber: exactLongitude !== null && ascendant
        ? houseForLongitude(exactLongitude, ascendant)
        : null,
    };
  });

  const precisionLabel: Record<ChartPrecision, string> = {
    "exact-time": "Точное время рождения",
    "date-only": "Расчёт по дате рождения",
    "unknown-timezone": "Расчёт с неопределённым часовым поясом",
    "ambiguous-local-time": "Возможны два момента рождения",
  };

  return {
    algorithmVersion: NATAL_ALGORITHM_VERSION,
    zodiac: "tropical",
    houseSystem: houses ? "whole-sign" : null,
    precision: resolved.precision,
    precisionLabel: precisionLabel[resolved.precision],
    precisionNotes: resolved.notes,
    calculationWindow: {
      startUtc: resolved.start.toISOString(),
      endUtc: resolved.end.toISOString(),
    },
    ascendant,
    houses,
    placements,
    calculatedAt: new Date().toISOString(),
  };
}
