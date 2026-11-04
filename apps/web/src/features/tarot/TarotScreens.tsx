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

function TarotCardIllustration({ glyph, name, index }: { glyph: string; name: string; index: number }) {
  const isMoon = glyph === "☾" || /луна/i.test(name);
  const isSun = glyph === "☼" || /солнце/i.test(name);
  const isStar = glyph === "✦" || /звезд/i.test(name);
  const isHeart = glyph === "♡" || /люб|императр/i.test(name);
  const motif = isMoon ? "moon" : isSun ? "sun" : isStar ? "star" : isHeart ? "heart" : "orbit";

  return (
    <svg className={`tarot-card-illustration tarot-card-illustration--${motif}`} viewBox="0 0 200 278" aria-hidden="true">
      <defs>
        <radialGradient id={`tarotGlow-${index}`} cx="50%" cy="42%" r="56%">
          <stop offset="0%" stopColor="#e9cda9" stopOpacity=".24" />
          <stop offset="100%" stopColor="#e9cda9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`tarotInk-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f0d8b5" />
          <stop offset="1" stopColor="#b88e64" />
        </linearGradient>
      </defs>
      <rect x="7" y="7" width="186" height="264" rx="5" fill="#130d1c" stroke={`url(#tarotInk-${index})`} strokeWidth="1.4"/>
      <rect x="14" y="14" width="172" height="250" rx="3" fill="none" stroke="#d9b983" strokeOpacity=".48"/>
      <path d="M25 52V25h27M175 52V25h-27M25 226v27h27M175 226v27h-27" fill="none" stroke="#e8cfad" strokeOpacity=".75" strokeWidth="1.2"/>
      <path d="M100 22v9m-4.5-4.5h9M100 247v9m-4.5-4.5h9M22 139h9m-4.5-4.5v9M169 139h9m-4.5-4.5v9" stroke="#d9b983" strokeOpacity=".8"/>
      <circle cx="100" cy="133" r="70" fill={`url(#tarotGlow-${index})`}/>
      <circle cx="100" cy="133" r="58" fill="none" stroke="#d9b983" strokeOpacity=".45"/>
      <circle cx="100" cy="133" r="48" fill="none" stroke="#d9b983" strokeOpacity=".25" strokeDasharray="1.8 5"/>
      {motif === "moon" && (
        <g fill="none" stroke="#f0d8b5" strokeWidth="2">
          <path d="M115 75c-31 8-43 43-25 68 17 23 49 23 67 3-28 5-52-14-52-40 0-13 4-23 10-31z" fill="#d8b48a" fillOpacity=".2"/>
          <path d="M100 54v13m-6.5-6.5h13M60 134h12m-6-6v12M139 183v12m-6-6h12" strokeOpacity=".7"/>
          <circle cx="138" cy="91" r="3" fill="#f0d8b5" stroke="none"/>
          <circle cx="66" cy="174" r="2" fill="#f0d8b5" stroke="none"/>
        </g>
      )}
      {motif === "sun" && (
        <g fill="none" stroke="#f0d8b5" strokeWidth="1.7">
          <circle cx="100" cy="133" r="26" fill="#d9b983" fillOpacity=".18"/>
          <circle cx="100" cy="133" r="18"/>
          {Array.from({length:12},(_,i)=>{
            const a=i*Math.PI/6, x1=100+Math.cos(a)*35,y1=133+Math.sin(a)*35,x2=100+Math.cos(a)*47,y2=133+Math.sin(a)*47;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>;
          })}
        </g>
      )}
      {motif === "star" && (
        <g fill="none" stroke="#f0d8b5" strokeWidth="1.7" strokeLinejoin="round">
          <path d="m100 75 13 42 42 16-42 14-13 42-14-42-42-14 42-16z" fill="#d9b983" fillOpacity=".12"/>
          <path d="m100 93 8 29 29 11-29 9-8 29-9-29-29-9 29-11z"/>
          <circle cx="100" cy="133" r="5" fill="#f0d8b5" stroke="none"/>
        </g>
      )}
      {motif === "heart" && (
        <g fill="none" stroke="#f0d8b5" strokeWidth="1.9" strokeLinecap="round">
          <path d="M100 177 57 137c-27-27 8-62 35-37l8 8 8-8c27-25 62 10 35 37z" fill="#d9b983" fillOpacity=".1"/>
          <path d="M100 62v15m-7.5-7.5h15M49 118l12 5m90-5-12 5M62 186l8-10m60 10-8-10"/>
          <circle cx="100" cy="108" r="3" fill="#f0d8b5" stroke="none"/>
        </g>
      )}
      {motif === "orbit" && (
        <g fill="none" stroke="#f0d8b5" strokeWidth="1.6">
          <ellipse cx="100" cy="133" rx="43" ry="18" transform="rotate(-42 100 133)"/>
          <ellipse cx="100" cy="133" rx="43" ry="18" transform="rotate(42 100 133)"/>
          <circle cx="100" cy="133" r="14" fill="#d9b983" fillOpacity=".18"/>
          <circle cx="100" cy="133" r="5" fill="#f0d8b5" stroke="none"/>
          <circle cx="62" cy="102" r="4" fill="#d9b983"/>
          <circle cx="136" cy="163" r="4" fill="#d9b983"/>
        </g>
      )}
      <path d="M49 216h102M65 223h70" stroke="#d9b983" strokeOpacity=".55"/>
      <text x="100" y="239" fill="#e8cfad" fontSize="8" letterSpacing="2.2" textAnchor="middle">ARCANA · {String(index+1).padStart(2,"0")}</text>
      <path d="m100 34 3 5 5 3-5 3-3 5-3-5-5-3 5-3zM100 261l2 3 3 2-3 2-2 3-2-3-3-2 3-2z" fill="#e9cda9"/>
    </svg>
  );
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
                    <TarotCardIllustration glyph={card.glyph} name={card.name} index={index} />
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
