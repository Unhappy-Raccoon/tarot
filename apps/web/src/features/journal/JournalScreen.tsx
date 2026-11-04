import { useState } from "react";
import { PageHeading } from "../../components/PageHeading";
import type { TarotReading } from "../../types";

interface Props {
  onBack: () => void;
  readings: TarotReading[];
  onOpenReading: (reading: TarotReading) => void;
  loading?: boolean;
  error?: string;
}

type Filter = "Все" | "Таро" | "Гороскоп" | "Натальная карта";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
}

export function JournalScreen({ onBack, readings, onOpenReading, loading = false, error }: Props) {
  const [filter, setFilter] = useState<Filter>("Все");
  const filters: Filter[] = ["Все", "Таро", "Гороскоп", "Натальная карта"];
  const visible = filter === "Все" || filter === "Таро" ? readings : [];
  const grouped = visible.reduce((groups, entry) => {
    const date = new Date(entry.createdAt);
    const key = Number.isNaN(date.valueOf()) ? "Без даты" : new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(date);
    const current = groups.get(key) ?? [];
    current.push(entry);
    groups.set(key, current);
    return groups;
  }, new Map<string, TarotReading[]>());
  const todayKey = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(yesterday);


  return (
    <div className="page-screen journal-screen">
      <PageHeading title="Твой журнал" description="Все важные моменты твоего космического пути." onBack={onBack} />
      <div className="journal-intro-card">
        <span className="journal-intro-card__icon" aria-hidden="true">▤</span>
        <span><strong>Твоя история в одном месте</strong><small>Расклады, прогнозы и сохранённые трактовки</small></span>
        <span className="journal-intro-card__arrow" aria-hidden="true">›</span>
      </div>
      <h2 className="journal-section-title">История</h2>
      <div className="journal-filters" role="tablist" aria-label="Фильтр журнала">
        {filters.map((item) => (
          <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? "selected" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="journal-list">
        {loading ? (
          <div className="empty-state"><span>✧</span><h2>Открываем журнал</h2><p>Собираем сохранённые моменты…</p></div>
        ) : visible.length ? (
          Array.from(grouped.entries()).map(([key, entries]) => (
            <section className="journal-day-group" key={key}>
              <div className="journal-day-heading"><span>{key === todayKey ? "СЕГОДНЯ" : key === yesterdayKey ? "ВЧЕРА" : key.toUpperCase()}</span><i /></div>
              {entries.map((entry) => (
                <button className="journal-entry journal-entry--button" key={entry.id} type="button" onClick={() => onOpenReading(entry)}>
                  <div className="journal-entry__icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48"><rect x="8" y="6" width="30" height="36" rx="3"/><circle cx="23" cy="24" r="10"/><path d="M23 10v28M9 24h28M23 15l3 9-3 9-3-9z"/></svg>
                  </div>
                  <div className="journal-entry__body">
                    <div className="journal-entry__meta"><span>ТАРО · {entry.cards.length} {entry.cards.length === 1 ? "КАРТА" : "КАРТЫ"}</span><time>{formatDate(entry.createdAt)}</time></div>
                    <h2>{entry.title}</h2>
                    <p>{entry.cards.map((card) => card.name).join(" · ")}</p>
                  </div>
                  <span className="subtle-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </section>
          ))
        ) : (
          <div className="empty-state"><span>✧</span><h2>{filter === "Все" || filter === "Таро" ? "Пока здесь тихо" : "Пока нет таких записей"}</h2><p>{filter === "Все" || filter === "Таро" ? "Завершённые расклады будут автоматически сохраняться здесь." : "Записи этого раздела появятся здесь, когда будет доступно их сохранение."}</p></div>
        )}
      </div>
      <p className="demo-disclaimer">Расклады Таро сохраняются в твоём аккаунте и доступны только тебе.</p>
    </div>
  );
}
