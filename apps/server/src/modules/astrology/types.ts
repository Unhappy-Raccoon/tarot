export type ChartPrecision =
  | "exact-time"
  | "date-only"
  | "unknown-timezone"
  | "ambiguous-local-time";

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

export interface NatalAngle {
  sign: string;
  longitudeDegrees: number;
  degreeInSign: number;
}

export interface NatalChartResult {
  algorithmVersion: string;
  zodiac: "tropical";
  houseSystem: "whole-sign" | null;
  precision: ChartPrecision;
  precisionLabel: string;
  precisionNotes: string[];
  calculationWindow: {
    startUtc: string;
    endUtc: string;
  };
  ascendant: NatalAngle | null;
  houses: NatalHouse[] | null;
  placements: NatalPlanetPlacement[];
  calculatedAt: string;
}
