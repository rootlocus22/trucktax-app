'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Update user profile in Firestore
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-[var(--color-muted)] hover:text-[var(--color-text)] mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Profile</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Manage your account information and preferences
          </p>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-gray-50 text-[var(--color-muted)]"
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                placeholder="123 Main St, City, State ZIP"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                style={{ color: '#ffffff', fontWeight: '600' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

