import type { Screen } from "../types";

interface Props {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const items: { screen: Screen; label: string; icon: string }[] = [
  { screen: "home", label: "Главная", icon: "⌂" },
  { screen: "tarot", label: "Таро", icon: "♧" },
  { screen: "astrologer", label: "Астролог", icon: "✧" },
  { screen: "journal", label: "Журнал", icon: "▤" },
  { screen: "profile", label: "Профиль", icon: "♙" },
];

export function BottomNavigation({ activeScreen, onNavigate }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {items.map((item) => {
        const active =
          activeScreen === item.screen ||
          (item.screen === "profile" && activeScreen === "premium") ||
          (item.screen === "tarot" && activeScreen === "tarot-result") ||
          (item.screen === "astrologer" && activeScreen === "astrologer");
        return (
          <button
            className={`nav-button ${active ? "active" : ""}`}
            key={item.screen}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(item.screen)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
