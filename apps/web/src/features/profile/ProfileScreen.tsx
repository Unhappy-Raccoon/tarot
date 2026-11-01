import type { UserProfile } from "../../types";
import { PageHeading } from "../../components/PageHeading";

interface Props {
  profile: UserProfile;
  displayName: string;
  onPremium: () => void;
}

export function ProfileScreen({ profile, displayName, onPremium }: Props) {
  const birth = profile.birthProfile;
  return (
    <div className="page-screen profile-screen">
      <PageHeading title="Твой профиль" description="Твои данные и настройки личного пространства." />
      <section className="profile-identity">
        <div className="profile-avatar" aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</div>
        <div><h2>{displayName}</h2><p>{profile.username ? `@${profile.username}` : "Личный космический журнал"}</p></div>
        <span className="plan-pill">{profile.plan === "premium" ? "PREMIUM" : "FREE"}</span>
      </section>
      <button className="premium-banner" type="button" onClick={onPremium}>
        <span className="premium-banner__ornament" aria-hidden="true">✦</span>
        <span><small>БОЛЬШЕ ПРОСТРАНСТВА ДЛЯ СЕБЯ</small><strong>Открой Premium</strong><em>Расширенные трактовки и возможности журнала</em></span>
        <span className="subtle-arrow" aria-hidden="true">→</span>
      </button>
      <section className="settings-group">
        <span className="card-eyebrow">ПЕРСОНАЛЬНЫЕ ДАННЫЕ</span>
        <div className="settings-row"><span className="settings-icon">☼</span><span><strong>Дата рождения</strong><small>{birth?.birthDate ?? "Пока не указана"}</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon">◷</span><span><strong>Время рождения</strong><small>{birth?.birthTime ?? "Не указано"}</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon">⌖</span><span><strong>Место рождения</strong><small>{birth?.birthPlace ?? "Не указано"}</small></span><span className="settings-chevron">›</span></div>
      </section>
      <section className="settings-group">
        <span className="card-eyebrow">НАСТРОЙКИ</span>
        <div className="settings-row"><span className="settings-icon">♧</span><span><strong>Ежедневные уведомления</strong><small>Настройка напоминаний будет доступна позже</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon">◇</span><span><strong>Конфиденциальность</strong><small>Управление данными и удаление профиля</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon">?</span><span><strong>Поддержка</strong><small>Помощь и вопросы по сервису</small></span><span className="settings-chevron">›</span></div>
      </section>
      <p className="demo-disclaimer">Изменение профиля, уведомления и управление данными будут подключены следующими backend-итерациями.</p>
    </div>
  );
}
