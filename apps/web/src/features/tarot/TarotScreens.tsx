import type { SpreadId } from "../../types";
import { PageHeading } from "../../components/PageHeading";

interface SelectionProps {
  onSelect: (spread: SpreadId) => void;
  onBack: () => void;
}

const spreads: { id: SpreadId; number: string; title: string; subtitle: string; count: string; glyph: string }[] = [
  { id: "daily", number: "01", title: "Карта дня", subtitle: "Одна карта · энергия и подсказка на сегодня", count: "1 КАРТА", glyph: "☾" },
  { id: "past-present-future", number: "02", title: "Прошлое · настоящее · будущее", subtitle: "Три позиции · увидеть путь целиком", count: "3 КАРТЫ", glyph: "✧" },
  { id: "love", number: "03", title: "Любовь и отношения", subtitle: "Три позиции · чувства, динамика и направление", count: "3 КАРТЫ", glyph: "♡" },
];

export function TarotSelectionScreen({ onSelect, onBack }: SelectionProps) {
  return (
    <div className="page-screen tarot-selection-screen">
      <PageHeading title="Таро" description="Остановись на мгновение. Выбери расклад, который откликается тебе сегодня." onBack={onBack} />
      <div className="tarot-spread-list">
        {spreads.map((spread) => (
          <article className="spread-card" key={spread.id}>
            <div className="spread-card__art" aria-hidden="true">
              <span className="spread-card__number">{spread.number}</span>
              <span className="spread-card__glyph">{spread.glyph}</span>
              <span className="spread-card__orbit" />
            </div>
            <div className="spread-card__body">
              <span className="card-eyebrow">{spread.count}</span>
              <h2>{spread.title}</h2>
              <p>{spread.subtitle}</p>
              <button className="text-cta" type="button" onClick={() => onSelect(spread.id)}>
                Выбрать расклад <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="disclaimer">Таро — инструмент саморефлексии и вдохновения, а не гарантированное предсказание.</p>
    </div>
  );
}

interface ResultProps {
  spread: SpreadId;
  onBack: () => void;
  onSave: () => void;
}

const readingContent: Record<SpreadId, {
  title: string;
  positions: { position: string; card: string; meaning: string; symbol: string }[];
  summary: string;
}> = {
  daily: {
    title: "Карта дня",
    positions: [{ position: "ТВОЯ КАРТА", card: "Звезда", meaning: "Надежда, восстановление и доверие своему внутреннему ориентиру.", symbol: "✦" }],
    summary: "Сегодня можно позволить себе замедлиться и вспомнить, что вдохновение часто приходит в тишине.",
  },
  "past-present-future": {
    title: "Прошлое · настоящее · будущее",
    positions: [
      { position: "ПРОШЛОЕ", card: "Луна", meaning: "Интуиция помогала пройти через неопределённость и услышать себя.", symbol: "☾" },
      { position: "НАСТОЯЩЕЕ", card: "Звезда", meaning: "Время восстановить силы, вернуть надежду и выбрать спокойный темп.", symbol: "✦" },
      { position: "БУДУЩЕЕ", card: "Солнце", meaning: "Ясность приходит через открытость, честность и простые радости.", symbol: "☼" },
    ],
    summary: "Этот пример расклада напоминает: путь не обязан быть прямым. Прислушайся к тому, что уже стало яснее, и выбери один небольшой шаг.",
  },
  love: {
    title: "Любовь и отношения",
    positions: [
      { position: "ТВОИ ЧУВСТВА", card: "Императрица", meaning: "Нежность к себе создаёт пространство для близости.", symbol: "❀" },
      { position: "ДИНАМИКА", card: "Влюблённые", meaning: "Честный выбор и открытый разговор помогают увидеть главное.", symbol: "♡" },
      { position: "НАПРАВЛЕНИЕ", card: "Умеренность", meaning: "Баланс, терпение и уважение к границам поддерживают связь.", symbol: "✧" },
    ],
    summary: "В отношениях важно не угадывать чужие мысли, а оставаться в контакте со своими чувствами и говорить о них бережно.",
  },
};

export function TarotResultScreen({ spread, onBack, onSave }: ResultProps) {
  const content = readingContent[spread];

  return (
    <div className="page-screen tarot-result-screen">
      <PageHeading eyebrow="ТВОЙ РАСКЛАД" title={content.title} description="Карты открыты. Прочитай трактовку в своём темпе." onBack={onBack} />
      <div className={`revealed-cards revealed-cards--${content.positions.length}`}>
        {content.positions.map((item, index) => (
          <article className="revealed-card-wrap" key={item.position}>
            <span className="revealed-card-position">{item.position}</span>
            <div className="revealed-card">
              <div className="revealed-card__frame">
                <span className="revealed-card__corner">{index + 1}</span>
                <span className="revealed-card__symbol">{item.symbol}</span>
                <span className="revealed-card__title">{item.card}</span>
                <span className="revealed-card__ornament">✧ · ✧</span>
              </div>
            </div>
            <p className="revealed-card-name">{item.card}</p>
          </article>
        ))}
      </div>
      <section className="interpretation-panel">
        <span className="card-eyebrow">ОБЩАЯ ТРАКТОВКА</span>
        <h2>Главное послание</h2>
        <p>{content.summary}</p>
        <div className="interpretation-divider" />
        {content.positions.map((item) => (
          <article className="meaning-row" key={item.position}>
            <span className="meaning-symbol" aria-hidden="true">{item.symbol}</span>
            <div>
              <small>{item.position}</small>
              <h3>{item.card}</h3>
              <p>{item.meaning}</p>
            </div>
          </article>
        ))}
      </section>
      <div className="result-actions">
        <button className="primary-button" type="button" onClick={onSave}>Сохранить в журнал <span>✦</span></button>
        <p className="demo-disclaimer">Демонстрационная трактовка интерфейса. Реальный выбор карт и сохранение будут подключены отдельно.</p>
      </div>
    </div>
  );
}
