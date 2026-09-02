import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useId, useState } from 'react';

type PasswordFieldProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  showLabel: string;
  hideLabel: string;
};

export function PasswordField({
  label,
  autoComplete,
  value,
  defaultValue,
  onChange,
  placeholder,
  showLabel,
  hideLabel,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = useId();
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="block">
      <label className="text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
        <LockKeyhole size={18} className="text-slate-400" aria-hidden="true" />
        <input
          id={inputId}
          className="w-full border-0 bg-transparent text-sm outline-none"
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          placeholder={placeholder}
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
    </div>
  );
}
