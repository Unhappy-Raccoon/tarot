import { useState } from "react";
import type { SpreadId, TarotReading } from "../../types";
import { PageHeading } from "../../components/PageHeading";

interface SelectionProps {
  onSelect: (spread: SpreadId) => void;
  onBack: () => void;
  busySpread?: SpreadId | null;
  error?: string;
}

const spreads: { id: SpreadId; number: string; title: string; subtitle: string; count: string; glyph: string }[] = [
  { id: "daily", number: "01", title: "Карта дня", subtitle: "Одна карта · энергия и подсказка на сегодня", count: "1 КАРТА", glyph: "☾" },
  { id: "past-present-future", number: "02", title: "Прошлое · настоящее · будущее", subtitle: "Три позиции · увидеть путь целиком", count: "3 КАРТЫ", glyph: "✧" },
  { id: "love", number: "03", title: "Любовь и отношения", subtitle: "Три позиции · чувства, динамика и направление", count: "3 КАРТЫ", glyph: "♡" },
];

export function TarotSelectionScreen({ onSelect, onBack, busySpread = null, error }: SelectionProps) {
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
              <button className="text-cta" type="button" disabled={busySpread !== null} onClick={() => onSelect(spread.id)}>
                {busySpread === spread.id ? "Перемешиваем карты…" : "Выбрать расклад"} <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="disclaimer">Таро — инструмент саморефлексии и вдохновения, а не гарантированное предсказание.</p>
    </div>
  );
}

interface ResultProps {
  reading: TarotReading;
  onBack: () => void;
}

export function TarotResultScreen({ reading, onBack }: ResultProps) {
  const [revealed, setRevealed] = useState<string[]>([]);
  const allRevealed = reading.cards.every((card) => revealed.includes(card.cardId));

  function toggleCard(cardId: string) {
    setRevealed((current) => current.includes(cardId)
      ? current.filter((id) => id !== cardId)
      : [...current, cardId]);
  }

  const createdAt = new Date(reading.createdAt);
  const dateLabel = Number.isNaN(createdAt.valueOf())
    ? ""
    : new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(createdAt);

  return (
    <div className="page-screen tarot-result-screen">
      <PageHeading eyebrow="ТВОЙ РАСКЛАД" title={reading.title} description="Открывай карты по очереди и прислушивайся к собственным ощущениям." onBack={onBack} />
      <p className="reading-date">{dateLabel}</p>
      <div className={`revealed-cards revealed-cards--${reading.cards.length}`}>
        {reading.cards.map((card, index) => {
          const isRevealed = revealed.includes(card.cardId);
          return (
            <article className="revealed-card-wrap" key={card.positionId}>
              <span className="revealed-card-position">{card.positionLabel}</span>
              <button
                className={`tarot-flip-card ${isRevealed ? "is-revealed" : ""}`}
                type="button"
                aria-pressed={isRevealed}
                aria-label={isRevealed ? `Закрыть карту ${card.name}` : `Открыть карту в позиции ${card.positionLabel}`}
                onClick={() => toggleCard(card.cardId)}
              >
                <span className="tarot-flip-card__inner">
                  <span className="tarot-flip-card__back">
                    <span className="tarot-back-moon">☾</span>
                    <span className="tarot-back-stars">✧ · ✦ · ✧</span>
                    <span className="tarot-back-caption">PERSONAL COSMIC JOURNAL</span>
                  </span>
                  <span className="tarot-flip-card__front">
                    <span className="revealed-card__corner">{index + 1}</span>
                    <span className="revealed-card__symbol">{card.glyph}</span>
                    <span className="revealed-card__title">{card.name}</span>
                    <span className="revealed-card__ornament">✧ · ✧</span>
                  </span>
                </span>
              </button>
              <p className="revealed-card-name">{isRevealed ? card.name : "Карта закрыта"}</p>
              {!isRevealed && <button className="reveal-text-button" type="button" onClick={() => toggleCard(card.cardId)}>Открыть карту</button>}
            </article>
          );
        })}
      </div>
      <section className="interpretation-panel">
        <span className="card-eyebrow">ОБЩАЯ ТРАКТОВКА</span>
        <h2>Главное послание</h2>
        <p>{reading.summary}</p>
        <div className="interpretation-divider" />
        {reading.cards.map((card) => (
          <article className="meaning-row" key={card.positionId}>
            <span className="meaning-symbol" aria-hidden="true">{card.glyph}</span>
            <div>
              <small>{card.positionLabel}</small>
              <h3>{card.name}</h3>
              <p>{card.interpretation}</p>
              <p className="reflection-question">Для размышления: {card.reflectionPrompt}</p>
              <div className="keyword-list">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            </div>
          </article>
        ))}
      </section>
      <div className="result-actions">
        <p className="journal-saved-note">✦ Расклад сохранён в твоём журнале</p>
        <p className="demo-disclaimer">Карты выбираются случайно на сервере. Трактовки — авторские справочные тексты для саморефлексии, не гарантированные предсказания.</p>
        {!allRevealed && <p className="demo-disclaimer">Открыто карт: {revealed.length} из {reading.cards.length}</p>}
      </div>
    </div>
  );
}
