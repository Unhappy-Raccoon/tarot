import type { ReactNode } from "react";
import type { Screen } from "../types";
import { AstrologyIcon, HomeIcon, JournalIcon, ProfileIcon, TarotIcon } from "./CelestialIcons";

interface Props {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const homeItems: { screen: Screen; label: string; icon: ReactNode }[] = [
  { screen: "home", label: "Главная", icon: <HomeIcon /> },
  { screen: "tarot", label: "Таро", icon: <TarotIcon /> },
  { screen: "journal", label: "Журнал", icon: <JournalIcon /> },
  { screen: "profile", label: "Профиль", icon: <ProfileIcon /> },
];

const astrologerItems: { screen: Screen; label: string; icon: ReactNode }[] = [
  homeItems[0]!,
  homeItems[1]!,
  { screen: "astrologer", label: "Астролог", icon: <AstrologyIcon /> },
  homeItems[2]!,
  homeItems[3]!,
];

export function BottomNavigation({ activeScreen, onNavigate }: Props) {
  const items = activeScreen === "astrologer" ? astrologerItems : homeItems;

  return (
    <nav className={`bottom-nav bottom-nav--${items.length}`} aria-label="Основная навигация">
      {items.map((item) => {
        const active =
          activeScreen === item.screen ||
          (item.screen === "profile" && activeScreen === "premium") ||
          (item.screen === "tarot" && activeScreen === "tarot-result");
        return (
          <button
            className={`nav-button ${active ? "active" : ""}`}
            key={item.screen}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(item.screen)}
          >
            <span className="nav-icon">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
