import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

type PasswordFieldProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  showLabel: string;
  hideLabel: string;
};

export function PasswordField({
  label,
  value,
  defaultValue,
  onChange,
  showLabel,
  hideLabel,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
        <LockKeyhole size={18} className="text-slate-400" aria-hidden="true" />
        <input
          className="w-full border-0 bg-transparent text-sm outline-none"
          defaultValue={defaultValue}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <button
          aria-label={isVisible ? hideLabel : showLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-ui text-slate-500 hover:bg-slate-100 hover:text-ink"
          type="button"
          onClick={() => setIsVisible((current) => !current)}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      </span>
    </label>
  );
}
