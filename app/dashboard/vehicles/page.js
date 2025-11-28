'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getVehiclesByUser, createVehicle } from '@/lib/db';
import {
  Truck,
  Plus,
  ArrowLeft,
  Calendar,
  Weight,
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  X
} from 'lucide-react';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    if (!user) return;

    try {
      const userVehicles = await getVehiclesByUser(user.uid);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeightCategoryLabel = (category) => {
    const labels = {
      '55000-75000': '55,000 - 75,000 lbs',
      '75000-80000': '75,000 - 80,000 lbs',
      '80000+': '80,000+ lbs',
      'A': '55,000 - 55,999 lbs',
      'B': '56,000 - 57,999 lbs',
      'C': '58,000 - 59,999 lbs',
      'D': '60,000 - 61,999 lbs',
      'E': '62,000 - 63,999 lbs',
      'F': '64,000 - 65,999 lbs',
      'G': '66,000 - 67,999 lbs',
      'H': '68,000 - 69,999 lbs',
      'I': '70,000 - 71,999 lbs',
      'J': '72,000 - 73,999 lbs',
      'K': '74,000 - 75,000 lbs',
      'W': 'Over 75,000 lbs (Maximum)'
    };
    return labels[category] || category || 'Not specified';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);

        // Skip header if present (simple check: if first row contains "VIN")
        const startIdx = rows[0].toLowerCase().includes('vin') ? 1 : 0;

        let successCount = 0;
        let failCount = 0;

        for (let i = startIdx; i < rows.length; i++) {
          const cols = rows[i].split(',').map(col => col.trim());
          if (cols.length < 2) continue; // Need at least VIN and Weight

          const vin = cols[0].toUpperCase();
          const weight = cols[1].toUpperCase(); // Expecting letter code (A, B, W etc)
          const suspended = cols[2] ? (cols[2].toLowerCase() === 'true' || cols[2].toLowerCase() === 'yes') : false;

          if (vin.length === 17) {
            try {
              await createVehicle(user.uid, {
                vin,
                grossWeightCategory: weight,
                isSuspended: suspended
              });
              successCount++;
            } catch (err) {
              console.error(`Failed to add VIN ${vin}:`, err);
              failCount++;
            }
          } else {
            failCount++;
          }
        }

        await loadVehicles();
        setUploadSuccess(`Successfully added ${successCount} vehicles.${failCount > 0 ? ` Failed to add ${failCount} rows.` : ''}`);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Error processing CSV:', err);
        setUploadError('Failed to process CSV file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mb-2">
                Vehicles
              </h1>
              <p className="text-sm text-[var(--color-muted)]">
                Manage your vehicle fleet for filings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-text)] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              >
                {uploading ? (
                  <span className="animate-pulse">Importing...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </>
                )}
              </button>
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Link>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{uploadError}</span>
            </div>
            <button onClick={() => setUploadError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{uploadSuccess}</span>
            </div>
            <button onClick={() => setUploadSuccess('')} className="text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-[var(--color-muted)] animate-pulse" />
            </div>
            <p className="text-[var(--color-muted)]">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              No Vehicles Yet
            </h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Add your first vehicle to get started with filings.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-text)] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Plus className="w-4 h-4" />
                Add Your First Vehicle
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-5 hover:border-[var(--color-navy)] hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-orange)] to-[#ff7a20] rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                        {vehicle.vin || 'No VIN'}
                      </h3>
                      {vehicle.isSuspended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Suspended
                        </span>
                      )}
                      {!vehicle.isSuspended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {vehicle.grossWeightCategory && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                      <Weight className="w-4 h-4 flex-shrink-0" />
                      <span>{getWeightCategoryLabel(vehicle.grossWeightCategory)}</span>
                    </div>
                  )}
                  {vehicle.createdAt && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)] text-xs pt-2 border-t border-[var(--color-border)]">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Added: {formatDate(vehicle.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
