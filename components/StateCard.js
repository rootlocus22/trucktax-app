import Link from 'next/link';

export function StateCard({ state }) {
  return (
    <Link
      href={`/states/${state.slug}`}
      className="block p-4 rounded-xl border border-slate-100 bg-white shadow-card hover:border-[var(--color-orange)] hover:shadow-card-hover transition"
    >
      <span className="inline-block w-10 h-10 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center mb-2">
        {state.abbr}
      </span>
      <span className="font-semibold text-slate-900">{state.name}</span>
      {!state.participates && (
        <span className="block text-xs text-amber-600 mt-1">Non-participating — file via neighboring state</span>
      )}
    </Link>
  );
}
