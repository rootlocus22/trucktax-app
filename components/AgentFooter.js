'use client';

export function AgentFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 text-xs text-[var(--color-muted)]">
          <p>&copy; {new Date().getFullYear()} QuickTruckTax Agent Portal</p>
          <div className="text-center sm:text-right">
            <p><span className="font-semibold">Vendax Systems LLC</span> • 28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

