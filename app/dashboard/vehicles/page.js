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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--color-orange)] mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Vehicles
            </h1>
            <p className="text-slate-500">
              Manage your vehicle fleet details and weight categories
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
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
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
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{uploadError}</span>
            </div>
            <button onClick={() => setUploadError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{uploadSuccess}</span>
            </div>
            <button onClick={() => setUploadSuccess('')} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <Truck className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
                <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-lg border border-blue-50">
                  <Plus className="w-6 h-6 text-blue-600" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Vehicles Yet</h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Add your vehicle information to streamline your future filings. You can also import multiple vehicles via CSV.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold text-sm border-2 border-slate-200 rounded-xl hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
              >
                Add Your First Vehicle
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[var(--color-orange)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-[var(--color-orange)] group-hover:border-[var(--color-orange)] transition-colors duration-300">
                    <Truck className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex gap-2">
                    {vehicle.isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[var(--color-orange)] transition-colors font-mono">
                    {vehicle.vin || 'No VIN'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Weight className="w-4 h-4" />
                    {getWeightCategoryLabel(vehicle.grossWeightCategory)}
                  </div>
                </div>

                <div className="space-y-3 mb-6 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="block text-xs font-medium text-slate-500 uppercase">Gross Weight</span>
                      <span className="block font-bold text-slate-900">{vehicle.grossWeightCategory || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="block text-xs font-medium text-slate-500 uppercase">Added</span>
                      <span className="block font-bold text-slate-900">{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/dashboard/new-filing?vehicleId=${vehicle.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-[var(--color-orange)] hover:text-white transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Use for Filing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
