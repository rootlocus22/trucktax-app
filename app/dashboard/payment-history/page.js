'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { getPaymentsByUser } from '@/lib/db';
import { Download } from 'lucide-react';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPaymentsByUser(user.uid)
      .then(setPayments)
      .catch((err) => {
        console.error('Payment history error:', err);
        setError(err.message || 'Could not load payment history');
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const openInvoice = (payment) => {
    const win = window.open('', '_blank', 'width=600,height=700');
    if (!win) return;
    const date = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : payment.date;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Invoice ${payment.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 560px; margin: 2rem auto; padding: 1rem; color: #1e293b; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; }
            th { color: #64748b; font-weight: 600; }
            .total { font-size: 1.25rem; font-weight: 700; margin-top: 1rem; }
            .no-print { margin-top: 1.5rem; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>QuickTruckTax</h1>
          <p class="meta">Payment receipt / Invoice</p>
          <table>
            <tr><th>Date</th><td>${date}</td></tr>
            <tr><th>Description</th><td>${payment.description || 'Payment'}</td></tr>
            <tr><th>Amount</th><td>$${Number(payment.amount || 0).toLocaleString()}</td></tr>
            <tr><th>Status</th><td>${payment.status || 'paid'}</td></tr>
            ${payment.filingId ? `<tr><th>Filing</th><td>${payment.filingId}</td></tr>` : ''}
          </table>
          <p class="total">Total: $${Number(payment.amount || 0).toLocaleString()}</p>
          <p class="no-print"><button onclick="window.print()" style="padding: 0.5rem 1rem; background: #0f172a; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Print / Save as PDF</button></p>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-[var(--color-muted)] hover:text-[var(--color-text)] mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Payment History</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            View your past transactions and download invoices
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-[var(--color-muted)]">Loading payment history...</p>
          </div>
        ) : error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-800">Payments will appear here after you complete a UCR filing.</p>
            <Link href="/dashboard" className="inline-block mt-4 text-[var(--color-navy)] font-semibold hover:underline">Back to Dashboard</Link>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">
              No payments yet
            </h2>
            <p className="text-[var(--color-muted)] mb-6">
              Payments will appear here after you complete a UCR filing.
            </p>
            <Link href="/dashboard" className="inline-block mt-2 text-[var(--color-navy)] font-semibold hover:underline">
              Back to Dashboard
            </Link>
            <Link
              href="/ucr/file"
              className="inline-block mt-4 ml-4 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Start UCR Filing
            </Link>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-page-alt)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text)] uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text)] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text)] uppercase tracking-wider">
                      Filing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text)] uppercase tracking-wider">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[var(--color-page-alt)]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text)]">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[var(--color-text)]">
                        ${Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.filingId ? (
                          <Link href={`/dashboard/filings/${payment.filingId}`} className="text-[var(--color-navy)] hover:underline">
                            View filing
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openInvoice(payment)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-navy)] hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          Download invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
