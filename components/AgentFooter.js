'use client';

export function AgentFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <p className="text-xs text-[var(--color-muted)]">
            &copy; {new Date().getFullYear()} QuickTruckTax Agent Portal
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            NorthFlow Systems LLC • Delaware, USA
          </p>
        </div>
      </div>
    </footer>
  );
}

