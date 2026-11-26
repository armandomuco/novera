import { Sparkles } from 'lucide-react';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="quiet-panel rounded-ui p-5">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-ui bg-slate-100">
          <Sparkles className="text-teal" size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
        </div>
      </div>
    </div>
  );
}
