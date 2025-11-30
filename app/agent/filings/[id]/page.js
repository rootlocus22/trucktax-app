'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getFiling, updateFiling, getBusiness, getVehicle, subscribeToFiling } from '@/lib/db';
import { getAmendmentTypeConfig, formatAmendmentSummary, getAgentAmendmentInstructions } from '@/lib/amendmentHelpers';

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
    if (!params.id) return;

    setLoading(true);

    // Subscribe to real-time filing updates
    const unsubscribe = subscribeToFiling(params.id, async (filingData) => {
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
        } catch (err) {
          console.error('Error loading business:', err);
          setError('Failed to load business information');
        }
      }

      // Load vehicles - check both vehicleIds and amendment vehicle references
      const vehicleIdsToLoad = [];
      if (filingData.vehicleIds && filingData.vehicleIds.length > 0) {
        vehicleIdsToLoad.push(...filingData.vehicleIds);
      }
      // For amendments, also load the vehicle from amendment details
      if (filingData.filingType === 'amendment' && filingData.amendmentType) {
        if (filingData.amendmentType === 'weight_increase' && filingData.amendmentDetails?.weightIncrease?.vehicleId) {
          vehicleIdsToLoad.push(filingData.amendmentDetails.weightIncrease.vehicleId);
        } else if (filingData.amendmentType === 'mileage_exceeded' && filingData.amendmentDetails?.mileageExceeded?.vehicleId) {
          vehicleIdsToLoad.push(filingData.amendmentDetails.mileageExceeded.vehicleId);
        }
      }

      if (vehicleIdsToLoad.length > 0) {
        try {
          // Remove duplicates
          const uniqueVehicleIds = [...new Set(vehicleIdsToLoad)];
          const vehicleData = await Promise.all(
            uniqueVehicleIds.map(id => getVehicle(id))
          );
          const validVehicles = vehicleData.filter(v => v !== null);
          setVehicles(validVehicles);
        } catch (err) {
          console.error('Error loading vehicles:', err);
          setError('Failed to load vehicle information');
        }
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [params.id, router]);

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

        {/* Amendment Details Banner (if amendment filing) */}
        {filing.filingType === 'amendment' && filing.amendmentType && (
          <div className="mb-6">
            {filing.amendmentType === 'vin_correction' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">📝</span>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">VIN Correction Amendment</h2>
                    <p className="text-sm text-blue-700">Customer is correcting an incorrect Vehicle Identification Number</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 bg-white rounded-lg p-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Original VIN (Incorrect)</div>
                    <div className="text-lg font-mono font-bold text-red-600 line-through">
                      {filing.amendmentDetails?.vinCorrection?.originalVIN || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Corrected VIN</div>
                    <div className="text-lg font-mono font-bold text-green-600">
                      {filing.amendmentDetails?.vinCorrection?.correctedVIN || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>✓ No Additional Tax Due:</strong> VIN corrections are FREE
                  </p>
                </div>
              </div>
            )}

            {filing.amendmentType === 'weight_increase' && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">⚖️</span>
                  <div>
                    <h2 className="text-xl font-bold text-orange-900">Taxable Gross Weight Increase Amendment</h2>
                    <p className="text-sm text-orange-700">Vehicle moved to a higher weight category</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Original Category</div>
                    <div className="text-2xl font-bold text-gray-700">
                      {filing.amendmentDetails?.weightIncrease?.originalWeightCategory || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl text-orange-600">→</span>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">New Category</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {filing.amendmentDetails?.weightIncrease?.newWeightCategory || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600">Month of Increase</div>
                    <div className="font-bold text-gray-700">
                      {filing.amendmentDetails?.weightIncrease?.increaseMonth || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600">Additional Tax Due</div>
                    <div className="text-xl font-bold text-orange-600">
                      ${filing.amendmentDetails?.weightIncrease?.additionalTaxDue?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
                {filing.amendmentDueDate && (() => {
                  // Handle both Firestore Timestamp and Date objects
                  let dueDate;
                  if (filing.amendmentDueDate.seconds) {
                    dueDate = new Date(filing.amendmentDueDate.seconds * 1000);
                  } else if (filing.amendmentDueDate.toDate) {
                    dueDate = filing.amendmentDueDate.toDate();
                  } else if (filing.amendmentDueDate instanceof Date) {
                    dueDate = filing.amendmentDueDate;
                  } else {
                    dueDate = new Date(filing.amendmentDueDate);
                  }
                  
                  return (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-bold text-red-700">
                        ⏰ Amendment Due By: {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {filing.amendmentType === 'mileage_exceeded' && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">🛣️</span>
                  <div>
                    <h2 className="text-xl font-bold text-purple-900">Mileage Use Limit Exceeded Amendment</h2>
                    <p className="text-sm text-purple-700">Suspended vehicle exceeded mileage limit</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Vehicle Type</div>
                    <div className="font-bold text-gray-700">
                      {filing.amendmentDetails?.mileageExceeded?.isAgriculturalVehicle ? 'Agricultural' : 'Standard'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Mileage Limit</div>
                    <div className="font-bold text-gray-700">
                      {filing.amendmentDetails?.mileageExceeded?.originalMileageLimit?.toLocaleString() || 'N/A'} miles
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Actual Mileage Used</div>
                    <div className="text-xl font-bold text-purple-600">
                      {filing.amendmentDetails?.mileageExceeded?.actualMileageUsed?.toLocaleString() || 'N/A'} miles
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Month Exceeded</div>
                    <div className="font-bold text-gray-700">
                      {filing.amendmentDetails?.mileageExceeded?.exceededMonth || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 border border-purple-200 rounded">
                  <p className="text-sm text-purple-800">
                    <strong>ℹ️ Full HVUT Tax Now Due:</strong> Vehicle was previously suspended but now requires full tax payment
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Agent Instructions for Amendments */}
        {filing.filingType === 'amendment' && filing.amendmentType && (() => {
          const instructions = getAgentAmendmentInstructions(filing);
          if (!instructions) return null;

          return (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-blue-900 mb-2">{instructions.title}</h2>
                  <p className="text-sm text-blue-800 mb-4">{instructions.description}</p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>✓</span> Processing Steps
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      {instructions.steps.map((step, index) => (
                        <li key={index} className="pl-2">{step}</li>
                      ))}
                    </ol>
                  </div>

                  {instructions.importantNotes && instructions.importantNotes.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <span>⚠️</span> Important Notes
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                        {instructions.importantNotes.map((note, index) => (
                          <li key={index} className="pl-2">{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {instructions.taxInfo && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">💰 Tax Information</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-green-700">Additional Tax Due:</span>
                          <span className="font-bold text-green-900 ml-2">
                            ${instructions.taxInfo.additionalTaxDue?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700">Service Fee:</span>
                          <span className="font-bold text-green-900 ml-2">
                            ${instructions.taxInfo.serviceFee?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        {instructions.taxInfo.isFree && (
                          <div className="col-span-2">
                            <span className="text-green-700 font-semibold">✓ This amendment is FREE - No payment required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

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

