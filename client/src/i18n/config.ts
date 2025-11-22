export const SUPPORTED_LOCALES = {
  ZH_CN: 'zh-CN',
  EN: 'en',
  ZH_TW: 'zh-TW',
  ES: 'es',
} as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[keyof typeof SUPPORTED_LOCALES];

export const DEFAULT_LOCALE: SupportedLocale = SUPPORTED_LOCALES.EN;

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  [SUPPORTED_LOCALES.ZH_CN]: '简体中文',
  [SUPPORTED_LOCALES.EN]: 'English',
  [SUPPORTED_LOCALES.ZH_TW]: '繁體中文',
  [SUPPORTED_LOCALES.ES]: 'Español',
};
