import { useState, type FormEvent } from "react";
import type { BirthProfile, UserProfile } from "../../types";
import { PageHeading } from "../../components/PageHeading";

interface Props {
  profile: UserProfile;
  displayName: string;
  onBack: () => void;
  onPremium: () => void;
  onSaveBirthProfile: (profile: BirthProfile) => Promise<void>;
}

export function ProfileScreen({ profile, displayName, onBack, onPremium, onSaveBirthProfile }: Props) {
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
      <PageHeading title="Профиль" description="Твоё личное пространство" onBack={onBack} hideBrand />
      <section className="profile-identity">
        <div className="profile-avatar"><img src="/tarot/images/profile-statue.svg" alt="" /></div>
        <div><h2>{displayName}</h2><p>{profile.username ? `@${profile.username}` : "Личный космический журнал"}</p></div>
        <span className="plan-pill">{profile.plan === "premium" ? "PREMIUM" : "FREE"}</span>
      </section>
      <button className="premium-banner" type="button" onClick={onPremium}>
        <span><small>БОЛЬШЕ ВОЗМОЖНОСТЕЙ</small><strong>Premium</strong><em>Больше глубины для твоих ежедневных ритуалов</em><b>✓ Больше диалогов с астрологом</b><b>✓ Расширенные расклады Таро</b><b>✓ Глубже натальная карта</b><b>✓ Персональные прогнозы</b></span>
        <span className="premium-banner__ornament" aria-hidden="true">✧</span>
        <span className="subtle-arrow" aria-hidden="true">→</span>
      </button>
      <section className="birth-profile-section">
        <button className="birth-profile-card" type="button" onClick={() => setEditingBirth((current) => !current)}>
          <span className="birth-profile-symbol" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15"/><path d="M10 14h20M10 20h20M10 26h20M20 5v30"/></svg></span>
          <span><strong>Данные рождения</strong><small>{birth ? [birth.birthDate, birth.birthTime, birth.birthPlace].filter(Boolean).join(" · ") : "Добавь дату, время и место рождения"}</small></span>
          <span className="birth-profile-arrow" aria-hidden="true">›</span>
        </button>
        {!editingBirth ? (
          birth && (
            <div className="birth-profile-meta">
              <span><small>ЧАСОВОЙ ПОЯС</small><strong>{birth.birthTimeZone || "Не указан"}</strong></span>
              <span><small>КООРДИНАТЫ</small><strong>{birth.birthLatitude !== undefined && birth.birthLongitude !== undefined ? `${birth.birthLatitude.toFixed(2)}, ${birth.birthLongitude.toFixed(2)}` : "Не указаны"}</strong></span>
            </div>
          )
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
        <div className="settings-row"><span className="settings-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14"/><circle cx="12" cy="12" r="8.5"/></svg></span><span><strong>Уведомления</strong><small>Ежедневный гороскоп и напоминания</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="10" cy="18" r="1.5"/></svg></span><span><strong>Предпочтения и контент</strong><small>Твои темы и формат подсказок</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.8 20 6v5.2c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3.2Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg></span><span><strong>Конфиденциальность</strong><small>Управление данными и удаление профиля</small></span><span className="settings-chevron">›</span></div>
        <div className="settings-row"><span className="settings-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.4 1.9c-1.1 1-1.9 1.4-1.9 3"/><path d="M12 17.5h.01"/></svg></span><span><strong>Поддержка</strong><small>Помощь и вопросы по сервису</small></span><span className="settings-chevron">›</span></div>
      </section>
      <p className="demo-disclaimer">Изменение данных рождения сохраняет новую версию профиля. Натальная карта пересчитается при следующем открытии.</p>
    </div>
  );
}
