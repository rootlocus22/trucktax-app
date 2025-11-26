'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    deadlineReminders: true,
    marketingEmails: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Update user settings in Firestore
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
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
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Settings</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">Notification Preferences</h2>
            
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-page-alt)] cursor-pointer">
                <div>
                  <div className="font-medium text-[var(--color-text)]">Email Notifications</div>
                  <div className="text-sm text-[var(--color-muted)]">Receive updates via email</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="w-5 h-5 text-[var(--color-navy)] rounded focus:ring-[var(--color-navy)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-page-alt)] cursor-pointer">
                <div>
                  <div className="font-medium text-[var(--color-text)]">SMS Notifications</div>
                  <div className="text-sm text-[var(--color-muted)]">Receive updates via text message</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="w-5 h-5 text-[var(--color-navy)] rounded focus:ring-[var(--color-navy)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-page-alt)] cursor-pointer">
                <div>
                  <div className="font-medium text-[var(--color-text)]">Deadline Reminders</div>
                  <div className="text-sm text-[var(--color-muted)]">Get reminders before filing deadlines</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.deadlineReminders}
                  onChange={(e) => setSettings({...settings, deadlineReminders: e.target.checked})}
                  className="w-5 h-5 text-[var(--color-navy)] rounded focus:ring-[var(--color-navy)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-page-alt)] cursor-pointer">
                <div>
                  <div className="font-medium text-[var(--color-text)]">Marketing Emails</div>
                  <div className="text-sm text-[var(--color-muted)]">Receive tips, updates, and promotional content</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({...settings, marketingEmails: e.target.checked})}
                  className="w-5 h-5 text-[var(--color-navy)] rounded focus:ring-[var(--color-navy)]"
                />
              </label>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  style={{ color: '#ffffff', fontWeight: '600' }}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Security */}
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">Account Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                <div>
                  <div className="font-medium text-[var(--color-text)]">Change Password</div>
                  <div className="text-sm text-[var(--color-muted)]">Update your account password</div>
                </div>
                <button className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition">
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

