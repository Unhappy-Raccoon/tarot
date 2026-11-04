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
        ) : visible.length ? visible.map((entry) => (
          <button className="journal-entry journal-entry--button" key={entry.id} type="button" onClick={() => onOpenReading(entry)}>
            <div className="journal-entry__icon" aria-hidden="true">♧</div>
            <div className="journal-entry__body">
              <div className="journal-entry__meta"><span>Таро · {entry.cards.length} {entry.cards.length === 1 ? "карта" : "карты"}</span><time>{formatDate(entry.createdAt)}</time></div>
              <h2>{entry.title}</h2>
              <p>{entry.cards.map((card) => card.name).join(" · ")}</p>
            </div>
            <span className="subtle-arrow" aria-hidden="true">→</span>
          </button>
        )) : (
          <div className="empty-state"><span>✧</span><h2>{filter === "Все" || filter === "Таро" ? "Пока здесь тихо" : "Раздел скоро откроется"}</h2><p>{filter === "Все" || filter === "Таро" ? "Завершённые расклады будут автоматически сохраняться здесь." : "Этот тип записей появится после подключения соответствующего раздела."}</p></div>
        )}
      </div>
      <p className="demo-disclaimer">Расклады Таро сохраняются в твоём аккаунте и доступны только тебе.</p>
    </div>
  );
}
