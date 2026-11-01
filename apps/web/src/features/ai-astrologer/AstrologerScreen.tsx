import { useState, type FormEvent } from "react";
import { PageHeading } from "../../components/PageHeading";

interface Props { onBack: () => void; }

const suggestions = ["Отношения", "Мой потенциал", "Энергия недели", "Натальная карта"];

export function AstrologerScreen({ onBack }: Props) {
  const [draft, setDraft] = useState("");
  const [showNotice, setShowNotice] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setShowNotice(true);
    setDraft("");
  }

  return (
    <div className="page-screen astrologer-screen">
      <PageHeading eyebrow="ТВОЙ ЛИЧНЫЙ ПРОВОДНИК" title="AI-астролог" description="Место для вопросов, наблюдений и бережного исследования себя." onBack={onBack} />
      <div className="chat-limit">
        <span className="chat-limit__moon" aria-hidden="true">☾</span>
        <span><strong>Дневной лимит</strong><small>Демонстрационный тариф Free</small></span>
        <strong className="chat-limit__count">2 <i>/ 5</i></strong>
      </div>
      <section className="chat-thread" aria-label="Пример диалога">
        <div className="chat-date">СЕГОДНЯ · ПРИМЕР ДИАЛОГА</div>
        <article className="chat-message chat-message--assistant">
          <span className="chat-avatar">✦</span>
          <div><small>ТВОЙ АСТРОЛОГ</small><p>Привет. Я рядом, чтобы помочь тебе посмотреть на ситуацию под новым углом. О чём поговорим сегодня?</p></div>
        </article>
        <article className="chat-message chat-message--user">
          <div><p>Хочу понять, на чём мне сейчас лучше сосредоточиться.</p></div>
        </article>
        <article className="chat-message chat-message--assistant">
          <span className="chat-avatar">✦</span>
          <div><small>ПРИМЕР ОТВЕТА</small><p>Попробуй выбрать один ориентир вместо множества задач. Иногда ясность появляется, когда мы даём себе пространство услышать собственные желания.</p></div>
        </article>
      </section>
      <div className="suggestion-block">
        <span className="card-eyebrow">ТЕМЫ ДЛЯ РАЗГОВОРА</span>
        <div className="suggestion-chips">
          {suggestions.map((item) => (
            <button type="button" key={item} onClick={() => setDraft(item)}>{item}</button>
          ))}
        </div>
      </div>
      {showNotice && (
        <p className="chat-system-notice" role="status">
          Это демонстрационный экран. AI-провайдер ещё не подключён, сообщение не отправлено.
        </p>
      )}
      <form className="chat-composer" onSubmit={submit}>
        <input
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setShowNotice(false); }}
          placeholder="Задай свой вопрос…"
          aria-label="Твой вопрос астрологу"
          maxLength={1000}
        />
        <button type="submit" aria-label="Проверить демо-отправку" disabled={!draft.trim()}>↑</button>
      </form>
      <p className="demo-disclaimer">Пример переписки и лимита. Настоящие AI-ответы и учёт тарифа будут подключены сервером.</p>
    </div>
  );
}
