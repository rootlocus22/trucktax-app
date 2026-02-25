'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'no-token'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const token = params.get('token');
    if (!token) {
      setStatus('no-token');
      return;
    }
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success');
          setMessage('You have been unsubscribed from marketing emails.');
        } else {
          setStatus('error');
          setMessage(data.error || 'This link is invalid or has expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again later.');
      });
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <p className="text-gray-600">Processing your request…</p>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're unsubscribed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              You will no longer receive marketing emails from QuickTruckTax. You may still receive important emails about your filings and account.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-orange-600 font-semibold hover:underline"
            >
              Return to QuickTruckTax
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to unsubscribe</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Use the unsubscribe link from a recent QuickTruckTax email, or contact us at{' '}
              <a href="mailto:support@quicktrucktax.com" className="text-orange-600 hover:underline">
                support@quicktrucktax.com
              </a>
              .
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-orange-600 font-semibold hover:underline"
            >
              Return to QuickTruckTax
            </Link>
          </>
        )}
        {status === 'no-token' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe from emails</h1>
            <p className="text-gray-600 mb-6">
              To unsubscribe from marketing emails, use the unsubscribe link at the bottom of any QuickTruckTax email.
            </p>
            <p className="text-sm text-gray-500">
              If you need help, contact us at{' '}
              <a href="mailto:support@quicktrucktax.com" className="text-orange-600 hover:underline">
                support@quicktrucktax.com
              </a>
              .
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-orange-600 font-semibold hover:underline"
            >
              Return to QuickTruckTax
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
