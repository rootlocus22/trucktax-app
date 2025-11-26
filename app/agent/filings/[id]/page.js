'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getFiling, updateFiling, getBusiness, getVehicle } from '@/lib/db';

export default function AgentWorkStationPage() {
  const params = useParams();
  const router = useRouter();
  const { userData, user } = useAuth();
  const [filing, setFiling] = useState(null);
  const [business, setBusiness] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [agentNotes, setAgentNotes] = useState('');
  const [schedule1File, setSchedule1File] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadFiling();
    }
  }, [params.id]);

  const loadFiling = async () => {
    try {
      const filingData = await getFiling(params.id);
      if (!filingData) {
        router.push('/agent');
        return;
      }

      setFiling(filingData);
      setStatus(filingData.status);
      setAgentNotes(filingData.agentNotes || '');

      // Load business (may be null for Schedule 1 uploads)
      if (filingData.businessId) {
        try {
          const businessData = await getBusiness(filingData.businessId);
          setBusiness(businessData);
          console.log('Business loaded:', businessData);
        } catch (err) {
          console.error('Error loading business:', err);
          setError('Failed to load business information');
        }
      } else {
        console.log('Filing has no businessId (likely from Schedule 1 upload)');
      }

      // Load vehicles
      if (filingData.vehicleIds && filingData.vehicleIds.length > 0) {
        try {
          const vehicleData = await Promise.all(
            filingData.vehicleIds.map(id => getVehicle(id))
          );
          const validVehicles = vehicleData.filter(v => v !== null);
          setVehicles(validVehicles);
          console.log('Vehicles loaded:', validVehicles.length);
        } catch (err) {
          console.error('Error loading vehicles:', err);
          setError('Failed to load vehicle information');
        }
      } else {
        console.log('Filing has no vehicles');
      }
    } catch (error) {
      console.error('Error loading filing:', error);
      setError('Failed to load filing details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    setError('');
    try {
      await updateFiling(params.id, { status: newStatus });
      setStatus(newStatus);
      setFiling({ ...filing, status: newStatus });
    } catch (error) {
      setError('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    setError('');
    try {
      await updateFiling(params.id, { agentNotes });
    } catch (error) {
      setError('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadSchedule1 = async () => {
    if (!schedule1File) {
      setError('Please select a file');
      return;
    }

    if (schedule1File.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload files');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      // Get auth token
      const idToken = await user.getIdToken(true);
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      // Upload via API route
      const formData = new FormData();
      formData.append('file', schedule1File);
      formData.append('filingId', params.id);
      formData.append('isFinal', 'true'); // Flag to indicate this is the final Schedule 1

      const uploadResponse = await fetch('/api/upload-schedule1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      const url = uploadResult.url;

      if (!url) {
        throw new Error('No URL returned from upload');
      }

      // Update filing with final Schedule 1 URL and mark as completed
      await updateFiling(params.id, {
        finalSchedule1Url: url,
        status: 'completed'
      });

      setStatus('completed');
      setFiling({ ...filing, finalSchedule1Url: url, status: 'completed' });
      setSchedule1File(null);
      
      // Show success message
      alert('Schedule 1 uploaded successfully! The filing has been marked as completed.');
      
      // Optionally reload the filing to get fresh data
      await loadFiling();
    } catch (error) {
      console.error('Error uploading Schedule 1:', error);
      setError(error.message || 'Failed to upload Schedule 1. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-[var(--color-muted)]">Loading filing details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!filing) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-[var(--color-muted)]">Filing not found</p>
            <Link href="/agent" className="text-[var(--color-navy)] hover:underline mt-4 inline-block">
              Back to Queue
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/agent" className="text-[var(--color-navy)] hover:underline mb-4 inline-block">
            ← Back to Queue
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Work Station</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Customer Data */}
          <div className="space-y-6">
            <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Customer Data</h2>
                <button
                  onClick={() => {
                    const data = `Business: ${business?.businessName || ''}\nEIN: ${business?.ein || ''}\nAddress: ${business?.address || ''}\n\nVehicles:\n${vehicles.map(v => `VIN: ${v.vin}, Weight: ${v.grossWeightCategory}`).join('\n')}`;
                    handleCopyToClipboard(data);
                  }}
                  className="text-sm bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy-soft)] transition"
                >
                  Copy All
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">Business Information</h3>
                  <div className="bg-[var(--color-page-alt)] p-4 rounded-lg space-y-2.5 text-sm">
                    {business ? (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">Business Name:</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[var(--color-text)] font-medium truncate">{business.businessName}</span>
                            <button onClick={() => handleCopyToClipboard(business.businessName)} className="text-[var(--color-navy)] hover:underline text-xs flex-shrink-0">Copy</button>
                          </div>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">EIN:</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[var(--color-text)] font-medium font-mono">{business.ein}</span>
                            <button onClick={() => handleCopyToClipboard(business.ein)} className="text-[var(--color-navy)] hover:underline text-xs flex-shrink-0">Copy</button>
                          </div>
                        </div>
                        {business.address && (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[var(--color-muted)] min-w-[120px]">Address:</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-[var(--color-text)] flex-1 text-right">{business.address}</span>
                              <button onClick={() => handleCopyToClipboard(business.address)} className="text-[var(--color-navy)] hover:underline text-xs flex-shrink-0">Copy</button>
                            </div>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[var(--color-muted)] min-w-[120px]">Phone:</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-[var(--color-text)] flex-1 text-right">{business.phone}</span>
                              <button onClick={() => handleCopyToClipboard(business.phone)} className="text-[var(--color-navy)] hover:underline text-xs flex-shrink-0">Copy</button>
                            </div>
                          </div>
                        )}
                        {business.signingAuthorityName && (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[var(--color-muted)] min-w-[120px]">Signing Authority:</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-[var(--color-text)] flex-1 text-right">
                                {business.signingAuthorityName}
                                {business.signingAuthorityTitle && ` (${business.signingAuthorityTitle})`}
                              </span>
                              <button onClick={() => handleCopyToClipboard(business.signingAuthorityName)} className="text-[var(--color-navy)] hover:underline text-xs flex-shrink-0">Copy</button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : filing.businessId ? (
                      <div className="text-sm text-[var(--color-muted)] italic">
                        Loading business information...
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--color-muted)] italic">
                        Business information not available (may be from Schedule 1 upload)
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">Vehicles ({vehicles.length})</h3>
                  <div className="bg-[var(--color-page-alt)] p-4 rounded-lg">
                    {vehicles.length > 0 ? (
                      <div className="space-y-3">
                        {vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[var(--color-muted)] min-w-[80px]">VIN:</span>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[var(--color-text)] font-mono font-medium truncate">{vehicle.vin}</span>
                                  <button onClick={() => handleCopyToClipboard(vehicle.vin)} className="text-[var(--color-navy)] hover:underline text-xs flex-shrink-0">Copy</button>
                                </div>
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[var(--color-muted)] min-w-[80px]">Weight:</span>
                                <span className="text-[var(--color-text)] font-medium">{vehicle.grossWeightCategory}</span>
                              </div>
                              {vehicle.isSuspended && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <span className="text-xs font-medium text-orange-600">⚠️ Suspended Vehicle</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filing.vehicleIds && filing.vehicleIds.length > 0 ? (
                      <div className="text-sm text-[var(--color-muted)] italic">
                        Loading vehicles...
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--color-muted)] italic">
                        No vehicles found for this filing
                      </div>
                    )}
                  </div>
                </div>

                {filing.inputDocuments && filing.inputDocuments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)] mb-2">Uploaded Documents</h3>
                    <div className="space-y-2">
                      {filing.inputDocuments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-[var(--color-page-alt)] rounded-lg hover:bg-[var(--color-border)] transition text-sm"
                        >
                          Document {index + 1} →
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">Filing Details</h3>
                  <div className="bg-[var(--color-page-alt)] p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Tax Year:</span>
                      <span className="text-[var(--color-text)] font-medium">{filing.taxYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">First Used Month:</span>
                      <span className="text-[var(--color-text)] font-medium">{filing.firstUsedMonth}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Action Panel */}
          <div className="space-y-6">
            <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Actions</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Update Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] disabled:opacity-50"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="action_required">Action Required</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Notes to Customer
                  </label>
                  <textarea
                    value={agentNotes}
                    onChange={(e) => setAgentNotes(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                    placeholder="Add any notes or instructions for the customer..."
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="mt-2 w-full bg-[var(--color-navy)] text-white py-2 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Upload Stamped Schedule 1
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSchedule1File(e.target.files[0])}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                  />
                  {schedule1File && (
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Selected: {schedule1File.name}
                    </p>
                  )}
                  <button
                    onClick={handleUploadSchedule1}
                    disabled={saving || !schedule1File || status === 'completed'}
                    className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Uploading...' : 'Upload Schedule 1 & Mark Complete'}
                  </button>
                  {status === 'completed' && filing.finalSchedule1Url && (
                    <p className="mt-2 text-sm text-green-600">
                      Schedule 1 already uploaded. <a href={filing.finalSchedule1Url} target="_blank" rel="noopener noreferrer" className="underline">View current file</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

