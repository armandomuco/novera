import { describe, expect, it } from 'vitest';
import { languages, translate, translations } from './demoWorkspace';

describe('workspace translations', () => {
  it('keeps every supported language aligned with the English dictionary', () => {
    const englishKeys = Object.keys(translations.en).sort();

    expect(englishKeys.length).toBeGreaterThan(250);
    for (const language of languages) {
      expect(Object.keys(translations[language.code]).sort()).toEqual(englishKeys);
      expect(
        Object.values(translations[language.code]).every((value) => value.trim().length > 0),
      ).toBe(true);
    }
  });

  it('translates authentication recovery labels in every language', () => {
    for (const language of languages) {
      expect(translate(language.code, 'forgotPassword')).not.toBe('forgotPassword');
      expect(translate(language.code, 'resetPassword')).not.toBe('resetPassword');
      expect(translate(language.code, 'emailVerification')).not.toBe('emailVerification');
    }
  });

  it('returns the key for an unknown translation instead of blank text', () => {
    expect(translate('en', 'unknownTranslationKey')).toBe('unknownTranslationKey');
  });
});
