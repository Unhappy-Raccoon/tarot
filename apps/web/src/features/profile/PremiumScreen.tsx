import { PageHeading } from "../../components/PageHeading";

interface Props { onBack: () => void; }

const benefits = [
  ["✦", "Больше раскладов", "Расширенный доступ к практикам Таро."],
  ["☾", "Глубже персонализация", "Более подробные астрологические интерпретации."],
  ["✧", "Больше диалога", "Повышенные лимиты общения с AI-астрологом."],
  ["▤", "Полный журнал", "История и сохранённые материалы без базовых ограничений."],
];

export function PremiumScreen({ onBack }: Props) {
  return (
    <div className="page-screen premium-screen">
      <PageHeading eyebrow="ТВОЁ ЛИЧНОЕ ПРОСТРАНСТВО" title="Premium" description="Больше глубины, времени и возможностей для ежедневных ритуалов." onBack={onBack} />
      <div className="premium-hero-art">
        <div className="premium-phase-row" aria-hidden="true"><i>☽</i><i>◔</i><i>●</i><i>◕</i><i>☾</i></div>
        <span className="premium-hero-star" aria-hidden="true">✦</span>
        <h2>Раскрой больше<br/>возможностей</h2>
        <p>Глубокие разборы, персональные прогнозы и больше пространства для себя.</p>
      </div>
      <section className="premium-benefits">
        {benefits.map(([icon, title, description]) => (
          <article className="premium-benefit" key={title}>
            <span aria-hidden="true">{icon}</span>
            <div><h2>{title}</h2><p>{description}</p></div>
          </article>
        ))}
      </section>
      <div className="premium-plan-note">
        <span className="card-eyebrow">ТАРИФЫ</span>
        <h2>Выбери свой ритм</h2>
        <p>Стоимость, сроки и точные лимиты будут опубликованы после отдельного согласования тарифов.</p>
        <button className="primary-button" type="button" disabled>Оформление скоро появится <span>✦</span></button>
      </div>
      <p className="demo-disclaimer">Оплата пока не подключена. Цены и условия не являются утверждённым предложением.</p>
    </div>
  );
}
