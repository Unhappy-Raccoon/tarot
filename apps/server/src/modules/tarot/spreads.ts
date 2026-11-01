import type { TarotSpreadDefinition, TarotSpreadId } from "./types.js";

export const tarotSpreads: TarotSpreadDefinition[] = [
  {
    id: "daily",
    title: "Карта дня",
    description: "Одна карта — мягкий ориентир и вопрос для размышления на сегодня.",
    positions: [
      { id: "day", label: "ТВОЯ КАРТА ДНЯ", prompt: "Какую тему полезно держать в фокусе сегодня?" },
    ],
  },
  {
    id: "past-present-future",
    title: "Прошлое · настоящее · будущее",
    description: "Три карты помогают рассмотреть опыт, текущую точку и возможное направление.",
    positions: [
      { id: "past", label: "ПРОШЛОЕ", prompt: "Какой опыт повлиял на ситуацию?" },
      { id: "present", label: "НАСТОЯЩЕЕ", prompt: "Что важно увидеть в текущем моменте?" },
      { id: "future", label: "БУДУЩЕЕ", prompt: "Какое направление может открыться дальше?" },
    ],
  },
  {
    id: "love",
    title: "Любовь и отношения",
    description: "Посмотри на свои чувства, динамику отношений и бережное направление.",
    positions: [
      { id: "feelings", label: "ТВОИ ЧУВСТВА", prompt: "Что происходит в твоих чувствах?" },
      { id: "dynamic", label: "ДИНАМИКА", prompt: "Какая тема заметна во взаимодействии?" },
      { id: "direction", label: "НАПРАВЛЕНИЕ", prompt: "Какой шаг может поддержать здоровый контакт?" },
    ],
  },
];

export function getTarotSpread(id: string): TarotSpreadDefinition | null {
  return tarotSpreads.find((spread) => spread.id === id) ?? null;
}

export function isTarotSpreadId(value: unknown): value is TarotSpreadId {
  return typeof value === "string" && tarotSpreads.some((spread) => spread.id === value);
}
