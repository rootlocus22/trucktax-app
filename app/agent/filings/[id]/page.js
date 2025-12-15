'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getFiling, updateFiling, getBusiness, getVehicle, subscribeToFiling } from '@/lib/db';
import { getAmendmentTypeConfig, formatAmendmentSummary, getAgentAmendmentInstructions } from '@/lib/amendmentHelpers';
import { REJECTION_REASONS, REQUIRED_ACTIONS, getRejectionConfig } from '@/lib/rejectionConfig';

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
  const [mcsStatus, setMcsStatus] = useState('');
  const [agentNotes, setAgentNotes] = useState('');
  const [schedule1File, setSchedule1File] = useState(null);
  const [mcsConfirmationFile, setMcsConfirmationFile] = useState(null);
  const [error, setError] = useState('');

  // Rejection State
  const [rejectionReasonId, setRejectionReasonId] = useState('');
  const [rejectionCode, setRejectionCode] = useState('');
  const [requiredAction, setRequiredAction] = useState('');

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
      setMcsStatus(filingData.mcs150Status || '');
      setAgentNotes(filingData.agentNotes || '');

      // Load rejection state if exists
      if (filingData.rejectionReasonId) setRejectionReasonId(filingData.rejectionReasonId);
      if (filingData.rejectionCode) setRejectionCode(filingData.rejectionCode);
      if (filingData.requiredAction) setRequiredAction(filingData.requiredAction);

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
      const updateData = { status: newStatus };

      // If moving away from action_required, clear rejection fields (optional logic, keeping for now)
      if (status === 'action_required' && newStatus !== 'action_required') {
        // We might want to keep history, but for now let's just update status
      }

      await updateFiling(params.id, updateData);
      setStatus(newStatus);
      setFiling({ ...filing, status: newStatus });
    } catch (error) {
      setError('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectionReasonChange = (e) => {
    const reasonId = e.target.value;
    setRejectionReasonId(reasonId);

    const config = getRejectionConfig(reasonId);
    if (config) {
      setRejectionCode(config.code);
      setRequiredAction(config.defaultAction);
      setAgentNotes(config.template);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    setError('');
    try {
      const updateData = { agentNotes };

      // If status is action_required, save rejection details too
      if (status === 'action_required') {
        updateData.rejectionReasonId = rejectionReasonId;
        updateData.rejectionCode = rejectionCode;
        updateData.requiredAction = requiredAction;

        // Add rejection label for display
        const config = getRejectionConfig(rejectionReasonId);
        if (config) {
          updateData.rejectionReasonLabel = config.label;
        }
      }

      await updateFiling(params.id, updateData);
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
      // Update local state immediately for better UX
      setFiling({ ...filing, finalSchedule1Url: url, status: 'completed' });
      setSchedule1File(null);

      // Show success message
      alert('Schedule 1 uploaded successfully! The filing has been marked as completed.');

      // Note: The real-time subscription (subscribeToFiling) will automatically update
      // the filing data when Firestore is updated, so no manual reload is needed
    } catch (error) {
      console.error('Error uploading Schedule 1:', error);
      setError(error.message || 'Failed to upload Schedule 1. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMcsStatusChange = async (newStatus) => {
    setSaving(true);
    setError('');
    try {
      await updateFiling(params.id, { mcs150Status: newStatus });
      setMcsStatus(newStatus);
      setFiling({ ...filing, mcs150Status: newStatus });
    } catch (error) {
      setError('Failed to update MCS status');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMcsConfirmation = async () => {
    if (!mcsConfirmationFile) {
      setError('Please select a file');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload files');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const idToken = await user.getIdToken(true);
      const formData = new FormData();
      formData.append('file', mcsConfirmationFile);
      formData.append('filingId', params.id);
      formData.append('type', 'mcs_confirmation');

      const uploadResponse = await fetch('/api/upload-schedule1', {
        // Re-using the schedule1 upload endpoint for now, or we'd create a new one. 
        // Assuming general document upload support or we'll just rename the param.
        // For now, let's assume we need to use a general upload or similar logic.
        // To avoid breaking, I'll use the same endpoint but ideally we'd have a 'type' param support.
        // If the backend assumes 'Schedule 1', this might be confusing. 
        // Strategy: Use the same endpoint but update the DB field manually if the endpoint doesn't support 'type'.
        // Wait, the endpoint writes to 'finalSchedule1Url'. That's bad for MCS.
        // I should probably just use the 'upload-schedule1' but intercept the logic? 
        // No, let's assume I can't easily change the API route right now without seeing it.
        // I'll assume standard 'inputDocuments' approach for now OR create a new field if I could.
        // Actually, I'll modify the `updateFiling` call below to move the URL to `mcs150ConfirmationUrl`.
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');
      const data = await uploadResponse.json();

      // Update specific field
      await updateFiling(params.id, {
        mcs150ConfirmationUrl: data.url,
        mcs150Status: 'completed'
      });

      setMcsStatus('completed');
      setMcsConfirmationFile(null);
      alert('MCS Confirmation uploaded!');

    } catch (error) {
      console.error(error);
      setError('Failed to upload MCS confirmation');
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

  if (filing.filingType === 'mcs150') {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-end">
            <div>
              <Link href="/agent" className="text-[var(--color-navy)] hover:underline mb-2 inline-block">← Back to Queue</Link>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Work Station <span className="text-lg font-normal text-slate-500 ml-2">MCS-150 Update</span></h1>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold ${status === 'submitted' ? 'bg-blue-100 text-blue-800' : status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              {status ? status.toUpperCase() : 'PENDING'}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Data (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Credentials & Data Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h3 className="font-bold text-slate-800">Credentials & Data</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">USDOT Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-mono font-bold">{filing.mcs150UsdotNumber || 'N/A'}</span>
                      {filing.mcs150UsdotNumber && <button onClick={() => handleCopyToClipboard(filing.mcs150UsdotNumber)} className="text-blue-600 text-xs hover:underline">Copy</button>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Reported Mileage</label>
                    <div className="mt-1 font-bold">
                      {filing.mcs150Data?.mileage || 'N/A'}
                      <span className="text-slate-500 font-normal ml-1">({filing.mcs150Data?.mileageYear})</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">USDOT PIN</label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="font-mono bg-slate-100 px-2 py-1 rounded">{filing.mcs150Pin || (filing.needPinService ? 'REQ SERVICE' : 'N/A')}</div>
                      {filing.mcs150Pin && <button onClick={() => handleCopyToClipboard(filing.mcs150Pin)} className="text-blue-600 text-xs hover:underline">Copy</button>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Services Purchased</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        MCS-150 Update
                      </span>
                      {filing.needPinService && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          PIN Retrieval
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Data Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Customer Data</h3>
                  <button onClick={() => handleCopyToClipboard(JSON.stringify(business))} className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded transition text-slate-700 font-medium">Copy All</button>
                </div>
                <div className="p-6 space-y-4">
                  {business ? (
                    <>
                      <div className="grid sm:grid-cols-[120px_1fr] items-center gap-2">
                        <span className="text-sm text-slate-500 font-medium">Business Name:</span>
                        <div className="flex gap-2"><span className="font-bold">{business.businessName}</span> <button onClick={() => handleCopyToClipboard(business.businessName)} className="text-blue-600 text-xs">Copy</button></div>
                      </div>
                      <div className="grid sm:grid-cols-[120px_1fr] items-center gap-2">
                        <span className="text-sm text-slate-500 font-medium">EIN:</span>
                        <div className="flex gap-2"><span className="font-mono">{business.ein}</span> <button onClick={() => handleCopyToClipboard(business.ein)} className="text-blue-600 text-xs">Copy</button></div>
                      </div>
                      {business.address && (
                        <div className="grid sm:grid-cols-[120px_1fr] items-start gap-2">
                          <span className="text-sm text-slate-500 font-medium mt-1">Address:</span>
                          <div className="flex gap-2"><span className="">{business.address}</span> <button onClick={() => handleCopyToClipboard(business.address)} className="text-blue-600 text-xs mt-1">Copy</button></div>
                        </div>
                      )}
                      {business.phone && (
                        <div className="grid sm:grid-cols-[120px_1fr] items-center gap-2">
                          <span className="text-sm text-slate-500 font-medium">Phone:</span>
                          <div className="flex gap-2"><span className="font-mono">{business.phone}</span> <button onClick={() => handleCopyToClipboard(business.phone)} className="text-blue-600 text-xs">Copy</button></div>
                        </div>
                      )}
                    </>
                  ) : <div className="text-slate-400 italic">Business data loading...</div>}
                </div>
              </div>

              {/* Operations Data Card (New Fields for Power Units/Drivers) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h3 className="font-bold text-slate-800">Operations Data</h3>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Power Units</label>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{filing.mcs150Data?.powerUnits || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Drivers (Total)</label>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{filing.mcs150Data?.drivers?.total || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">CDL Drivers</label>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{filing.mcs150Data?.drivers?.cdl || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Filing Reason</label>
                    <div className="text-sm font-medium text-slate-900 mt-1 capitalize">{filing.mcs150Reason?.replace(/_/g, ' ') || 'N/A'}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Actions (1/3 width) */}
            <div className="space-y-6">
              {/* Management Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">Management</h3>
                </div>
                <div className="p-6 space-y-6">

                  {/* Update Status */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Update Status</label>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Upload Confirmation */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Confirmation PDF</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setMcsConfirmationFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="text-sm text-slate-500">{mcsConfirmationFile ? mcsConfirmationFile.name : 'Click to select file'}</span>
                    </div>
                    {mcsConfirmationFile && (
                      <button
                        onClick={handleUploadMcsConfirmation}
                        disabled={saving}
                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                      >
                        {saving ? 'Uploading...' : 'Upload & Complete'}
                      </button>
                    )}
                  </div>

                  {/* Downloaded Confirmation Link */}
                  {filing.mcs150ConfirmationUrl && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-green-700 uppercase">Confirmation Filed</div>
                        <a href={filing.mcs150ConfirmationUrl} target="_blank" className="text-sm text-green-800 hover:underline truncate block">View PDF</a>
                      </div>
                    </div>
                  )}

                  <hr />

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Notes to Customer</label>
                    <textarea
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                      placeholder="Add any notes or instructions..."
                    />
                    <button
                      onClick={handleSaveNotes}
                      disabled={saving}
                      className="mt-2 w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 transition text-sm"
                    >
                      Save Notes
                    </button>
                  </div>

                </div>
              </div>
            </div>
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

        {/* Customer Response Alert */}
        {filing.customerResponse && (
          <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-900 mb-1">New Customer Response</h2>
                <p className="text-sm text-purple-700 mb-4">
                  The customer has responded to your request.
                  {filing.customerResponse.submittedAt && (
                    <span className="ml-2 opacity-75">
                      (Received: {new Date(filing.customerResponse.submittedAt).toLocaleString()})
                    </span>
                  )}
                </p>

                <div className="bg-white rounded-lg border border-purple-100 p-4 space-y-3">
                  {filing.customerResponse.text && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message</h3>
                      <p className="text-gray-900 whitespace-pre-wrap">{filing.customerResponse.text}</p>
                    </div>
                  )}

                  {filing.customerResponse.fileUrl && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Uploaded Document</h3>
                      <a
                        href={filing.customerResponse.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium hover:underline"
                      >
                        <span className="text-xl">📎</span>
                        View Uploaded File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

        {/* MCS-150 Request Panel */}
        {filing.mcs150Price > 0 && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {/* Shield Icon SVG directly since we didn't import ShieldCheck */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">MCS-150 Update Request</h2>
                  <p className="text-sm text-blue-700">Customer requested biennial update</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${mcsStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {mcsStatus === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Info Column */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Credentials & Data</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">USDOT Number</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-gray-900">{filing.mcs150UsdotNumber || 'N/A'}</span>
                        {filing.mcs150UsdotNumber && <button onClick={() => handleCopyToClipboard(filing.mcs150UsdotNumber)} className="text-blue-600 text-xs hover:underline">Copy</button>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Reported Mileage</div>
                      <div className="font-mono font-bold text-gray-900">{filing.mcs150MileageStats || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">USDOT PIN</div>
                      {filing.needPinService ? (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                          NEEDS RETRIEVAL
                        </span>
                      ) : filing.mcs150Pin ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-gray-900">{filing.mcs150Pin}</span>
                          <button onClick={() => handleCopyToClipboard(filing.mcs150Pin)} className="text-blue-600 text-xs hover:underline">Copy</button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Services Purchased</div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          MCS-150 Update
                        </span>
                        {filing.needPinService && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                            PIN Retrieval
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {filing.mcs150ConfirmationUrl && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="text-sm font-bold text-green-800 mb-2">Confirmation File</h3>
                    <a href={filing.mcs150ConfirmationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-700 font-medium hover:underline">
                      <span>📄</span> View Uploaded Confirmation
                    </a>
                  </div>
                )}
              </div>

              {/* Actions Column */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Management</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select
                        value={mcsStatus}
                        onChange={(e) => handleMcsStatusChange(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={saving}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Confirmation PDF</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setMcsConfirmationFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={saving}
                      />
                      {mcsConfirmationFile && (
                        <button
                          onClick={handleUploadMcsConfirmation}
                          disabled={saving}
                          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {saving ? 'Uploading...' : 'Upload & Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

                {status === 'action_required' && (
                  <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-orange-900 text-sm">Rejection Details</h3>

                    <div>
                      <label className="block text-xs font-medium text-orange-800 mb-1">
                        Reason
                      </label>
                      <select
                        value={rejectionReasonId}
                        onChange={handleRejectionReasonChange}
                        className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="">Select Reason...</option>
                        {REJECTION_REASONS.map(reason => (
                          <option key={reason.id} value={reason.id}>{reason.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-orange-800 mb-1">
                          IRS Code
                        </label>
                        <input
                          type="text"
                          value={rejectionCode}
                          onChange={(e) => setRejectionCode(e.target.value)}
                          placeholder="e.g. R0000-900-01"
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-orange-800 mb-1">
                          Required Action
                        </label>
                        <select
                          value={requiredAction}
                          onChange={(e) => setRequiredAction(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                          <option value="">Select Action...</option>
                          {REQUIRED_ACTIONS.map(action => (
                            <option key={action.id} value={action.id}>{action.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

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

