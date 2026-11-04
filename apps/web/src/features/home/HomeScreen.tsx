import type { Screen, UserProfile } from "../../types";

interface Props {
  profile: UserProfile;
  displayName: string;
  onNavigate: (screen: Screen) => void;
  onDailyCard: () => void;
  busy?: boolean;
}

function QuickTile({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className="quick-tile" type="button" onClick={onClick}>
      <span className="quick-tile__icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function HomeScreen({ profile, displayName, onNavigate, onDailyCard, busy = false }: Props) {
  const firstName = displayName.trim().split(/\s+/)[0] || profile.firstName || "Путешественница";

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-moon" aria-hidden="true">
          <span className="moon-crescent">☾</span>
          <span className="moon-star">✦</span>
        </div>
        <button className="icon-button home-settings" type="button" aria-label="Открыть профиль и настройки" onClick={() => onNavigate("profile")}>⚙</button>
        <h1>Привет, {firstName} <span className="gold-sparkle">✦</span></h1>
        <p>Твой день начинается здесь</p>
      </header>

      <section className="home-section" aria-label="Карта дня">
        <button className="daily-card" type="button" onClick={onDailyCard} disabled={busy}>
          <span className="daily-card__front">
            <span className="daily-card__eyebrow">ТАРО · ТВОЙ ЕЖЕДНЕВНЫЙ РИТУАЛ</span>
            <span className="serif-title">Карта дня</span>
            <span className="daily-card__copy">{busy ? "Открываем твою карту…" : "Раскрой энергию сегодняшнего дня"}</span>
            <span className="round-arrow" aria-hidden="true">→</span>
          </span>
        </button>
      </section>



      <section className="home-section quick-section">
        <div className="section-heading-row">
          <h2>Быстрый доступ</h2>
          <span className="section-caption">ТВОИ РИТУАЛЫ</span>
        </div>
        <div className="quick-grid">
          <QuickTile icon="♧" label="Таро" onClick={() => onNavigate("tarot")} />
          <QuickTile icon="✧" label="Натальная карта" onClick={() => onNavigate("natal")} />
          <QuickTile icon="☼" label="Астролог" onClick={() => onNavigate("astrologer")} />
        </div>
      </section>

      <button className="streak-card" type="button" onClick={() => onNavigate("journal")}>
        <span className="streak-flame" aria-hidden="true">✦</span>
        <span className="streak-text">
          <strong>Серия дней</strong>
          <small>Создай свой первый ежедневный ритуал</small>
          <span className="streak-track" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        </span>
        <span className="streak-value">0 дней <span aria-hidden="true">→</span></span>
      </button>

      <button className="horoscope-link" type="button" onClick={() => onNavigate("daily-horoscope")}>
        <span className="horoscope-link__icon" aria-hidden="true">☾</span>
        <span><strong>Гороскоп дня</strong><small>Космическая погода и подсказка на сегодня</small></span>
        <span className="horoscope-link__arrow" aria-hidden="true">→</span>
      </button>
            <p className="home-footnote">ТВОЁ ПРОСТРАНСТВО · ТВОЙ РИТМ · ТВОЯ ВСЕЛЕННАЯ</p>
    </div>
  );
}
