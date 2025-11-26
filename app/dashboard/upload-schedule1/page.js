'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createFiling, updateFiling, createBusiness, createVehicle, getBusinessesByUser } from '@/lib/db';
import { TruckLoader } from '@/components/TruckLoader';

export default function UploadSchedule1Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState('');
  const [filingData, setFilingData] = useState({
    taxYear: '2025-2026',
    firstUsedMonth: 'July'
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleExtractData = async () => {
    if (!file || !user) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setExtractionProgress('Creating filing record...');

    try {
      // Get auth token with force refresh
      let idToken;
      try {
        idToken = await user.getIdToken(true); // Force refresh to get a fresh token
        if (!idToken || idToken === 'null' || idToken === 'undefined') {
          throw new Error('Failed to get authentication token');
        }
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        throw new Error('Authentication failed. Please try logging in again.');
      }
      
      // Step 1: Create filing first
      const filingId = await createFiling({
        userId: user.uid,
        businessId: null,
        vehicleIds: [],
        taxYear: filingData.taxYear,
        firstUsedMonth: filingData.firstUsedMonth,
        inputDocuments: [],
        status: 'submitted',
        notes: 'Schedule 1 PDF uploaded - extracting data...'
      });

      setExtractionProgress('Uploading PDF to server...');
      
      // Step 2: Upload PDF via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filingId', filingId);

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

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadResult = await uploadResponse.json();
      setExtractionProgress('Extracting data with AI...');

      // Step 3: Extract data via API
      const extractResponse = await fetch('/api/extract-schedule1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: uploadResult.url,
          fileName: file.name,
        }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const extractResult = await extractResponse.json();
      const extracted = extractResult.data;

      if (!extracted) {
        throw new Error('Failed to extract data from PDF. Please try again or use manual entry.');
      }

      setExtractionProgress('Creating business record...');
      
      // Step 4: Create or find business
      let businessId;
      const existingBusinesses = await getBusinessesByUser(user.uid);
      const matchingBusiness = existingBusinesses.find(
        b => b.ein === extracted.ein || b.businessName === extracted.businessName
      );

      if (matchingBusiness) {
        businessId = matchingBusiness.id;
      } else if (extracted.businessName && extracted.ein) {
        businessId = await createBusiness(user.uid, {
          businessName: extracted.businessName,
          ein: extracted.ein,
          address: extracted.address || '',
          phone: extracted.phone || '',
          signingAuthorityName: extracted.signingAuthorityName || '',
          signingAuthorityTitle: extracted.signingAuthorityTitle || ''
        });
      } else {
        throw new Error('Could not extract business information. Please use manual entry.');
      }

      setExtractionProgress('Creating vehicle records...');
      
      // Step 5: Create vehicles
      const vehicleIds = [];
      if (extracted.vehicles && Array.isArray(extracted.vehicles) && extracted.vehicles.length > 0) {
        for (const vehicleData of extracted.vehicles) {
          if (vehicleData.vin && vehicleData.grossWeightCategory) {
            try {
              const vehicleId = await createVehicle(user.uid, {
                vin: vehicleData.vin.toUpperCase(),
                grossWeightCategory: vehicleData.grossWeightCategory,
                isSuspended: vehicleData.isSuspended || false
              });
              vehicleIds.push(vehicleId);
            } catch (vehicleError) {
              console.error('Error creating vehicle:', vehicleError);
            }
          }
        }
      }

      if (vehicleIds.length === 0) {
        throw new Error('Could not extract vehicle information. Please use manual entry.');
      }

      setExtractionProgress('Finalizing filing...');
      
      // Step 6: Update filing with extracted data
      await updateFiling(filingId, {
        businessId: businessId,
        vehicleIds: vehicleIds,
        taxYear: extracted.taxYear || filingData.taxYear,
        notes: `Schedule 1 PDF uploaded and data extracted automatically. Extracted ${vehicleIds.length} vehicle(s).`
      });

      setExtractionProgress('Complete!');
      
      // Show success message and redirect
      setExtractedData({
        filingId,
        message: `Success! Extracted ${vehicleIds.length} vehicle(s) and business information. Your filing has been created.`
      });

      // Redirect to filing detail page after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/filings/${filingId}`);
      }, 2000);

    } catch (error) {
      console.error('Error processing Schedule 1:', error);
      
      let errorMessage = 'Failed to process Schedule 1. Please try again or use manual entry.';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The PDF might be too large. Please try again or use manual entry.';
      } else if (error.message?.includes('CORS') || error.message?.includes('cors')) {
        errorMessage = 'Upload failed due to network error. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setExtractedData(null);
      setExtractionProgress('');
    } finally {
      setLoading(false);
      setExtractionProgress('');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Upload Schedule 1 PDF</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Upload your Schedule 1 PDF and we'll automatically extract business and vehicle information
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <TruckLoader message={extractionProgress || 'Processing your Schedule 1 PDF...'} />
          </div>
        ) : extractedData ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-green-800 mb-2">Upload Successful!</h2>
            <p className="text-green-700 mb-4">{extractedData.message}</p>
            <p className="text-sm text-green-600">Redirecting to your filing...</p>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                How it works
              </h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-[var(--color-page-alt)] rounded-lg">
                  <div className="text-3xl mb-2">📄</div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">1. Upload PDF</h3>
                  <p className="text-sm text-[var(--color-muted)]">Upload your Schedule 1 PDF file</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-page-alt)] rounded-lg">
                  <div className="text-3xl mb-2">🤖</div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">2. Auto Extract</h3>
                  <p className="text-sm text-[var(--color-muted)]">We extract business and vehicle data</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-page-alt)] rounded-lg">
                  <div className="text-3xl mb-2">✅</div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">3. Review & Submit</h3>
                  <p className="text-sm text-[var(--color-muted)]">Review extracted data and submit</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Tax Year
              </label>
              <select
                value={filingData.taxYear}
                onChange={(e) => setFilingData({...filingData, taxYear: e.target.value})}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] mb-6"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                First Used Month
              </label>
              <select
                value={filingData.firstUsedMonth}
                onChange={(e) => setFilingData({...filingData, firstUsedMonth: e.target.value})}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] mb-6"
              >
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                Upload Schedule 1 PDF *
              </label>
              
              {!file ? (
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-12 text-center hover:border-[var(--color-navy)] transition cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="schedule1-upload"
                  />
                  <label htmlFor="schedule1-upload" className="cursor-pointer">
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-lg font-semibold text-[var(--color-text)] mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      PDF file (max 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-[var(--color-navy)] rounded-xl p-4 sm:p-6 bg-[var(--color-page-alt)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="text-3xl sm:text-4xl flex-shrink-0">📄</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--color-text)] truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-800 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50 transition flex-shrink-0 text-sm sm:text-base"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-xl">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">What we'll extract from your Schedule 1:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Business name and EIN</li>
                    <li>Business address</li>
                    <li>Vehicle VINs and weight categories</li>
                    <li>Tax year and filing period</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExtractData}
                disabled={loading || !file}
                className="px-6 py-3 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white rounded-lg font-semibold hover:shadow-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: '#ffffff', fontWeight: '600' }}
              >
                Upload & Extract Data
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

