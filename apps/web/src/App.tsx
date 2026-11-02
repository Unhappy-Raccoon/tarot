import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BottomNavigation } from "./components/BottomNavigation";
import { HomeScreen } from "./features/home/HomeScreen";
import { TarotResultScreen, TarotSelectionScreen } from "./features/tarot/TarotScreens";
import { NatalChartScreen } from "./features/natal-chart/NatalChartScreen";
import { AstrologerScreen } from "./features/ai-astrologer/AstrologerScreen";
import { JournalScreen } from "./features/journal/JournalScreen";
import { PremiumScreen } from "./features/profile/PremiumScreen";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import type { BirthProfile, Screen, SpreadId, TarotReading, UserProfile } from "./types";
import "./styles.css";

type AuthResponse = { accessToken: string; user: UserProfile };
type AppStatus = "loading" | "onboarding" | "ready" | "error";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const PREVIEW_PROFILE_KEY = "pcj.preview.profile.v1";
const PREVIEW_READINGS_KEY = "pcj.preview.tarot-readings.v1";
const SESSION_KEY = "pcj.session.v1";

function getTelegramApp() { return window.Telegram?.WebApp; }

async function apiRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
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
  } catch { return null; }
}

function getPreviewReadings(): TarotReading[] {
  try {
    const raw = localStorage.getItem(PREVIEW_READINGS_KEY);
    return raw ? JSON.parse(raw) as TarotReading[] : [];
  } catch { return []; }
}

function createPreviewReading(spreadId: SpreadId): TarotReading {
  const spreadConfig: Record<SpreadId, { title: string; positions: { label: string; name: string; glyph: string; interpretation: string; prompt: string }[]; summary: string }> = {
    daily: {
      title: "Карта дня",
      positions: [{ label: "ТВОЯ КАРТА ДНЯ", name: "Звезда", glyph: "✦", interpretation: "Надежда, восстановление и доверие своему внутреннему ориентиру.", prompt: "Что возвращает тебе надежду?" }],
      summary: "Это демонстрационный расклад. Используй его как повод для спокойной саморефлексии.",
    },
    "past-present-future": {
      title: "Прошлое · настоящее · будущее",
      positions: [
        { label: "ПРОШЛОЕ", name: "Луна", glyph: "☾", interpretation: "Прислушайся к опыту, который помог лучше понять собственные чувства.", prompt: "Что ты узнала о себе?" },
        { label: "НАСТОЯЩЕЕ", name: "Звезда", glyph: "✦", interpretation: "Сейчас важно восстановить силы и увидеть доступные ресурсы.", prompt: "Что поддерживает тебя сегодня?" },
        { label: "БУДУЩЕЕ", name: "Солнце", glyph: "☼", interpretation: "Ясность может прийти через открытость и небольшие конкретные шаги.", prompt: "Какой шаг ты выбираешь?" },
      ],
      summary: "Демонстрационный расклад помогает посмотреть на опыт, настоящий момент и возможное направление.",
    },
    love: {
      title: "Любовь и отношения",
      positions: [
        { label: "ТВОИ ЧУВСТВА", name: "Императрица", glyph: "❀", interpretation: "Забота о себе создаёт пространство для близости.", prompt: "В чём нуждаются твои чувства?" },
        { label: "ДИНАМИКА", name: "Влюблённые", glyph: "♡", interpretation: "Честный выбор и открытый разговор помогают прояснить ситуацию.", prompt: "О чём важно поговорить?" },
        { label: "НАПРАВЛЕНИЕ", name: "Умеренность", glyph: "✧", interpretation: "Баланс, терпение и уважение к границам поддерживают контакт.", prompt: "Какой шаг будет бережным?" },
      ],
      summary: "Демонстрационный расклад посвящён твоим чувствам, взаимодействию и личным границам.",
    },
  };
  const config = spreadConfig[spreadId];
  return {
    id: `preview-${Date.now()}`,
    spreadId,
    title: config.title,
    summary: config.summary,
    cards: config.positions.map((card, index) => ({
      positionId: String(index),
      positionLabel: card.label,
      cardId: `preview-${index}-${card.name}`,
      name: card.name,
      arcana: "major" as const,
      glyph: card.glyph,
      keywords: ["демо", "саморефлексия"],
      orientation: "upright" as const,
      interpretation: card.interpretation,
      reflectionPrompt: card.prompt,
    })),
    createdAt: new Date().toISOString(),
  };
}

