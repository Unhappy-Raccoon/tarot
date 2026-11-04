import type { ReactNode } from "react";
import type { Screen } from "../types";

interface Props {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const homeItems: { screen: Screen; label: string; icon: ReactNode }[] = [
  { screen: "home", label: "Главная", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.3 12 3.5l8.5 6.8v10.2h-6v-6.3h-5v6.3h-6z" /></svg> },
  { screen: "tarot", label: "Таро", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="11" height="16" rx="1.8" transform="rotate(-9 10.5 11.5)" /><rect x="9" y="4.5" width="10" height="15" rx="1.8" transform="rotate(8 14 12)" /><path d="m14 8 .8 2.2 2.2.8-2.2.8L14 14l-.8-2.2L11 11l2.2-.8z" /></svg> },
  { screen: "journal", label: "Журнал", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h14v17H5zM8 8h8M8 12h8M8 16h5" /></svg> },
  { screen: "profile", label: "Профиль", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" /><path d="M5.2 20c.4-3.7 2.9-5.7 6.8-5.7s6.4 2 6.8 5.7" /></svg> },
];

const astrologerItems: { screen: Screen; label: string; icon: ReactNode }[] = [
  homeItems[0]!,
  homeItems[1]!,
  { screen: "astrologer", label: "Астролог", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4v19.2M2.4 12h19.2M5.2 5.2l13.6 13.6M18.8 5.2 5.2 18.8" /><circle cx="12" cy="12" r="4.2" /></svg> },
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
