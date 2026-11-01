import { useState } from "react";
import { PageHeading } from "../../components/PageHeading";

interface Props { onBack: () => void; }

type Filter = "Все" | "Таро" | "Гороскоп" | "Натальная карта";

const entries = [
  { category: "Таро", title: "Прошлое · настоящее · будущее", subtitle: "Три карты и общая трактовка", date: "Сегодня", glyph: "♧" },
  { category: "Гороскоп", title: "Твой день", subtitle: "Астрологическая погода", date: "Вчера", glyph: "☼" },
  { category: "Натальная карта", title: "Три опорные точки", subtitle: "Солнце · Луна · Асцендент", date: "Вчера", glyph: "✧" },
] as const;

export function JournalScreen({ onBack }: Props) {
  const [filter, setFilter] = useState<Filter>("Все");
  const filters: Filter[] = ["Все", "Таро", "Гороскоп", "Натальная карта"];
  const visible = entries.filter((entry) => filter === "Все" || entry.category === filter);

  return (
    <div className="page-screen journal-screen">
      <PageHeading title="Твой журнал" description="Моменты, к которым захочется вернуться." onBack={onBack} />
      <div className="journal-filters" role="tablist" aria-label="Фильтр журнала">
        {filters.map((item) => (
          <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? "selected" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <div className="journal-list">
        {visible.length ? visible.map((entry, index) => (
          <article className="journal-entry" key={entry.title}>
            <div className="journal-entry__icon" aria-hidden="true">{entry.glyph}</div>
            <div className="journal-entry__body">
              <div className="journal-entry__meta"><span>{entry.category}</span><time>{entry.date}</time></div>
              <h2>{entry.title}</h2>
              <p>{entry.subtitle}</p>
            </div>
            <span className="subtle-arrow" aria-hidden="true">→</span>
            {index === 0 && <span className="journal-entry__demo">ПРИМЕР</span>}
          </article>
        )) : <div className="empty-state"><span>✧</span><h2>Пока здесь тихо</h2><p>Сохранённые расклады и заметки появятся в этом разделе.</p></div>}
      </div>
      <p className="demo-disclaimer">Записи в этом макете демонстрационные. Журнал будет наполняться сохранёнными материалами пользователя.</p>
    </div>
  );
}
