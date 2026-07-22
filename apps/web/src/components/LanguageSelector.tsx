import { ChevronDown } from 'lucide-react';
import { languages } from '../data/demoWorkspace';

type LanguageSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const selected = languages.find((language) => language.code === value) ?? languages[0];

  return (
    <label className="relative inline-flex h-10 min-w-40 items-center rounded-ui border border-line bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm">
      <span className="mr-2 text-base" aria-hidden="true">
        {selected.flag}
      </span>
      <span className="pointer-events-none flex-1">{selected.name}</span>
      <ChevronDown size={16} className="pointer-events-none text-slate-400" aria-hidden="true" />
      <select
        aria-label="Select language"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}
