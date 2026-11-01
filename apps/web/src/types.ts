export type Screen =
  | "home"
  | "tarot"
  | "tarot-result"
  | "natal"
  | "astrologer"
  | "journal"
  | "profile"
  | "premium";

export type SpreadId = "daily" | "past-present-future" | "love";

export interface BirthProfile {
  displayName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  birthTimeZone?: string;
}

export interface UserProfile {
  telegramId?: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  plan: "free" | "premium";
  birthProfile: BirthProfile | null;
}
