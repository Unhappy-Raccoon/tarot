export const astrologerScenarios = [
  {
    id: "relationships",
    title: "Отношения",
    starter: "Хочу бережно разобраться в теме отношений.",
    instruction: "Фокус: собственные чувства, взаимность, коммуникация, границы и личные потребности. Не делай выводов о мыслях или намерениях третьих лиц.",
  },
  {
    id: "potential",
    title: "Мой потенциал",
    starter: "Хочу исследовать свои сильные стороны и возможности развития.",
    instruction: "Фокус: сильные стороны, интересы, ресурсы, обучение и реалистичные следующие шаги. Не обещай успех или конкретные результаты.",
  },
  {
    id: "weekly-energy",
    title: "Энергия недели",
    starter: "Помоги выбрать намерение и ориентир на ближайшую неделю.",
    instruction: "Фокус: рефлексия, приоритеты, баланс и небольшие ритуалы на ближайшую неделю. Не утверждай, что анализируешь реальные транзиты: транзитный расчёт в приложении пока не подключён.",
  },
  {
    id: "natal-chart",
    title: "Натальная карта",
    starter: "Помоги понять символику моих натальных положений.",
    instruction: "Фокус: объяснение доступных натальных положений простым языком, взаимосвязей и вопросов для самонаблюдения. Отмечай, если данных для Асцендента или домов недостаточно.",
  },
] as const;

export type AstrologerScenarioId = (typeof astrologerScenarios)[number]["id"];

export function isAstrologerScenarioId(value: unknown): value is AstrologerScenarioId {
  return typeof value === "string" &&
    astrologerScenarios.some((scenario) => scenario.id === value);
}

export function getAstrologerScenario(value: unknown) {
  return isAstrologerScenarioId(value)
    ? astrologerScenarios.find((scenario) => scenario.id === value) ?? null
    : null;
}
