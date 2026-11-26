import { de } from './locales/de';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { sq } from './locales/sq';
import type { Dictionary, TranslationKey } from './types';

export type { Dictionary, Translate, TranslationKey } from './types';

export type LanguageOption = {
  code: string;
  name: string;
  flag: string;
};

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const translations: Record<string, Dictionary> = { en, sq, it, de, fr };

export function translate(language: string, key: TranslationKey | string): string {
  return translations[language]?.[key as TranslationKey] ?? en[key as TranslationKey] ?? key;
}
