export function Logo() {
  return (
    <div className="flex items-center gap-3" aria-label="Novera">
      <svg width="40" height="40" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="8" fill="#F8FAFC" stroke="#CBD5E1" />
        <path
          d="M22 8L34 15V29L22 36L10 29V15L22 8Z"
          stroke="#0F766E"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M22 8V22M10 15L22 22L34 15M10 29L22 22L34 29M22 36V22"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="22" r="3.5" fill="#0F766E" />
      </svg>
      <span className="text-xl font-bold tracking-normal text-ink">Novera</span>
    </div>
  );
}
