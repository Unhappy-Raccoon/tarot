import type { ReactNode } from "react";
import type { Screen, UserProfile } from "../../types";
import { CelestialBrandMark, DailyMoonIcon, JournalIcon, ProfileIcon, TarotIcon, AstrologyIcon } from "../../components/CelestialIcons";

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
          <span className="home-wordmark"><span className="home-wordmark__mark"><CelestialBrandMark /></span> PERSONAL COSMIC JOURNAL</span>
          <button className="icon-button home-settings" type="button" aria-label="Открыть профиль и настройки" onClick={() => onNavigate("profile")}>
            <ProfileIcon />
          </button>
        </div>
        <p className="home-date">{date}</p>
        <h1>Привет,<br/><em>{firstName}.</em></h1>
        <p className="home-subtitle">Твой день начинается здесь.</p>
      </header>

      <section className="home-section home-feature-section" aria-label="Карта дня">
        <div className="home-section-kicker"><span>01 / ЕЖЕДНЕВНЫЙ РИТУАЛ</span><span>THE DAILY ARCANA</span></div>
        <button className="daily-card daily-card--editorial" type="button" onClick={onDailyCard} disabled={busy}>
          <span className="daily-card__art" aria-hidden="true">
            <span className="daily-card__orb daily-card__orb--outer"/>
            <span className="daily-card__orb daily-card__orb--inner"/>
            <span className="daily-card__moon"><DailyMoonIcon /></span>
            <span className="daily-card__star daily-card__star--one">✦</span>
            <span className="daily-card__star daily-card__star--two">✧</span>
            <span className="daily-card__horizon"/>
          </span>
          <span className="daily-card__content">
            <span className="daily-card__eyebrow">ТВОЯ КАРТА НА СЕГОДНЯ</span>
            <span className="serif-title">Карта<br/>дня.</span>
            <span className="daily-card__copy">{busy ? "Карты готовятся…" : "Раскрой энергию сегодняшнего дня."}</span>
            <span className="daily-card__action">Открыть <i aria-hidden="true">↗</i></span>
          </span>
        </button>
      </section>

      <section className="home-section quick-section home-rituals">
        <div className="section-heading-row">
          <div><p className="eyebrow">ИССЛЕДУЙ СВОЙ МИР</p><h2>Твои практики</h2></div>
          <span className="section-caption">02 — 04</span>
        </div>
        <div className="quick-grid">
          <QuickTile number="02" icon={<TarotIcon />} label="Таро" onClick={() => onNavigate("tarot")} />
          <QuickTile number="03" icon={<AstrologyIcon />} label="Натальная карта" onClick={() => onNavigate("natal")} />
          <QuickTile number="04" icon={<AstrologyIcon />} label="Астролог" onClick={() => onNavigate("astrologer")} />
        </div>
      </section>

      <button className="streak-card home-journal-link" type="button" onClick={() => onNavigate("journal")}>
        <span className="streak-flame" aria-hidden="true"><JournalIcon /></span>
        <span className="streak-text"><span className="eyebrow">ТВОЯ ИСТОРИЯ</span><strong>Личный журнал</strong><small>Сохранённые расклады и открытия</small></span>
        <span className="streak-value">Перейти <span aria-hidden="true">↗</span></span>
      </button>
      <p className="home-footnote">СЛУШАЙ СЕБЯ · ЗАМЕЧАЙ ЗНАКИ · ВЫБИРАЙ СВОЙ ПУТЬ</p>
    </div>
  );
}
