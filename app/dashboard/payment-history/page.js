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
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Payment History</h1>
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
          <div className="space-y-4">
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-3">
              {payments.map((payment) => {
                const statusConfig = payment.status === 'paid'
                  ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' }
                  : payment.status === 'pending'
                    ? { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' }
                    : { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500' };

                return (
                  <div key={payment.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{payment.date}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-black">Transaction Date</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <div className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                        {payment.status}
                      </span>
                    </div>

                    <div className="py-2 border-y border-slate-50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</div>
                      <div className="text-sm font-medium text-slate-700 leading-relaxed">{payment.description}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black text-slate-900">${payment.amount}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</div>
                      </div>
                      <Link
                        href={payment.invoiceUrl}
                        className="px-5 py-2 bg-[#14b8a6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all shadow-md shadow-teal-500/10 active:scale-95"
                      >
                        Invoice
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{payment.date}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{payment.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">${payment.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            payment.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={payment.invoiceUrl} className="text-[#14b8a6] hover:text-[#0d9488] font-black text-[10px] uppercase tracking-widest hover:underline">
                            Download
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

