import { getOrCreateNatalChart } from "../astrology/repository.js";
import {
  calculateDailyTransits,
  calculateTransitNatalAspects,
  getLocalDate,
  isValidTimeZone,
} from "../astrology/transits.js";
import { getUserProfile } from "../users/repository.js";
import type { AIChatProvider } from "../ai/types.js";
import { getDailyHoroscope, saveDailyHoroscope } from "./repository.js";
import type { DailyHoroscope } from "./types.js";

export class HoroscopeServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "HoroscopeServiceError";
  }
}

const pendingGenerations = new Map<string, Promise<DailyHoroscope>>();

function buildHoroscopeInstructions(
  chart: Awaited<ReturnType<typeof getOrCreateNatalChart>>,
  localDate: string,
  timeZone: string,
  transits: ReturnType<typeof calculateDailyTransits>,
  aspects: ReturnType<typeof calculateTransitNatalAspects>,
): string {
  const natalPositions = chart.placements
    .filter((item) => item.sign !== null)
    .map((item) => `${item.name}: ${item.sign}${item.degreeInSign === null ? "" : ` ${item.degreeInSign.toFixed(2)}°`}`);
  const transitPositions = transits.positions.map((item) =>
    `${item.name}: ${item.sign} ${item.degreeInSign.toFixed(2)}°${item.retrograde ? " (ретроградное видимое движение)" : ""}`,
  );
  const aspectLines = aspects.map((item) =>
    `${item.transitPlanetName} ${item.aspect} натальному ${item.natalPlanetName}, орбис ${item.orbDegrees.toFixed(2)}°`,
  );

  return [
    "Ты — астрологический редактор Personal Cosmic Journal. Создай персональный ежедневный гороскоп на русском языке.",
    "Астрология в продукте — символический язык для саморефлексии и развлечения, не научный прогноз.",
    "Никогда не обещай события и не используй фаталистичные формулировки. Не заявляй, что транзит заставит человека действовать определённым образом.",
    "Не давай медицинских, юридических или финансовых рекомендаций. Не советуй принимать серьёзные решения только по астрологии.",
    "Используй только перечисленные рассчитанные положения и аспекты. Не придумывай транзиты, аспекты, дома, затмения, фазы Луны или точные события.",
    "Не называй нерассчитанные аспекты. Если натальное время рождения неточное, прямо ограничь градусную интерпретацию и не делай вид, что аспекты подтверждены.",
    "Пиши тепло, конкретно и без эзотерического давления. 4 коротких смысловых блока: «Тема дня», «Дела и фокус», «Отношения», «Мягкая практика». В конце — один вопрос для дневника.",
    "Общий объём 180–260 слов. Не используй Markdown-таблицы и не добавляй медицинских, денежных или категоричных прогнозов.",
    `Локальная дата: ${localDate}. Часовой пояс: ${timeZone}. Точка расчёта транзитов — полдень местной даты (UTC: ${transits.calculatedForUtc}). Зодиак: тропический, положения геоцентрические.`,
    `Точность натальной карты: ${chart.precisionLabel}. Натальные положения: ${natalPositions.length ? natalPositions.join("; ") : "надёжные положения знаков отсутствуют"}.`,
    natalPositions.length ? "" : "Не делай персональных выводов, требующих отсутствующих натальных данных.",
    `Транзитные положения: ${transitPositions.join("; ")}.`,
    aspectLines.length
      ? `Рассчитанные транзитно-натальные мажорные аспекты (не более 8 самых точных): ${aspectLines.join("; ")}.`
      : "Точных транзитно-натальных аспектов нет либо градусы натальной карты не определены. Не выдумывай их.",
    chart.ascendant
      ? `Рассчитанный натальный Асцендент: ${chart.ascendant.sign}.`
      : "Натальный Асцендент и дома не подтверждены; не интерпретируй их.",
  ].filter(Boolean).join("\n");
}

export async function generateDailyHoroscope(
  telegramId: string,
  timeZone: string,
  provider: AIChatProvider | null,
  requestedLocalDate?: string,
): Promise<DailyHoroscope> {
  if (!isValidTimeZone(timeZone)) {
    throw new HoroscopeServiceError("invalid_time_zone", "Укажи корректный часовой пояс IANA.", 400);
  }
  const localDate = requestedLocalDate ?? getLocalDate(new Date(), timeZone);
  const existing = await getDailyHoroscope(telegramId, localDate, timeZone);
  if (existing) return existing;
  if (!provider) {
    throw new HoroscopeServiceError(
      "ai_provider_not_configured",
      "Чтобы подготовить персональную трактовку гороскопа, нужно подключить AI-модель на сервере.",
      503,
    );
  }

  const key = `${telegramId}:${localDate}`;
  const pending = pendingGenerations.get(key);
  if (pending) return pending;

  const generation = (async () => {
    const profile = await getUserProfile(telegramId);
    if (!profile) throw new HoroscopeServiceError("user_not_found", "Профиль не найден.", 404);
    if (!profile.birthProfile) {
      throw new HoroscopeServiceError("birth_profile_required", "Сначала заполни дату рождения в профиле.", 409);
    }

    let chart: Awaited<ReturnType<typeof getOrCreateNatalChart>>;
    try {
      chart = await getOrCreateNatalChart(telegramId);
    } catch {
      throw new HoroscopeServiceError("natal_chart_unavailable", "Не удалось получить натальную карту. Проверь данные рождения в профиле.", 409);
    }

    const transits = calculateDailyTransits(localDate, timeZone);
    const aspects = calculateTransitNatalAspects(transits, chart);
    const instructions = buildHoroscopeInstructions(chart, localDate, timeZone, transits, aspects);
    let generated;
    try {
      generated = await provider.generate({
        instructions,
        messages: [{
          role: "user",
          content: "Подготовь мой ежедневный персональный астрологический журнал по переданным рассчитанным данным. Не повторяй технические данные, а объясни их как бережную подсказку на день.",
        }],
        maxOutputTokens: 700,
        timeoutMs: 35_000,
      });
    } catch (error) {
      throw error;
    }

    const content = generated.text.trim();
    if (!content) {
      throw new HoroscopeServiceError("empty_horoscope", "Не удалось подготовить текст гороскопа. Попробуй ещё раз.", 503);
    }
    return saveDailyHoroscope(telegramId, {
      localDate,
      timeZone,
      title: "Твой космический день",
      content,
      transits,
      aspects,
      natalPrecision: chart.precisionLabel,
    });
  })();

  pendingGenerations.set(key, generation);
  try {
    return await generation;
  } finally {
    pendingGenerations.delete(key);
  }
}

export function getTodayLocalDate(timeZone: string, now = new Date()): string {
  if (!isValidTimeZone(timeZone)) {
    throw new HoroscopeServiceError("invalid_time_zone", "Укажи корректный часовой пояс IANA.", 400);
  }
  return getLocalDate(now, timeZone);
}
