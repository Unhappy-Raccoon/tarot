import { PageHeading } from "../../components/PageHeading";

interface Props { onBack: () => void; }

const benefits = [
  ["01", "Расширенные расклады", "Больше практик Таро и подробные трактовки."],
  ["02", "Персональная астрология", "Более глубокие разборы натальной карты и транзитов."],
  ["03", "Больше диалога", "Повышенные лимиты общения с AI-астрологом."],
  ["04", "Цельная история", "Все расклады, прогнозы и заметки в одном журнале."],
];

export function PremiumScreen({ onBack }: Props) {
  return (
    <div className="page-screen premium-screen">
      <PageHeading eyebrow="ТВОЁ ЛИЧНОЕ ПРОСТРАНСТВО" title="Premium" description="Больше глубины, времени и возможностей для ежедневных ритуалов." onBack={onBack} />
      <section className="premium-hero-art">
        <span className="premium-hero-kicker">ЛИЧНОЕ ПРОСТРАНСТВО БЕЗ ГРАНИЦ</span>
        <h2>Раскрой больше<br/>возможностей</h2>
        <p>Глубокие разборы, персональные прогнозы и пространство для исследования себя.</p>
        <span className="premium-hero-caption">MORE DEPTH · MORE YOU</span>
      </section>
      <section className="premium-benefits">
        {benefits.map(([icon, title, description]) => (
          <article className="premium-benefit" key={title}>
            <span aria-hidden="true">{icon}</span>
            <div><h2>{title}</h2><p>{description}</p></div>
          </article>
        ))}
      </section>
      <div className="premium-plan-note">
        <span className="card-eyebrow">СКОРО</span>
        <h2>Новый уровень твоего журнала</h2>
        <p>Состав подписки, стоимость и условия появятся здесь после отдельного согласования. Сейчас все платёжные действия отключены.</p>
        <button className="primary-button" type="button" disabled>Подписка пока недоступна</button>
      </div>
    </div>
  );
}
