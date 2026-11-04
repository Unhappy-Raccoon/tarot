import { useEffect, useState } from "react";
import { PageHeading } from "../../components/PageHeading";
import type { NatalChartResult, NatalPlanetPlacement } from "../../types";

interface Props {
  onBack: () => void;
  accessToken: string;
  previewMode: boolean;
}

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const SIGNS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

function formatDegree(value: number): string {
  const totalMinutes = Math.round(value * 60);
  const degrees = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${degrees}°${String(minutes).padStart(2, "0")}′`;
}

function PlanetPosition({ placement }: { placement: NatalPlanetPlacement }) {
  let signText = placement.sign ?? placement.possibleSigns.join(" / ");
  if (!placement.sign && placement.possibleSigns.length > 1) {
    signText = `Возможен переход: ${signText}`;
  }
  if (!signText) signText = "Знак требует уточнения времени";

  return (
    <article className="placement-row">
      <span className="placement-symbol" aria-hidden="true">{placement.glyph}</span>
      <div>
        <small>{placement.name}</small>
        <h3>{signText}</h3>
        <p>
          {placement.degreeInSign !== null
            ? formatDegree(placement.degreeInSign)
            : "Точный градус без времени рождения не определяется"}
          {placement.houseNumber ? ` · ${placement.houseNumber}-й дом` : ""}
        </p>
      </div>
    </article>
  );
}

function ZodiacWheel({ chart }: { chart: NatalChartResult }) {
  const cx = 160;
  const cy = 160;
  const point = (longitude: number, radius: number) => {
    const angle = (longitude - 90) * Math.PI / 180;
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  };

  return (
    <div className="zodiac-wheel" role="img" aria-label="Круг натальной карты по рассчитанным положениям">
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          <radialGradient id="natalWheelGlow">
            <stop offset="0%" stopColor="#d9b983" stopOpacity=".12"/>
            <stop offset="100%" stopColor="#0b0a14" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="150" fill="url(#natalWheelGlow)" />
        <circle cx={cx} cy={cy} r="143" fill="none" stroke="#d9b983" strokeOpacity=".65"/>
        <circle cx={cx} cy={cy} r="118" fill="none" stroke="#d9b983" strokeOpacity=".28"/>
        <circle cx={cx} cy={cy} r="76" fill="none" stroke="#d9b983" strokeOpacity=".36"/>
        <circle cx={cx} cy={cy} r="49" fill="none" stroke="#d9b983" strokeOpacity=".24"/>
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index * Math.PI * 2) / 12 - Math.PI / 2;
          const x1 = cx + Math.cos(angle) * 118;
          const y1 = cy + Math.sin(angle) * 118;
          const xInner = cx + Math.cos(angle) * 49;
          const yInner = cy + Math.sin(angle) * 49;
          const xMid = cx + Math.cos(angle) * 76;
          const yMid = cy + Math.sin(angle) * 76;
          const x2 = cx + Math.cos(angle) * 143;
          const y2 = cy + Math.sin(angle) * 143;
          const tx = cx + Math.cos(angle + Math.PI / 12) * 130;
          const ty = cy + Math.sin(angle + Math.PI / 12) * 130;
          return (
            <g key={index}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9b983" strokeOpacity=".35"/>
              <line x1={xInner} y1={yInner} x2={xMid} y2={yMid} stroke="#b89bbf" strokeOpacity=".22"/>
              <line x1={xMid} y1={yMid} x2={x1} y2={y1} stroke="#b89bbf" strokeOpacity=".22"/>
              <text x={tx} y={ty} fill="#f1dccb" fontSize="15" textAnchor="middle" dominantBaseline="middle">{SIGNS[index]}</text>
            </g>
          );
        })}
        {chart.houses?.map((house) => {
          const start = point(house.startLongitude, 76);
          const end = point(house.startLongitude, 118);
          return <line key={house.number} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#d9b983" strokeOpacity=".36" strokeDasharray="2 3"/>;
        })}
        {chart.placements.filter((placement) => placement.longitudeDegrees !== null).map((placement) => {
          const position = point(placement.longitudeDegrees!, 92);
          return (
            <g key={placement.id}>
              <circle cx={position.x} cy={position.y} r="9" fill="#17121a" stroke="#d9b983" strokeWidth="1"/>
              <text x={position.x} y={position.y + 3.4} fill="#f1dccb" fontSize="10" textAnchor="middle">{placement.glyph}</text>
            </g>
          );
        })}
        {chart.ascendant && (() => {
          const position = point(chart.ascendant.longitudeDegrees, 143);
          return (
            <g>
              <circle cx={position.x} cy={position.y} r="5" fill="#d9b983"/>
              <text x={position.x} y={position.y - 10} fill="#d9b983" fontSize="9" textAnchor="middle">ASC</text>
            </g>
          );
        })()}
        <circle cx={cx} cy={cy} r="36" fill="#171020" stroke="#d9b983" strokeOpacity=".24"/>
        <path d="M160 130v60M130 160h60M139 139l42 42M181 139l-42 42" stroke="#d9b983" strokeOpacity=".25" strokeWidth="1"/>
        <path d="m160 137 6 17 17 6-17 6-6 17-6-17-17-6 17-6z" fill="#d9b983" fillOpacity=".84"/>
        <circle cx={cx} cy={cy} r="3" fill="#fff0d8"/>
        <text x={cx} y="207" textAnchor="middle" fill="#d9b983" fontSize="8" letterSpacing="1.8">COSMIC MAP</text>
      </svg>
      <span className="wheel-caption">ТРОПИЧЕСКИЙ ЗОДИАК · {chart.houseSystem === "whole-sign" ? "WHOLE SIGN" : "ПЛАНЕТАРНЫЕ ПОЛОЖЕНИЯ"}</span>
    </div>
  );
}

function LoadingPanel() {
  return <div className="empty-state"><span>✧</span><h2>Рассчитываем карту</h2><p>Проверяем время рождения и положения небесных тел…</p></div>;
}

export function NatalChartScreen({ onBack, accessToken, previewMode }: Props) {
  const [tab, setTab] = useState<"chart" | "placements">("chart");
  const [chart, setChart] = useState<NatalChartResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (previewMode) {
      setLoading(false);
      setError("Расчёт натальной карты доступен через Telegram после сохранения профиля на сервере.");
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/astrology/natal-chart`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          // The API expects a JSON request body even though birth data is read
          // from the authenticated profile. Sending {} avoids an empty-body
          // parser failure in Telegram WebView.
          body: JSON.stringify({}),
        });
        const result = await response.json() as { chart?: NatalChartResult; message?: string };
        if (!response.ok || !result.chart) {
          throw new Error(result.message ?? "Не удалось рассчитать натальную карту.");
        }
        setChart(result.chart);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Не удалось рассчитать карту.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [accessToken, previewMode]);

  return (
    <div className="page-screen natal-screen">
      <PageHeading title="Натальная карта" description="Положения небесных тел на момент твоего рождения." onBack={onBack} />
      {loading ? <LoadingPanel /> : error ? (
        <section className="natal-status-panel">
          <span className="placeholder-star" aria-hidden="true">✧</span>
          <h2>Пока не удалось построить карту</h2>
          <p>{error}</p>
          <p>Проверь дату, местное время и часовой пояс в профиле. Для Асцендента и домов добавь широту и долготу места рождения.</p>
        </section>
      ) : chart ? (
        <>
          <section className="natal-precision-panel">
            <span className="card-eyebrow">{chart.precisionLabel}</span>
            <strong>{chart.zodiac === "tropical" ? "Тропический зодиак" : "Зодиак"}</strong>
            {chart.precisionNotes.map((note) => <p key={note}>{note}</p>)}
          </section>
          <div className="natal-tabs" role="tablist" aria-label="Вид натальной карты">
            <button type="button" role="tab" aria-selected={tab === "chart"} className={tab === "chart" ? "selected" : ""} onClick={() => setTab("chart")}>Карта</button>
            <button type="button" role="tab" aria-selected={tab === "placements"} className={tab === "placements" ? "selected" : ""} onClick={() => setTab("placements")}>Положения</button>
          </div>
          {tab === "chart" ? (
            <>
            <div className="natal-wheel-heading">
              <h2>Натальный круг</h2>
              <span>{chart.precisionLabel}</span>
            </div>
            <section className="natal-chart-panel">
              <ZodiacWheel chart={chart} />
              <div className="natal-core-facts">
                <div><small>СОЛНЦЕ</small><strong>{chart.placements.find((item) => item.id === "sun")?.sign ?? "Уточняется"}</strong></div>
                <div><small>ЛУНА</small><strong>{chart.placements.find((item) => item.id === "moon")?.sign ?? "Уточняется"}</strong></div>
                <div><small>ASC</small><strong>{chart.ascendant?.sign ?? "Не рассчитан"}</strong></div>
              </div>
            </section>
            <section className="natal-highlights">
              <h2>Твои главные положения</h2>
              <div className="natal-highlight-list">
                {chart.placements.filter((placement) => placement.id === "sun" || placement.id === "moon").map((placement) => (
                  <article className="natal-highlight-card" key={placement.id}>
                    <span className="natal-highlight-icon">{placement.glyph}</span>
                    <span><small>{placement.name.toUpperCase()}</small><strong>В {placement.sign ?? (placement.possibleSigns.join(" / ") || "знаке уточнения")}</strong><em>{placement.degreeInSign !== null ? formatDegree(placement.degreeInSign) : "Требуется точное время"}</em></span>
                    <span className="natal-highlight-arrow">›</span>
                  </article>
                ))}
                <article className="natal-highlight-card">
                  <span className="natal-highlight-icon">↗</span>
                  <span><small>АСЦЕНДЕНТ</small><strong>{chart.ascendant ? `В ${chart.ascendant.sign}` : "Пока не рассчитан"}</strong><em>{chart.ascendant ? formatDegree(chart.ascendant.degreeInSign) : "Нужны время и координаты"}</em></span>
                  <span className="natal-highlight-arrow">›</span>
                </article>
              </div>
              <button className="natal-detail-link" type="button" onClick={() => setTab("placements")}>Подробнее о натальной карте <span aria-hidden="true">→</span></button>
            </section>
            </>
          ) : (
            <section className="placement-list">
              <div className="natal-wheel-heading"><h2>Положения планет</h2><span>{chart.placements.length} объектов</span></div>
              {chart.placements.map((placement) => <PlanetPosition key={placement.id} placement={placement} />)}
            </section>
          )}
          {chart.ascendant ? (
            <section className="interpretation-panel natal-note">
              <span className="card-eyebrow">АСЦЕНДЕНТ И ДОМА</span>
              <h2>{chart.ascendant.sign} · {formatDegree(chart.ascendant.degreeInSign)}</h2>
              <p>Дома построены в системе Whole Sign: каждый дом занимает целый знак зодиака, начиная со знака Асцендента.</p>
            </section>
          ) : (
            <section className="natal-status-panel">
              <span className="card-eyebrow">АСЦЕНДЕНТ И ДОМА</span>
              <h2>Нужны точное время и координаты</h2>
              <p>Мы не будем подставлять полдень или приблизительное место. Добавь точное время, часовой пояс, широту и долготу, чтобы рассчитать Асцендент и дома.</p>
            </section>
          )}
          <p className="demo-disclaimer">Положения рассчитаны Astronomy Engine. Астрологические трактовки — символическая система для саморефлексии, не научный прогноз событий.</p>
        </>
      ) : null}
    </div>
  );
}
