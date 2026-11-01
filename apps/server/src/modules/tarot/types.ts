export type TarotSpreadId = "daily" | "past-present-future" | "love";

export interface TarotSpreadPosition {
  id: string;
  label: string;
  prompt: string;
}

export interface TarotSpreadDefinition {
  id: TarotSpreadId;
  title: string;
  description: string;
  positions: TarotSpreadPosition[];
}

export interface TarotCardDefinition {
  id: string;
  name: string;
  arcana: "major" | "minor";
  suit?: string;
  glyph: string;
  keywords: string[];
  interpretation: string;
  reflectionPrompt: string;
}

export interface TarotCardDraw {
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
  spreadId: TarotSpreadId;
  title: string;
  summary: string;
  cards: TarotCardDraw[];
  createdAt: string;
}
