import type { ReactNode } from "react";
import type { Screen, UserProfile } from "../../types";

interface Props {
  profile: UserProfile;
  displayName: string;
  onNavigate: (screen: Screen) => void;
  onDailyCard: () => void;
  busy?: boolean;
}

function QuickTile({ icon, label, onClick, number }: { icon: ReactNode; label: string; onClick: () => void; number: string }) {
  return (
    <button className="quick-tile" type="button" onClick={onClick}>
      <span className="quick-tile__number">{number}</span>
      <span className="quick-tile__icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function HomeScreen({ profile, displayName, onNavigate, onDailyCard, busy = false }: Props) {
  const firstName = displayName.trim().split(/\s+/)[0] || profile.firstName || "Путешественница";
  const date = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="home-screen home-screen--editorial">
      <header className="home-header">
        <div className="home-header__topline">
          <span className="home-wordmark"><i aria-hidden="true">✳</i> PERSONAL COSMIC JOURNAL</span>
          <button className="icon-button home-settings" type="button" aria-label="Открыть профиль и настройки" onClick={() => onNavigate("profile")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2.9-1.2 2-1.4-.6a7.7 7.7 0 0 1-1.6.9l-.2 1.5h-2.4l-.2-1.5a7.7 7.7 0 0 1-1.6-.9l-1.4.6-1.2-2 1.2-.9a7 7 0 0 1 0-1.8l-1.2-.9 1.2-2 1.4.6a7.7 7.7 0 0 1 1.6-.9l.2-1.5h2.4l.2 1.5a7.7 7.7 0 0 1 1.6.9l1.4-.6 1.2 2-1.2.9a7 7 0 0 1 0 1.8Z"/></svg>
          </button>
        </div>
        <p className="home-date">{date}</p>
        <h1>Добрый день,<br/><em>{firstName}.</em></h1>
        <p className="home-subtitle">Твоё пространство для ясности, интуиции и маленьких открытий.</p>
      </header>

      <section className="home-section home-feature-section" aria-label="Карта дня">
        <div className="home-section-kicker"><span>01 / ЕЖЕДНЕВНЫЙ РИТУАЛ</span><span>THE DAILY ARCANA</span></div>
        <button className="daily-card daily-card--editorial" type="button" onClick={onDailyCard} disabled={busy}>
          <span className="daily-card__art" aria-hidden="true">
            <span className="daily-card__orb daily-card__orb--outer"/>
            <span className="daily-card__orb daily-card__orb--inner"/>
            <span className="daily-card__moon">☾</span>
            <span className="daily-card__star daily-card__star--one">✦</span>
            <span className="daily-card__star daily-card__star--two">✧</span>
            <span className="daily-card__horizon"/>
          </span>
          <span className="daily-card__content">
            <span className="daily-card__eyebrow">ТВОЯ КАРТА НА СЕГОДНЯ</span>
            <span className="serif-title">Открой<br/>свой день.</span>
            <span className="daily-card__copy">{busy ? "Карты готовятся…" : "Один символ. Новая перспектива. Мягкая подсказка для себя."}</span>
            <span className="daily-card__action">Открыть карту <i aria-hidden="true">↗</i></span>
          </span>
        </button>
      </section>

      <section className="home-section quick-section home-rituals">
        <div className="section-heading-row">
          <div><p className="eyebrow">ИССЛЕДУЙ СВОЙ МИР</p><h2>Твои практики</h2></div>
          <span className="section-caption">02 — 04</span>
        </div>
        <div className="quick-grid">
          <QuickTile number="02" icon={<svg viewBox="0 0 32 32"><rect x="8" y="4" width="15" height="24" rx="2"/><path d="M12 9h7M12 13h7M12 17h4"/></svg>} label="Таро" onClick={() => onNavigate("tarot")} />
          <QuickTile number="03" icon={<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12"/><path d="M16 4v24M4 16h24M8 8l16 16m0-16L8 24"/></svg>} label="Натальная карта" onClick={() => onNavigate("natal")} />
          <QuickTile number="04" icon={<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4"/><ellipse cx="16" cy="16" rx="13" ry="6" transform="rotate(-35 16 16)"/><path d="M16 2v5m0 18v5"/></svg>} label="Астролог" onClick={() => onNavigate("astrologer")} />
        </div>
      </section>

      <button className="streak-card home-journal-link" type="button" onClick={() => onNavigate("journal")}>
        <span className="streak-flame" aria-hidden="true">✧</span>
        <span className="streak-text"><span className="eyebrow">ТВОЯ ИСТОРИЯ</span><strong>Личный журнал</strong><small>Сохранённые расклады и открытия</small></span>
        <span className="streak-value">Перейти <span aria-hidden="true">↗</span></span>
      </button>
      <p className="home-footnote">СЛУШАЙ СЕБЯ · ЗАМЕЧАЙ ЗНАКИ · ВЫБИРАЙ СВОЙ ПУТЬ</p>
    </div>
  );
}
