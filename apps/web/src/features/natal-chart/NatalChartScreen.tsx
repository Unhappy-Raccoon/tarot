import { useState } from "react";
import { PageHeading } from "../../components/PageHeading";

interface Props { onBack: () => void; }

const placements = [
  { name: "Солнце", sign: "Близнецы", symbol: "☼", copy: "Самовыражение, любознательность и обмен идеями." },
  { name: "Луна", sign: "Телец", symbol: "☾", copy: "Эмоциональная устойчивость и потребность в надёжности." },
  { name: "Асцендент", sign: "Весы", symbol: "↗", copy: "Дипломатичность, гармония и внимание к взаимодействию." },
  { name: "Меркурий", sign: "Близнецы", symbol: "☿", copy: "Гибкость мышления и лёгкость коммуникации." },
  { name: "Венера", sign: "Рак", symbol: "♀", copy: "Забота, близость и эмоциональная честность." },
];

function ZodiacWheel() {
  const signs = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  return (
    <div className="zodiac-wheel" role="img" aria-label="Декоративный зодиакальный круг, данные демонстрационные">
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <defs>
          <radialGradient id="wheelGlow"><stop offset="0%" stopColor="#d9b983" stopOpacity=".1"/><stop offset="100%" stopColor="#0b0a14" stopOpacity="0"/></radialGradient>
        </defs>
        <circle cx="160" cy="160" r="150" fill="url(#wheelGlow)" />
        <circle cx="160" cy="160" r="143" fill="none" stroke="#d9b983" strokeOpacity=".65" strokeWidth="1"/>
        <circle cx="160" cy="160" r="118" fill="none" stroke="#d9b983" strokeOpacity=".28" strokeWidth="1"/>
        <circle cx="160" cy="160" r="76" fill="none" stroke="#d9b983" strokeOpacity=".36" strokeWidth="1"/>
        <circle cx="160" cy="160" r="49" fill="none" stroke="#d9b983" strokeOpacity=".24" strokeWidth="1"/>
        {Array.from({length: 12}, (_, index) => {
          const angle = (index * Math.PI * 2) / 12 - Math.PI / 2;
          const x1 = 160 + Math.cos(angle) * 118;
          const y1 = 160 + Math.sin(angle) * 118;
          const x2 = 160 + Math.cos(angle) * 143;
          const y2 = 160 + Math.sin(angle) * 143;
          const tx = 160 + Math.cos(angle + Math.PI / 12) * 130;
          const ty = 160 + Math.sin(angle + Math.PI / 12) * 130;
          return (
            <g key={index}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9b983" strokeOpacity=".35"/>
              <text x={tx} y={ty} fill="#f1dccb" fontSize="15" textAnchor="middle" dominantBaseline="middle">{signs[index]}</text>
            </g>
          );
        })}
        <path d="M160 84 L174 148 L236 160 L174 172 L160 236 L146 172 L84 160 L146 148 Z" fill="none" stroke="#d9b983" strokeOpacity=".6"/>
        <circle cx="160" cy="160" r="5" fill="#d9b983"/>
        <text x="160" y="194" textAnchor="middle" fill="#f1dccb" fontSize="9" letterSpacing="2">NATAL</text>
      </svg>
      <span className="wheel-caption">КОЛЕСО ЗОДИАКА</span>
    </div>
  );
}

export function NatalChartScreen({ onBack }: Props) {
  const [tab, setTab] = useState<"chart" | "placements">("chart");

  return (
    <div className="page-screen natal-screen">
      <PageHeading title="Натальная карта" description="Карта рождения — символический портрет твоего небесного неба." onBack={onBack} />
      <div className="natal-tabs" role="tablist" aria-label="Вид натальной карты">
        <button type="button" role="tab" aria-selected={tab === "chart"} className={tab === "chart" ? "selected" : ""} onClick={() => setTab("chart")}>Карта</button>
        <button type="button" role="tab" aria-selected={tab === "placements"} className={tab === "placements" ? "selected" : ""} onClick={() => setTab("placements")}>Положения</button>
      </div>
      {tab === "chart" ? (
        <section className="natal-chart-panel">
          <ZodiacWheel />
          <div className="natal-core-facts">
            <div><small>СОЛНЦЕ</small><strong>Близнецы</strong></div>
            <div><small>ЛУНА</small><strong>Телец</strong></div>
            <div><small>ASC</small><strong>Весы</strong></div>
          </div>
        </section>
      ) : (
        <section className="placement-list">
          {placements.map((item) => (
            <article className="placement-row" key={item.name}>
              <span className="placement-symbol">{item.symbol}</span>
              <div><small>{item.name}</small><h3>{item.sign}</h3><p>{item.copy}</p></div>
            </article>
          ))}
        </section>
      )}
      <section className="interpretation-panel natal-note">
        <span className="card-eyebrow">ТВОЯ КОСМИЧЕСКАЯ ПОДПИСЬ</span>
        <h2>Три опорные точки</h2>
        <p>Солнце символизирует способ самовыражения, Луна — эмоциональные потребности, Асцендент — первое впечатление и стиль взаимодействия с миром.</p>
      </section>
      <p className="demo-disclaimer">Знаки и положения в этом макете демонстрационные, не рассчитаны по данным рождения. Для точного Асцендента требуется время и место рождения.</p>
    </div>
  );
}
