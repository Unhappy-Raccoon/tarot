import { useEffect, useMemo, useState } from "react";
import { PageHeading } from "../../components/PageHeading";
import type { DailyHoroscope, HoroscopePreferences } from "../../types";

interface Props {
  onBack: () => void;
  accessToken: string;
  previewMode: boolean;
}

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(payload.message ?? `Ошибка сервера: ${response.status}`);
  return payload as T;
}

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Tallinn";
  } catch {
    return "Europe/Tallinn";
  }
}

function formatLocalDate(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone,
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function formatDegree(value: number): string {
  return `${value.toFixed(1)}°`;
}

function HoroscopeText({ content }: { content: string }) {
  return (
    <div className="daily-horoscope-content">
      {content.split(/\n{2,}/).map((paragraph, index) => {
        const cleaned = paragraph.trim().replace(/^#{1,3}\s*/, "");
        if (!cleaned) return null;
        const headingMatch = cleaned.match(/^([^:：]{2,36})[:：]\s*(.*)$/s);
        if (headingMatch && headingMatch[1]!.length < 36) {
          return (
            <section key={index} className="horoscope-text-section">
              <h3>{headingMatch[1]}</h3>
              <p>{headingMatch[2]}</p>
            </section>
          );
        }
        return <p key={index}>{cleaned}</p>;
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <section className="natal-status-panel horoscope-loading">
      <span className="placeholder-star" aria-hidden="true">✧</span>
      <h2>Собираем космическую погоду</h2>
      <p>Рассчитываем транзиты на твою местную дату и сопоставляем их с натальной картой.</p>
    </section>
  );
}

export function DailyHoroscopeScreen({ onBack, accessToken, previewMode }: Props) {
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [history, setHistory] = useState<DailyHoroscope[]>([]);
  const [preferences, setPreferences] = useState<HoroscopePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationTimeDraft, setNotificationTimeDraft] = useState("09:00");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const suggestedTimeZone = useMemo(browserTimeZone, []);

  useEffect(() => {
    if (previewMode) {
      setError("Персональный гороскоп рассчитывается на сервере из натальной карты и транзитов. Открой WebApp в Telegram, чтобы подключить профиль.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [today, older, prefs] = await Promise.allSettled([
          request<{ horoscope: DailyHoroscope }>(
            `/api/horoscope/today?timeZone=${encodeURIComponent(suggestedTimeZone)}`,
            accessToken,
            { signal: controller.signal },
          ),
          request<{ history: DailyHoroscope[] }>("/api/horoscope/history", accessToken, { signal: controller.signal }),
          request<{ preferences: HoroscopePreferences }>(
            `/api/horoscope/preferences?timeZone=${encodeURIComponent(suggestedTimeZone)}`,
            accessToken,
            { signal: controller.signal },
          ),
        ]);
        if (cancelled) return;
        if (today.status === "fulfilled") setHoroscope(today.value.horoscope);
        else setError(today.reason instanceof Error ? today.reason.message : "Не удалось подготовить гороскоп.");
        if (older.status === "fulfilled") setHistory(older.value.history);
        if (prefs.status === "fulfilled") {
          setPreferences(prefs.value.preferences);
          setNotificationTimeDraft(prefs.value.preferences.notificationTime);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load().catch((caught: unknown) => {
      if (!cancelled) setError(caught instanceof Error ? caught.message : "Не удалось загрузить гороскоп.");
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [accessToken, previewMode, suggestedTimeZone]);

  async function updatePreferences(next: HoroscopePreferences) {
    if (previewMode || saving) return;
    setSaving(true);
    setNotice("");
    try {
      const result = await request<{ preferences: HoroscopePreferences }>(
        "/api/horoscope/preferences",
        accessToken,
        { method: "PUT", body: JSON.stringify(next) },
      );
      setPreferences(result.preferences);
      setNotice(result.preferences.notificationsEnabled
        ? `Уведомление будет приходить ежедневно в ${result.preferences.notificationTime} по ${result.preferences.timeZone}.`
        : "Ежедневные уведомления выключены.");
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Не удалось сохранить настройку.");
    } finally {
      setSaving(false);
    }
  }

  const current = horoscope;
  const displayedHistory = history.filter((item) => item.id !== current?.id).slice(0, 13);

  return (
    <div className="page-screen daily-horoscope-screen">
      <PageHeading
        title="Гороскоп дня"
        description="Твои транзиты, сопоставленные с натальной картой."
        onBack={onBack}
      />
      {loading && <LoadingState />}
      {!loading && error && (
        <section className="natal-status-panel horoscope-error">
          <span className="placeholder-star" aria-hidden="true">✧</span>
          <h2>Сегодняшняя запись пока недоступна</h2>
          <p>{error}</p>
          <p>Для генерации нужен настроенный AI-провайдер и сохранённая натальная карта. Расчёт транзитов выполняется отдельно от AI.</p>
        </section>
      )}
      {current && (
        <>
          <section className="daily-horoscope-hero">
            <div className="horoscope-hero-orbit" aria-hidden="true">☾</div>
            <span className="card-eyebrow">PERSONAL COSMIC JOURNAL</span>
            <p className="daily-horoscope-date">{formatLocalDate(current.localDate, current.timeZone)}</p>
            <h2>{current.title}</h2>
            <span className="horoscope-precision">{current.natalPrecision} · тропический зодиак</span>
            <HoroscopeText content={current.content} />
            <p className="horoscope-reflection-note">Астрологическая трактовка — символическая подсказка для саморефлексии, не обещание событий.</p>
          </section>

          <section className="horoscope-data-panel">
            <div className="section-heading-row">
              <h2>Положение планет</h2>
              <span className="section-caption">ТРАНЗИТЫ</span>
            </div>
            <p className="horoscope-data-caption">
              Рассчитано на 12:00 местного времени · {new Intl.DateTimeFormat("ru-RU", {
                hour: "2-digit", minute: "2-digit", timeZone: current.timeZone,
              }).format(new Date(current.transits.calculatedForUtc))}
            </p>
            <div className="transit-position-grid">
              {current.transits.positions.map((planet) => (
                <article className="transit-position" key={planet.id}>
                  <span>{planet.glyph}</span>
                  <div>
                    <strong>{planet.name}</strong>
                    <small>{planet.sign} · {formatDegree(planet.degreeInSign)}</small>
                    {planet.retrograde && <em>Ретроградное движение</em>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="horoscope-data-panel">
            <div className="section-heading-row">
              <h2>Связь с натальной картой</h2>
              <span className="section-caption">АСПЕКТЫ</span>
            </div>
            {current.aspects.length ? (
              <div className="horoscope-aspect-list">
                {current.aspects.map((aspect, index) => (
                  <div className="horoscope-aspect" key={`${aspect.transitPlanetId}-${aspect.natalPlanetId}-${index}`}>
                    <span>{aspect.transitPlanetName}</span>
                    <strong>{aspect.aspect}</strong>
                    <span>натальный {aspect.natalPlanetName}</span>
                    <small>{aspect.orbDegrees.toFixed(2)}°</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="horoscope-data-caption">Точные градусные аспекты не отображаются: для них нужно однозначное время рождения. Положения транзитов рассчитаны независимо.</p>
            )}
          </section>
        </>
      )}

      {preferences && (
        <section className="horoscope-notification-panel">
          <div>
            <span className="card-eyebrow">ЕЖЕДНЕВНЫЙ РИТУАЛ</span>
            <h2>Получать гороскоп в Telegram</h2>
            <p>Один раз в день в выбранное местное время. Отправку можно отключить здесь же.</p>
          </div>
          <label className="horoscope-toggle-row">
            <span>Ежедневное уведомление</span>
            <input
              type="checkbox"
              checked={preferences.notificationsEnabled}
              disabled={saving || previewMode}
              onChange={(event) => void updatePreferences({
                ...preferences,
                notificationTime: notificationTimeDraft,
                notificationsEnabled: event.target.checked,
              })}
            />
          </label>
          <label className="horoscope-time-row">
            <span>Время отправки</span>
            <input
              type="time"
              value={notificationTimeDraft}
              disabled={saving || previewMode}
              onChange={(event) => setNotificationTimeDraft(event.target.value)}
              onBlur={() => {
                if (/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(notificationTimeDraft) && notificationTimeDraft !== preferences.notificationTime) {
                  void updatePreferences({ ...preferences, notificationTime: notificationTimeDraft });
                }
              }}
            />
          </label>
          <p className="horoscope-data-caption">Часовой пояс устройства: {preferences.timeZone}</p>
          {notice && <p className="horoscope-preference-notice" role="status">{notice}</p>}
        </section>
      )}

      {displayedHistory.length > 0 && (
        <section className="horoscope-history-panel">
          <div className="section-heading-row">
            <h2>Недавние записи</h2>
            <span className="section-caption">ИСТОРИЯ</span>
          </div>
          {displayedHistory.map((entry) => (
            <button className="horoscope-history-item" type="button" key={entry.id} onClick={() => setHoroscope(entry)}>
              <span>{formatLocalDate(entry.localDate, entry.timeZone)}</span>
              <strong>{entry.title}</strong>
              <span aria-hidden="true">→</span>
            </button>
          ))}
          {current && current.localDate !== getLocalDateForDevice() && (
            <button className="text-link-button" type="button" onClick={() => setHoroscope(history[0] ?? current)}>
              Открыть последнюю запись
            </button>
          )}
        </section>
      )}
      <p className="demo-disclaimer">Транзиты рассчитаны Astronomy Engine. Символическая трактовка не является научным или детерминированным прогнозом.</p>
    </div>
  );
}

function getLocalDateForDevice(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: browserTimeZone(), year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
