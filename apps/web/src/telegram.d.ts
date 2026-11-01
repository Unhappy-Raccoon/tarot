interface TelegramWebApp {
  initData: string;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  ready(): void;
  expand(): void;
  close(): void;
  enableClosingConfirmation?(): void;
  disableClosingConfirmation?(): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