export default function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [busySpread, setBusySpread] = useState<SpreadId | null>(null);
  const [tarotError, setTarotError] = useState("");
  const [journalReadings, setJournalReadings] = useState<TarotReading[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState("");

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
          } catch { sessionStorage.removeItem(SESSION_KEY); }
        }
        if (!API_URL) throw new Error("Не задан VITE_API_URL для WebApp.");
        const response = await fetch(`${API_URL}/api/auth/telegram`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const result = await response.json() as AuthResponse & { message?: string };
        if (!response.ok || !result.accessToken) throw new Error(result.message ?? "Не удалось подтвердить вход через Telegram.");
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

  useEffect(() => {
    if (status !== "ready" || activeScreen !== "journal") return;
    let cancelled = false;
    setJournalLoading(true);
    setJournalError("");

    const load = async () => {
      try {
        const readings = previewMode
          ? getPreviewReadings()
          : (await apiRequest<{ readings: TarotReading[] }>("/api/tarot/readings", accessToken)).readings;
        if (!cancelled) setJournalReadings(readings);
      } catch (caught) {
        if (!cancelled) setJournalError(caught instanceof Error ? caught.message : "Не удалось открыть журнал.");
      } finally {
        if (!cancelled) setJournalLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [status, activeScreen, previewMode, accessToken]);

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
    const result = await apiRequest<{ user: UserProfile }>("/api/me/onboarding", accessToken, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    setProfile(result.user);
    setStatus("ready");
    setActiveScreen("home");
  }

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") return <MessageScreen title="Не удалось открыть журнал" message={error} />;
  if (status === "onboarding") {
    return <OnboardingScreen initialName={profile?.firstName ?? ""} previewMode={previewMode} onComplete={completeOnboarding} />;
  }
  if (!profile) return <MessageScreen title="Профиль не найден" message="Открой приложение через Telegram ещё раз." />;

  function navigate(screen: Screen) {
    setActiveScreen(screen);
    setTarotError("");
  }

  async function updateBirthProfile(input: BirthProfile) {
    if (previewMode) {
      const nextProfile = { ...profile, firstName: input.displayName, birthProfile: input };
      localStorage.setItem(PREVIEW_PROFILE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
      return;
    }
    const result = await apiRequest<{ user: UserProfile }>("/api/me/onboarding", accessToken, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    setProfile(result.user);
  }

  async function startSpread(spreadId: SpreadId) {
    setBusySpread(spreadId);
    setTarotError("");
    try {
      let nextReading: TarotReading;
      if (previewMode) {
        const existing = getPreviewReadings();
        const today = new Date().toISOString().slice(0, 10);
        const existingDaily = spreadId === "daily"
          ? existing.find((item) => item.spreadId === "daily" && item.createdAt.slice(0, 10) === today)
          : undefined;
        nextReading = existingDaily ?? createPreviewReading(spreadId);
        if (!existingDaily) {
          localStorage.setItem(PREVIEW_READINGS_KEY, JSON.stringify([nextReading, ...existing].slice(0, 50)));
        }
      } else {
        nextReading = (await apiRequest<{ reading: TarotReading }>("/api/tarot/readings", accessToken, {
          method: "POST",
          body: JSON.stringify({ spreadId }),
        })).reading;
      }
      setJournalReadings((current) => [nextReading, ...current.filter((item) => item.id !== nextReading.id)]);
      setReading(nextReading);
      setActiveScreen("tarot-result");
    } catch (caught) {
      setTarotError(caught instanceof Error ? caught.message : "Не удалось создать расклад.");
      setActiveScreen(spreadId === "daily" ? "home" : "tarot");
    } finally {
      setBusySpread(null);
    }
  }

  function openReading(savedReading: TarotReading) {
    setReading(savedReading);
    setActiveScreen("tarot-result");
  }

  return (
    <div className="app-frame">
      <main className="app-content">
        {activeScreen === "home" && <HomeScreen profile={profile} displayName={displayName} onNavigate={navigate} onDailyCard={() => void startSpread("daily")} busy={busySpread === "daily"} />}
        {activeScreen === "tarot" && <TarotSelectionScreen onSelect={(spread) => void startSpread(spread)} onBack={() => navigate("home")} busySpread={busySpread} error={tarotError} />}
        {activeScreen === "tarot-result" && reading && <TarotResultScreen reading={reading} onBack={() => navigate("tarot")} />}
        {activeScreen === "natal" && <NatalChartScreen onBack={() => navigate("home")} accessToken={accessToken} previewMode={previewMode} />}
        {activeScreen === "astrologer" && <AstrologerScreen onBack={() => navigate("home")} />}
        {activeScreen === "journal" && <JournalScreen onBack={() => navigate("home")} readings={journalReadings} onOpenReading={openReading} loading={journalLoading} error={journalError} />}
        {activeScreen === "profile" && <ProfileScreen profile={profile} displayName={displayName} onPremium={() => navigate("premium")} onSaveBirthProfile={updateBirthProfile} />}
        {activeScreen === "premium" && <PremiumScreen onBack={() => navigate("profile")} />}
        {tarotError && activeScreen === "home" && <div className="toast-notice" role="alert">{tarotError}</div>}
      </main>
      <BottomNavigation activeScreen={activeScreen} onNavigate={navigate} />
    </div>
  );
}

function LoadingScreen() {
  return <main className="loading-screen"><div className="moon-mark" aria-hidden="true">☾</div><p className="eyebrow">PERSONAL COSMIC JOURNAL</p><span className="loading-line" /><p className="muted-copy">Настраиваем твоё пространство…</p></main>;
}

function MessageScreen({ title, message }: { title: string; message: string }) {
  return <main className="message-screen"><div className="moon-mark" aria-hidden="true">☾</div><h1>{title}</h1><p>{message}</p></main>;
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
  const [birthLatitude, setBirthLatitude] = useState("");
  const [birthLongitude, setBirthLongitude] = useState("");
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
        ...(birthLatitude.trim() ? { birthLatitude: Number(birthLatitude) } : {}),
        ...(birthLongitude.trim() ? { birthLongitude: Number(birthLongitude) } : {}),
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
        <p className="muted-copy">Несколько деталей помогут подготовить персональное пространство.</p>
      </header>
      <form className="onboarding-card" onSubmit={submit}>
        {previewMode && <p className="preview-note">Предварительный просмотр · данные сохраняются только в этом браузере</p>}
        <label>Как к тебе обращаться?
          <input autoComplete="nickname" maxLength={48} placeholder="Имя или псевдоним" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>Дата рождения
          <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
        </label>
        <label>Время рождения <span className="optional">необязательно</span>
          <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
        </label>
        <label>Место рождения <span className="optional">необязательно</span>
          <input maxLength={160} placeholder="Город, страна" value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} />
        </label>
        <label>Часовой пояс места рождения <span className="optional">необязательно</span>
          <input maxLength={64} placeholder="Например, Europe/Tallinn" value={birthTimeZone} onChange={(event) => setBirthTimeZone(event.target.value)} />
        </label>
        <div className="coordinate-fields">
          <p>Координаты места рождения <span className="optional">для Асцендента и домов</span></p>
          <div>
            <label>Широта
              <input type="number" inputMode="decimal" min="-90" max="90" step="any" placeholder="59.4370" value={birthLatitude} onChange={(event) => setBirthLatitude(event.target.value)} />
            </label>
            <label>Долгота
              <input type="number" inputMode="decimal" min="-180" max="180" step="any" placeholder="24.7536" value={birthLongitude} onChange={(event) => setBirthLongitude(event.target.value)} />
            </label>
          </div>
          <small>Обе координаты нужно указать вместе. Автоматический поиск города пока не подключён.</small>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={saving}>{saving ? "Сохраняем…" : "Продолжить"} <span>→</span></button>
        <p className="privacy-hint">Время и место рождения можно добавить позже. Неизвестное время не будет подменяться.</p>
      </form>
    </main>
  );
}
