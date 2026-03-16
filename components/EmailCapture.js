'use client';

import { useState } from 'react';

export function EmailCapture({ headline = 'Get a reminder when 2027 UCR filing opens (Oct 1)' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <p className="text-green-800 font-medium">You&apos;re on the list!</p>
        <p className="text-green-700 text-sm mt-1">We&apos;ll email you when 2027 UCR filing opens.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-6">
      <p className="text-center font-medium text-slate-900 mb-4">{headline}</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg"
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-6 py-2.5 bg-[var(--color-orange)] text-white font-medium rounded-lg hover:bg-[#e66a15] transition disabled:opacity-70"
        >
          {status === 'submitting' ? 'Signing up...' : 'Remind Me'}
        </button>
      </form>
    </div>
  );
}
