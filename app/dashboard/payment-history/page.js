'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getPaymentLogsByUser } from '@/lib/db';
import Link from 'next/link';
import { CreditCard, Calendar, FileText, Download, ArrowLeft, Loader2, DollarSign } from 'lucide-react';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    async function fetchPayments() {
      if (user?.uid) {
        setLoading(true);
        try {
          const logs = await getPaymentLogsByUser(user.uid);
          setPayments(logs);
        } catch (error) {
          console.error('Error fetching payments:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchPayments();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleDownloadReceipt = async (payment) => {
    setDownloadingId(payment.id);
    try {
      const { generateInvoicePDF } = await import('@/lib/invoice-generator');
      const { getBusiness } = await import('@/lib/db');

      let businessData = null;
      if (payment.businessId) {
        businessData = await getBusiness(payment.businessId);
      }

      const pdfBytes = await generateInvoicePDF(payment, businessData, user);

      // Download the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${payment.orderId || payment.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="group flex items-center text-[var(--color-muted)] hover:text-[var(--color-navy)] mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Payment History</h1>
            <p className="mt-2 text-[var(--color-muted)] font-medium">
              Track your service fees and IRS tax payments
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Total Fees</div>
              <div className="text-xl font-black text-emerald-900">
                ${payments.reduce((acc, curr) => acc + (curr.serviceFee || curr.amount || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-navy)] mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Secure Records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">
              No transactions found
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
              Your payment history will appear here once you complete a filing payment.
            </p>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center bg-[var(--color-navy)] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[var(--color-navy-soft)] transition-all shadow-xl shadow-blue-900/10 active:scale-95"
              style={{ color: '#ffffff' }}
            >
              Start New Filing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Details</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filing Type</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Fee</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Source</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-[var(--color-navy)] group-hover:text-white transition-colors">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{formatDate(payment.timestamp)}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{payment.orderId || 'Order #' + payment.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">
                          {payment.filingType || 'Standard 2290'}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 text-lg">
                        ${(payment.serviceFee || payment.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 capitalize">{payment.acquisitionSource || 'Direct'}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{payment.acquisitionMedium || 'organic'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Captured
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          disabled={downloadingId === payment.id}
                          className="inline-flex items-center text-[var(--color-navy)] font-bold text-[10px] uppercase tracking-widest hover:underline gap-1 transition-opacity disabled:opacity-50"
                        >
                          {downloadingId === payment.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{formatDate(payment.timestamp)}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{payment.filingType || 'Standard 2290'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 ${payment.acquisitionSource ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'} rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10 whitespace-nowrap`}>
                        {payment.acquisitionSource || 'Direct'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                        {payment.acquisitionMedium || 'organic'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Fee</div>
                      <div className="text-xl font-black text-slate-900">${(payment.serviceFee || payment.amount || 0).toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => handleDownloadReceipt(payment)}
                      disabled={downloadingId === payment.id}
                      className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#173b63] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {downloadingId === payment.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

