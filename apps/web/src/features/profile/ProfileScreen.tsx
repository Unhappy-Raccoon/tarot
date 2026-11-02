import { useState, type FormEvent } from "react";
import type { BirthProfile, UserProfile } from "../../types";
import { PageHeading } from "../../components/PageHeading";

interface Props {
  profile: UserProfile;
  displayName: string;
  onPremium: () => void;
  onSaveBirthProfile: (profile: BirthProfile) => Promise<void>;
}

export function ProfileScreen({ profile, displayName, onPremium, onSaveBirthProfile }: Props) {
  const birth = profile.birthProfile;
  const [editingBirth, setEditingBirth] = useState(false);
  const [name, setName] = useState(birth?.displayName ?? displayName);
  const [birthDate, setBirthDate] = useState(birth?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(birth?.birthTime ?? "");
  const [birthPlace, setBirthPlace] = useState(birth?.birthPlace ?? "");
  const [birthTimeZone, setBirthTimeZone] = useState(birth?.birthTimeZone ?? "");
  const [birthLatitude, setBirthLatitude] = useState(birth?.birthLatitude !== undefined ? String(birth.birthLatitude) : "");
  const [birthLongitude, setBirthLongitude] = useState(birth?.birthLongitude !== undefined ? String(birth.birthLongitude) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveBirth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !birthDate) {
      setError("Укажи имя и дату рождения.");
      return;
    }
    const hasLatitude = birthLatitude.trim() !== "";
    const hasLongitude = birthLongitude.trim() !== "";
    if (hasLatitude !== hasLongitude) {
      setError("Укажи обе координаты или оставь оба поля пустыми.");
      return;
    }

    setSaving(true);
    try {
      await onSaveBirthProfile({
        displayName: name.trim(),
        birthDate,
        ...(birthTime ? { birthTime } : {}),
        ...(birthPlace.trim() ? { birthPlace: birthPlace.trim() } : {}),
        ...(birthTimeZone.trim() ? { birthTimeZone: birthTimeZone.trim() } : {}),
        ...(hasLatitude ? { birthLatitude: Number(birthLatitude) } : {}),
        ...(hasLongitude ? { birthLongitude: Number(birthLongitude) } : {}),
      });
      setEditingBirth(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось сохранить данные.");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="settings-row"><span className="settings-icon">☼</span><span><strong>Дата рождения</strong><small>{birth?.birthDate ?? "Пока не указана"}</small></span></div>
        <div className="settings-row"><span className="settings-icon">◷</span><span><strong>Время рождения</strong><small>{birth?.birthTime ?? "Не указано"}</small></span></div>
        <div className="settings-row"><span className="settings-icon">⌖</span><span><strong>Место рождения</strong><small>{birth?.birthPlace ?? "Не указано"}</small></span></div>
        <div className="settings-row"><span className="settings-icon">◎</span><span><strong>Часовой пояс</strong><small>{birth?.birthTimeZone ?? "Не указан"}</small></span></div>
        <div className="settings-row"><span className="settings-icon">⌖</span><span><strong>Координаты</strong><small>{birth?.birthLatitude !== undefined && birth?.birthLongitude !== undefined
          ? `${birth.birthLatitude}, ${birth.birthLongitude}`
          : "Не указаны — Асцендент и дома недоступны"}</small></span></div>
        {!editingBirth ? (
          <button className="edit-birth-button" type="button" onClick={() => setEditingBirth(true)}>Изменить данные рождения <span>→</span></button>
        ) : (
          <form className="birth-edit-form" onSubmit={saveBirth}>
            <span className="card-eyebrow">ИЗМЕНИТЬ ДАННЫЕ РОЖДЕНИЯ</span>
            <label>Имя или псевдоним
              <input value={name} maxLength={48} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>Дата рождения
              <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
            </label>
            <label>Время рождения <span className="optional">необязательно</span>
              <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
            </label>
            <label>Место рождения <span className="optional">необязательно</span>
              <input value={birthPlace} maxLength={160} placeholder="Город, страна" onChange={(event) => setBirthPlace(event.target.value)} />
            </label>
            <label>Часовой пояс места рождения
              <input value={birthTimeZone} maxLength={64} placeholder="Например, Europe/Tallinn" onChange={(event) => setBirthTimeZone(event.target.value)} />
            </label>
            <div className="coordinate-fields">
              <p>Координаты места рождения <span className="optional">для Асцендента и домов</span></p>
              <div>
                <label>Широта
                  <input type="number" min="-90" max="90" step="any" placeholder="59.4370" value={birthLatitude} onChange={(event) => setBirthLatitude(event.target.value)} />
                </label>
                <label>Долгота
                  <input type="number" min="-180" max="180" step="any" placeholder="24.7536" value={birthLongitude} onChange={(event) => setBirthLongitude(event.target.value)} />
                </label>
              </div>
              <small>Обе координаты нужно указать вместе. Автоматический поиск города пока не подключён.</small>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="birth-edit-actions">
              <button className="secondary-button" type="button" onClick={() => { setEditingBirth(false); setError(""); }}>Отмена</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить"} <span>→</span></button>
            </div>
          </form>
        )}
      </section>
      <section className="settings-group">
        <span className="card-eyebrow">НАСТРОЙКИ</span>
        <div className="settings-row"><span className="settings-icon">♧</span><span><strong>Ежедневные уведомления</strong><small>Настройка напоминаний будет доступна позже</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon">◇</span><span><strong>Конфиденциальность</strong><small>Управление данными и удаление профиля</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon">?</span><span><strong>Поддержка</strong><small>Помощь и вопросы по сервису</small></span><span className="settings-chevron">›</span></div>
      </section>
      <p className="demo-disclaimer">Изменение данных рождения сохраняет новую версию профиля. Натальная карта пересчитается при следующем открытии.</p>
    </div>
  );
}
