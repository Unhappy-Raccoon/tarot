import type { ReactNode } from "react";
import type { Screen, UserProfile } from "../../types";

interface Props {
  profile: UserProfile;
  displayName: string;
  onNavigate: (screen: Screen) => void;
  onDailyCard: () => void;
  busy?: boolean;
}

function QuickTile({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
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
          <QuickTile icon={<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="4" width="13" height="22" rx="2" transform="rotate(-9 13.5 15)"/><rect x="13" y="6" width="13" height="22" rx="2" transform="rotate(8 19.5 17)"/><path d="m19 12 1.2 3.2 3.2 1.2-3.2 1.2L19 21l-1.2-3.4-3.2-1.2 3.2-1.2z"/></svg>} label="Таро" onClick={() => onNavigate("tarot")} />
          <QuickTile icon={<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="M16 4v24M4 16h24M7.5 7.5l17 17m0-17-17 17M16 10l2.2 6-2.2 6-2.2-6z"/></svg>} label="Натальная карта" onClick={() => onNavigate("natal")} />
          <QuickTile icon={<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v26M3 16h26M6.8 6.8l18.4 18.4M25.2 6.8 6.8 25.2"/><circle cx="16" cy="16" r="5"/></svg>} label="Астролог" onClick={() => onNavigate("astrologer")} />
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
