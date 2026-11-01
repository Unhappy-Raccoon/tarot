import { useEffect, useMemo, useState, type FormEvent } from "react";

type BirthProfile = {
  displayName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  birthTimeZone?: string;
};

type UserProfile = {
  telegramId?: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  plan: "free" | "premium";
  birthProfile: BirthProfile | null;
};

type AuthResponse = {
  accessToken: string;
  user: UserProfile;
};

type Screen = "home" | "tarot" | "natal" | "astrologer" | "journal" | "profile" | "premium";
type AppStatus = "loading" | "onboarding" | "ready" | "error";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const PREVIEW_PROFILE_KEY = "pcj.preview.profile.v1";
const SESSION_KEY = "pcj.session.v1";

function getTelegramApp() {
  return window.Telegram?.WebApp;
}

async function apiRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(result.message ?? `Ошибка сервера: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getPreviewProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PREVIEW_PROFILE_KEY);
    return raw ? JSON.parse(raw) as UserProfile : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("home");

  useEffect(() => {
    const telegram = getTelegramApp();
    telegram?.ready();
    telegram?.expand();
    telegram?.setHeaderColor?.("#0B0A14");
    telegram?.setBackgroundColor?.("#0B0A14");

    const initData = telegram?.initData ?? "";
    if (!initData) {
      setPreviewMode(true);
      const previewProfile = getPreviewProfile();
      setProfile(previewProfile);
      setStatus(previewProfile?.birthProfile ? "ready" : "onboarding");
      return;
    }

    const cachedToken = sessionStorage.getItem(SESSION_KEY);
    const restoreSession = async () => {
      try {
        if (cachedToken && API_URL) {
          try {
            const restored = await apiRequest<{ user: UserProfile }>("/api/me", cachedToken);
            setAccessToken(cachedToken);
            setProfile(restored.user);
            setStatus(restored.user.birthProfile ? "ready" : "onboarding");
            return;
          } catch {
            sessionStorage.removeItem(SESSION_KEY);
          }
        }

        if (!API_URL) throw new Error("Не задан VITE_API_URL для WebApp.");
        const response = await fetch(`${API_URL}/api/auth/telegram`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const result = await response.json() as AuthResponse & { message?: string };
        if (!response.ok || !result.accessToken) {
          throw new Error(result.message ?? "Не удалось подтвердить вход через Telegram.");
        }

        sessionStorage.setItem(SESSION_KEY, result.accessToken);
        setAccessToken(result.accessToken);
        setProfile(result.user);
        setStatus(result.user.birthProfile ? "ready" : "onboarding");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Не удалось открыть приложение.");
        setStatus("error");
      }
    };

    void restoreSession();
  }, []);

  const displayName = useMemo(
    () => profile?.birthProfile?.displayName || profile?.firstName || "Путешественница",
    [profile],
  );

  async function completeOnboarding(input: BirthProfile) {
    if (previewMode) {
      const nextProfile: UserProfile = {
        telegramId: "preview",
        firstName: input.displayName,
        lastName: null,
        username: null,
        plan: "free",
        birthProfile: input,
      };
      localStorage.setItem(PREVIEW_PROFILE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
      setStatus("ready");
      setActiveScreen("home");
      return;
    }

    const result = await apiRequest<{ user: UserProfile }>(
      "/api/me/onboarding",
      accessToken,
      { method: "PUT", body: JSON.stringify(input) },
    );
    setProfile(result.user);
    setStatus("ready");
    setActiveScreen("home");
  }

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "error") {
    return <MessageScreen title="Не удалось открыть журнал" message={error} />;
  }

  if (status === "onboarding") {
    return (
      <OnboardingScreen
        initialName={profile?.firstName ?? ""}
        previewMode={previewMode}
        onComplete={completeOnboarding}
      />
    );
  }

  if (!profile) {
    return <MessageScreen title="Профиль не найден" message="Открой приложение через Telegram ещё раз." />;
  }

  return (
    <MainApp
      profile={profile}
      displayName={displayName}
      activeScreen={activeScreen}
      onNavigate={setActiveScreen}
    />
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="moon-mark" aria-hidden="true">☾</div>
      <p className="eyebrow">PERSONAL COSMIC JOURNAL</p>
      <span className="loading-line" />
      <p className="muted-copy">Настраиваем твоё пространство…</p>
    </main>
  );
}

function MessageScreen({ title, message }: { title: string; message: string }) {
  return (
    <main className="message-screen">
      <div className="moon-mark" aria-hidden="true">☾</div>
      <h1>{title}</h1>
      <p>{message}</p>
    </main>
  );
}

function OnboardingScreen({
  initialName,
  previewMode,
  onComplete,
}: {
  initialName: string;
  previewMode: boolean;
  onComplete: (input: BirthProfile) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthTimeZone, setBirthTimeZone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2 || !birthDate) {
      setError("Укажи имя и дату рождения.");
      return;
    }

    setSaving(true);
    try {
      await onComplete({
        displayName: name.trim(),
        birthDate,
        ...(birthTime ? { birthTime } : {}),
        ...(birthPlace.trim() ? { birthPlace: birthPlace.trim() } : {}),
        ...(birthTimeZone.trim() ? { birthTimeZone: birthTimeZone.trim() } : {}),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось сохранить данные.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="onboarding-shell">
      <div className="onboarding-orbit" aria-hidden="true">✦</div>
      <header className="onboarding-header">
        <div className="moon-mark" aria-hidden="true">☾</div>
        <p className="eyebrow">PERSONAL COSMIC JOURNAL</p>
        <h1>Давай познакомимся</h1>
        <p className="muted-copy">
          Несколько деталей помогут подготовить персональное пространство.
        </p>
      </header>

      <form className="onboarding-card" onSubmit={submit}>
        {previewMode && <p className="preview-note">Предварительный просмотр · данные сохраняются только в этом браузере</p>}
        <label>
          Как к тебе обращаться?
          <input
            autoComplete="nickname"
            maxLength={48}
            placeholder="Имя или псевдоним"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Дата рождения
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            required
          />
        </label>

        <label>
          Время рождения <span className="optional">необязательно</span>
          <input
            type="time"
            value={birthTime}
            onChange={(event) => setBirthTime(event.target.value)}
          />
        </label>

        <label>
          Место рождения <span className="optional">необязательно</span>
          <input
            maxLength={160}
            placeholder="Город, страна"
            value={birthPlace}
            onChange={(event) => setBirthPlace(event.target.value)}
          />
        </label>

        <label>
          Часовой пояс места рождения <span className="optional">необязательно</span>
          <input
            maxLength={64}
            placeholder="Например, Europe/Tallinn"
            value={birthTimeZone}
            onChange={(event) => setBirthTimeZone(event.target.value)}
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Сохраняем…" : "Продолжить"}
          <span aria-hidden="true">→</span>
        </button>
        <p className="privacy-hint">
          Время и место рождения можно добавить позже. Неизвестное время не будет подменяться.
        </p>
      </form>
    </main>
  );
}

function MainApp({
  profile,
  displayName,
  activeScreen,
  onNavigate,
}: {
  profile: UserProfile;
  displayName: string;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const firstName = displayName.split(/\s+/)[0] || "Путешественница";

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-moon" aria-hidden="true">☾</div>
        <button className="icon-button" onClick={() => onNavigate("profile")} aria-label="Открыть профиль">⚙</button>
        <h1>Привет, {firstName} <span className="sparkle">✦</span></h1>
        <p>Твой день начинается здесь</p>
      </header>

      {activeScreen === "home" && (
        <section className="home-content">
          <button
            className={`daily-card ${cardOpen ? "is-open" : ""}`}
            onClick={() => setCardOpen((value) => !value)}
            aria-expanded={cardOpen}
          >
            <span className="daily-card__front">
              <span className="serif-title">Карта дня</span>
              <span className="daily-card__copy">Раскрой энергию сегодняшнего дня</span>
              <span className="round-arrow" aria-hidden="true">→</span>
            </span>
            <span className="daily-card__back">
              <span className="serif-title">Звезда</span>
              <span className="daily-card__copy">Надежда, вдохновение и тихая уверенность в своём пути.</span>
              <span className="daily-card__demo">Демонстрационная трактовка</span>
            </span>
          </button>

          <section className="section-block">
            <h2>Быстрый доступ</h2>
            <div className="quick-grid">
              <QuickAction icon="♧" title="Таро" onClick={() => onNavigate("tarot")} />
              <QuickAction icon="✧" title="Натальная карта" onClick={() => onNavigate("natal")} />
              <QuickAction icon="☼" title="Астролог" onClick={() => onNavigate("astrologer")} />
            </div>
          </section>

          <button className="horoscope-card" onClick={() => onNavigate("natal")}>
            <span className="horoscope-symbol">☼</span>
            <span>
              <strong>Гороскоп дня</strong>
              <small>Твоя астрологическая погода на сегодня</small>
            </span>
            <span className="subtle-arrow">→</span>
          </button>

          <div className="streak-card">
            <span className="streak-flame">✦</span>
            <div className="streak-text">
              <strong>Твоя серия дней</strong>
              <small>Начни свой первый ритуал сегодня</small>
              <div className="streak-track"><i /><i /><i /><i /><i /></div>
            </div>
            <span className="streak-value">0 дней</span>
          </div>
        </section>
      )}

      {activeScreen !== "home" && (
        <FeaturePlaceholder screen={activeScreen} profile={profile} onNavigate={onNavigate} />
      )}

      <nav className="bottom-nav" aria-label="Основная навигация">
        <NavButton active={activeScreen === "home"} label="Главная" icon="⌂" onClick={() => onNavigate("home")} />
        <NavButton active={activeScreen === "tarot"} label="Таро" icon="▱" onClick={() => onNavigate("tarot")} />
        <NavButton active={activeScreen === "journal"} label="Журнал" icon="▤" onClick={() => onNavigate("journal")} />
        <NavButton active={activeScreen === "profile" || activeScreen === "premium"} label="Профиль" icon="♙" onClick={() => onNavigate("profile")} />
      </nav>
    </main>
  );
}

function QuickAction({
  icon,
  title,
  onClick,
}: {
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span aria-hidden="true">{icon}</span>
      <small>{title}</small>
    </button>
  );
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      <span aria-hidden="true">{icon}</span>
      <small>{label}</small>
    </button>
  );
}

function FeaturePlaceholder({
  screen,
  profile,
  onNavigate,
}: {
  screen: Screen;
  profile: UserProfile;
  onNavigate: (screen: Screen) => void;
}) {
  const content: Record<Screen, { title: string; description: string }> = {
    home: { title: "Главная", description: "" },
    tarot: { title: "Таро", description: "Три стартовых расклада: карта дня, прошлое — настоящее — будущее, любовь и отношения." },
    natal: { title: "Натальная карта", description: "Основные положения планет и персональные интерпретации появятся в следующей итерации." },
    astrologer: { title: "AI-астролог", description: "Готовые темы и личный диалог будут подключены следующим этапом." },
    journal: { title: "Твой журнал", description: "Здесь появятся сохранённые расклады и астрологические материалы." },
    profile: { title: "Твой профиль", description: `${profile.birthProfile?.displayName ?? profile.firstName} · ${profile.plan === "premium" ? "Premium" : "Free"}` },
    premium: { title: "Premium", description: "Расширенные возможности журнала." },
  };
  const selected = content[screen];

  return (
    <section className="placeholder-screen">
      <span className="placeholder-star" aria-hidden="true">✧</span>
      <p className="eyebrow">PERSONAL COSMIC JOURNAL</p>
      <h2>{selected.title}</h2>
      <p>{selected.description}</p>
      {screen === "profile" && (
        <button className="secondary-button" onClick={() => onNavigate("premium")}>
          Посмотреть Premium <span aria-hidden="true">→</span>
        </button>
      )}
      <button className="text-button" onClick={() => onNavigate("home")}>Вернуться на главную</button>
      <p className="feature-note">Раздел подготовлен в навигации. Функциональность будет добавляться отдельными итерациями.</p>
    </section>
  );
}
