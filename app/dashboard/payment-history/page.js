'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch payment history from Firestore
    // For now, show empty state
    setLoading(false);
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-[var(--color-muted)] hover:text-[var(--color-text)] mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Billing & Payments</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            View your past transactions and invoices
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-[var(--color-muted)]">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">
              No payments yet
            </h2>
            <p className="text-[var(--color-muted)] mb-6">
              Your payment history will appear here once you make your first transaction.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition shadow-md"
              style={{ color: '#ffffff', fontWeight: '600' }}
            >
              Go to Dashboard
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
                        ${payment.amount}
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
                        <Link href={payment.invoiceUrl} className="text-[var(--color-navy)] hover:underline">
                          Download
                        </Link>
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

