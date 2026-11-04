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
      <PageHeading title="Таро" description="Выбери расклад для себя" onBack={onBack} />
      <p className="tarot-intro-copy">Прислушайся к вопросу — и открой карты.</p>
      <div className="tarot-spread-heading"><span>ТВОИ РАСКЛАДЫ</span><small>3 практики</small></div>
      <div className="tarot-spread-list">
        {spreads.map((spread) => (
          <article className="spread-card" key={spread.id}>
            <div className="spread-card__art" aria-hidden="true">
              <span className="spread-card__number">{spread.number}</span>
              {spread.id === "daily" ? (
                <svg className="spread-artwork spread-artwork--single" viewBox="0 0 120 150" aria-hidden="true">
                  <rect x="18" y="9" width="84" height="132" rx="8" />
                  <rect x="25" y="16" width="70" height="118" rx="5" />
                  <circle cx="60" cy="75" r="28" />
                  <circle cx="60" cy="75" r="18" />
                  <path d="M60 36v78M21 75h78M60 47l5 28-5 28-5-28zM60 10v9M60 131v9" />
                  <path d="m60 57 4 14-4 4-4-4z" className="spread-artwork__fill" />
                </svg>
              ) : spread.id === "past-present-future" ? (
                <svg className="spread-artwork spread-artwork--triple" viewBox="0 0 150 125" aria-hidden="true">
                  <g transform="rotate(-9 43 64)"><rect x="8" y="13" width="56" height="98" rx="6"/><circle cx="36" cy="62" r="18"/><path d="M36 34v56M8 62h56"/></g>
                  <g><rect x="49" y="8" width="56" height="102" rx="6"/><circle cx="77" cy="59" r="18"/><path d="M77 31v56M49 59h56"/></g>
                  <g transform="rotate(9 106 64)"><rect x="88" y="13" width="54" height="98" rx="6"/><circle cx="115" cy="62" r="18"/><path d="M115 34v56M89 62h53"/></g>
                </svg>
              ) : (
                <svg className="spread-artwork spread-artwork--love" viewBox="0 0 130 130" aria-hidden="true">
                  <path d="M65 104 22 64C-2 39 25 9 49 29l16 14 16-14c24-20 51 10 27 35z"/>
                  <path d="M65 10v15M16 35l12 9M114 35l-12 9M13 78l16-4M117 78l-16-4M31 15l7 12M99 15l-7 12"/>
                  <circle cx="65" cy="43" r="3" className="spread-artwork__fill" />
                </svg>
              )}
            </div>
            <div className="spread-card__body">
              <span className="card-eyebrow">{spread.count}</span>
              <h2>{spread.title}</h2>
              <p>{spread.subtitle}</p>
              <button className="text-cta" type="button" disabled={busySpread !== null} onClick={() => onSelect(spread.id)}>
                {busySpread === spread.id ? "Перемешиваем карты…" : "Открыть"} <span aria-hidden="true">→</span>
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
  const [revealed, setRevealed] = useState<string[]>(() => reading.cards.map((card) => card.cardId));
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
      <PageHeading title="Твой расклад" description={reading.title} onBack={onBack} />
      <div className="reading-meta-row">
        <span>{reading.cards.length === 1 ? "ОДНА КАРТА · ОДНО ПОСЛАНИЕ" : "ТРИ КАРТЫ · ОДНА ИСТОРИЯ"}</span>
        <time>{dateLabel}</time>
      </div>
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
        <div className="result-action-row">
          <span className="journal-saved-note"><span aria-hidden="true">✓</span> Сохранено в журнале</span>
          <button className="result-back-link" type="button" onClick={onBack}>К раскладам <span aria-hidden="true">→</span></button>
        </div>
        <p className="demo-disclaimer">Карты выбираются случайно на сервере. Трактовки — авторские справочные тексты для саморефлексии, не гарантированные предсказания.</p>
        {!allRevealed && <p className="demo-disclaimer">Открыто карт: {revealed.length} из {reading.cards.length}</p>}
      </div>
    </div>
  );
}
