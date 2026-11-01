import { randomInt } from "node:crypto";
import { tarotDeck } from "./cards.js";
import { getTarotSpread } from "./spreads.js";
import type { TarotCardDraw, TarotSpreadId } from "./types.js";

export function shuffleTarotDeck<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

export function drawTarotCards(spreadId: TarotSpreadId): TarotCardDraw[] {
  const spread = getTarotSpread(spreadId);
  if (!spread) throw new Error("Unknown tarot spread");

  const drawn = shuffleTarotDeck(tarotDeck).slice(0, spread.positions.length);
  return spread.positions.map((position, index) => {
    const card = drawn[index]!;
    return {
      positionId: position.id,
      positionLabel: position.label,
      cardId: card.id,
      name: card.name,
      arcana: card.arcana,
      ...(card.suit ? { suit: card.suit } : {}),
      glyph: card.glyph,
      keywords: card.keywords,
      orientation: "upright",
      interpretation: card.interpretation,
      reflectionPrompt: card.reflectionPrompt,
    };
  });
}

export function createReadingSummary(
  spreadId: TarotSpreadId,
  cards: TarotCardDraw[],
): string {
  const spread = getTarotSpread(spreadId);
  if (!spread) throw new Error("Unknown tarot spread");

  if (spreadId === "daily") {
    return `Твоя карта дня — «${cards[0]!.name}». Прочитай её как подсказку для саморефлексии, а не как предопределённый прогноз. Выбери одну мысль, которую захочешь взять с собой в сегодняшний день.`;
  }

  if (spreadId === "past-present-future") {
    return "Три позиции показывают символическую линию размышления: опыт, текущую ситуацию и возможное направление. Будущее не предопределено — используй расклад, чтобы яснее увидеть собственный выбор.";
  }

  return "Этот расклад посвящён отношениям и контакту с собой. Он не определяет чувства другого человека и не заменяет открытый разговор: используй карты как повод бережно исследовать свои потребности и границы.";
}
