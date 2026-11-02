import type { DailyTransitSnapshot, TransitNatalAspect } from "../astrology/transits.js";

export interface DailyHoroscope {
  id: string;
  localDate: string;
  timeZone: string;
  title: string;
  content: string;
  transits: DailyTransitSnapshot;
  aspects: TransitNatalAspect[];
  natalPrecision: string;
  createdAt: string;
}

export interface HoroscopePreferences {
  timeZone: string;
  notificationsEnabled: boolean;
  notificationTime: string;
}

export interface DueHoroscopeNotification {
  telegramId: string;
  timeZone: string;
  localDate: string;
}
