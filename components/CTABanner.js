import Link from 'next/link';

const FILING_URL = process.env.NEXT_PUBLIC_FILING_APP_URL || '/ucr/file';

export function CTABanner({ variant = 'default' }) {
  return (
    <div
      className={`rounded-xl p-6 text-center shadow-card ${
        variant === 'urgent'
          ? 'bg-red-50 border border-red-200'
          : 'bg-[var(--color-orange-soft)] border border-[var(--color-orange)]/20'
      }`}
    >
      {variant === 'urgent' && (
        <p className="text-red-600 text-sm font-medium mb-1">
          ⚠ UCR enforcement is active — file now to avoid fines
        </p>
      )}
      <h3 className="font-semibold text-lg mb-1">
        File Your UCR — $79 Service Fee + We Pay the Government Fee
      </h3>
      <p className="text-slate-600 text-sm mb-4">
        One payment covers everything. Pay once, we handle the rest.
      </p>
      <Link
        href={FILING_URL}
        className="inline-block bg-[var(--color-orange)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-orange-hover)] transition"
      >
        Start Filing Now →
      </Link>
    </div>
  );
}
