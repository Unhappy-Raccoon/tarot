import type { Screen } from "../types";

interface Props {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const standardItems: { screen: Screen; label: string; icon: string }[] = [
  { screen: "home", label: "Главная", icon: "⌂" },
  { screen: "tarot", label: "Таро", icon: "♧" },
  { screen: "journal", label: "Журнал", icon: "▤" },
  { screen: "profile", label: "Профиль", icon: "♙" },
];

const astrologerItems: { screen: Screen; label: string; icon: string }[] = [
  { screen: "home", label: "Главная", icon: "⌂" },
  { screen: "tarot", label: "Таро", icon: "♧" },
  { screen: "astrologer", label: "Астролог", icon: "✧" },
  { screen: "journal", label: "Журнал", icon: "▤" },
  { screen: "profile", label: "Профиль", icon: "♙" },
];

export function BottomNavigation({ activeScreen, onNavigate }: Props) {
  // The approved home/navigation render uses four destinations. The AI chat
  // reference explicitly includes Astrologer as a fifth destination.
  const items = activeScreen === "astrologer" ? astrologerItems : standardItems;

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
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
