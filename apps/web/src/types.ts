export type Screen =
  | "home"
  | "tarot"
  | "tarot-result"
  | "natal"
  | "daily-horoscope"
  | "astrologer"
  | "journal"
  | "profile"
  | "premium";

export type SpreadId = "daily" | "past-present-future" | "love";

export interface TarotReadingCard {
  positionId: string;
  positionLabel: string;
  cardId: string;
  name: string;
  arcana: "major" | "minor";
  suit?: string;
  glyph: string;
  keywords: string[];
  orientation: "upright";
  interpretation: string;
  reflectionPrompt: string;
}

export interface TarotReading {
  id: string;
  spreadId: SpreadId;
  title: string;
  summary: string;
  cards: TarotReadingCard[];
  createdAt: string;
}

export interface BirthProfile {
  displayName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  birthTimeZone?: string;
  birthLatitude?: number;
  birthLongitude?: number;
}

export interface NatalPlanetPlacement {
  id: string;
  name: string;
  glyph: string;
  sign: string | null;
  possibleSigns: string[];
  longitudeDegrees: number | null;
  degreeInSign: number | null;
  houseNumber: number | null;
}

export interface NatalHouse {
  number: number;
  sign: string;
  startLongitude: number;
}

export interface NatalChartResult {
  algorithmVersion: string;
  zodiac: "tropical";
  houseSystem: "whole-sign" | null;
  precision: "exact-time" | "date-only" | "unknown-timezone" | "ambiguous-local-time";
  precisionLabel: string;
  precisionNotes: string[];
  calculationWindow: { startUtc: string; endUtc: string };
  ascendant: { sign: string; longitudeDegrees: number; degreeInSign: number } | null;
  houses: NatalHouse[] | null;
  placements: NatalPlanetPlacement[];
  calculatedAt: string;
}

export interface UserProfile {
  telegramId?: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  plan: "free" | "premium";
  birthProfile: BirthProfile | null;
}


export interface TransitPosition {
  id: string;
  name: string;
  glyph: string;
  longitudeDegrees: number;
  sign: string;
  degreeInSign: number;
  retrograde: boolean;
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

export interface DailyHoroscope {
  id: string;
  localDate: string;
  timeZone: string;
  title: string;
  content: string;
  transits: {
    localDate: string;
    timeZone: string;
    calculatedForUtc: string;
    zodiac: "tropical";
    positions: TransitPosition[];
  };
  aspects: TransitNatalAspect[];
  natalPrecision: string;
  createdAt: string;
}

export interface HoroscopePreferences {
  timeZone: string;
  notificationsEnabled: boolean;
  notificationTime: string;
}
