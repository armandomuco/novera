import type { en } from './locales/en';

export type TranslationKey = keyof typeof en;

/** Every non-English dictionary must define exactly the English keys. */
export type Dictionary = Record<TranslationKey, string>;

export type Translate = (key: TranslationKey) => string;
