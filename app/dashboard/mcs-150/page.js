'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, createFiling } from '@/lib/db';
import SignatureCanvas from 'react-signature-canvas';
import {
    ShieldCheck,
    Building2,
    Truck,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Loader2,
    MapPin,
    Phone,
    Mail,
    FileText,
    User,
    PenTool,
    Search,
    Upload,
    X
} from 'lucide-react';
import StripeWrapper from '@/components/StripeWrapper';


export default function MCS150Page() {
    const { user, userData } = useAuth();
    const router = useRouter();

    // Steps: 
    // 0: Search USDOT
    // 1: Business Confirm
    // 2: Reason
    // 3: Changes Triage
    // 4: Review & Complete (Mileage/Official)
    // 5: Submission Method (PIN)
    // 6: Checkout
    const [currentStep, setCurrentStep] = useState(0);
    const [filingId, setFilingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);

    // Business Data
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null); // This will be populated from search
    const [searchUsdot, setSearchUsdot] = useState('');
    const [newBusiness, setNewBusiness] = useState({ name: '', ein: '', address: '', type: 'Corporation' });

    // Workflow Data
    const [filingReason, setFilingReason] = useState('biennial'); // biennial, reapplication, reactivate, out_of_business
    const [hasChanges, setHasChanges] = useState(null); // true/false

    // Form Data
    const [formData, setFormData] = useState({
        usdotNumber: '',
        mileage: '',
        mileageYear: new Date().getFullYear() - 1,
        companyOfficial: { name: '', title: '' },
        contact: { email: '', phone: '' },
        ein: '',
        // Vehicles Breakdown
        vehicles: {
            // Truck & Trailers
            straightTrucks: { owned: 0, termLeased: 0, tripLeased: 0 },
            truckTractors: { owned: 0, termLeased: 0, tripLeased: 0 },
            trailers: { owned: 0, termLeased: 0, tripLeased: 0 },
            hazmatCargoTrucks: { owned: 0, termLeased: 0, tripLeased: 0 },
            hazmatCargoTrailers: { owned: 0, termLeased: 0, tripLeased: 0 },

            // Passenger Vehicles
            motorCoach: { owned: 0, termLeased: 0, tripLeased: 0 },
            schoolBus8: { owned: 0, termLeased: 0, tripLeased: 0 },
            schoolBus9to15: { owned: 0, termLeased: 0, tripLeased: 0 },
            schoolBus16: { owned: 0, termLeased: 0, tripLeased: 0 },
            bus16: { owned: 0, termLeased: 0, tripLeased: 0 },
            van8: { owned: 0, termLeased: 0, tripLeased: 0 },
            van9to15: { owned: 0, termLeased: 0, tripLeased: 0 },
            limo8: { owned: 0, termLeased: 0, tripLeased: 0 },
            limo9to15: { owned: 0, termLeased: 0, tripLeased: 0 },
        },
        powerUnits: '', // Total calculated
        // Drivers Breakdown
        drivers: {
            total: '',
            cdl: '',
            interstate: '',
            intrastate: ''
        },
        // Classifications
        classifications: {
            operations: [],
            cargo: [],
            hazmat: {} // Changed to object for { type: ['Carrier', 'Shipper', 'Bulk', 'Non-Bulk'] }
        },
        companyOperations: [] // New field for Interstate/Intrastate selections
    });

    // Submission Data
    const [submissionMethod, setSubmissionMethod] = useState('enter_pin'); // enter_pin, request_pin, upload_driver_license
    const [pin, setPin] = useState('');

    // Driver License Upload Method
    const [driverLicenseFile, setDriverLicenseFile] = useState(null);
    const [signatureCanvas, setSignatureCanvas] = useState(null);
    const sigCanvasRef = useRef(null);
    const [processingPdf, setProcessingPdf] = useState(false);
    const [pdfSubmissionId, setPdfSubmissionId] = useState(null);
    const [pdfError, setPdfError] = useState(null);

    // Payment Data
    const [paymentMethod, setPaymentMethod] = useState('card');

    useEffect(() => {
        // We don't auto-load businesses anymore, we start with search
        // But we might want to check if they have existing ones to show in a "Recents" list later
        // if (user) loadBusinesses();
    }, [user]);

    // Cleanup loadBusinesses if not used
    const loadBusinesses = async () => {
        // kept for reference or future "My Businesses" dropdown
        const data = await getBusinessesByUser(user.uid);
        setBusinesses(data);
    };

    const handleSearchUsdot = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        setError(null);
        try {
            if (!searchUsdot) return;

            // 1. Check if we already have this business in our DB? (Optional, maybe later)

            // 2. Call FMCSA API
            const res = await fetch(`/api/fmcsa/lookup?usdot=${searchUsdot}`);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'We couldn’t fetch this USDOT. Please enter the details manually.');

            // 3. Populate "Selected Business" with found data (even if not saved yet)
            setSelectedBusiness({
                name: data.name,
                ein: data.ein,
                type: data.type || 'Corporation',
                address: data.address,
                usdot: data.usdot // Keep track that we found it
            });

            setFormData(prev => ({
                ...prev,
                usdotNumber: data.usdot.toString(),
                ein: data.ein || '',
                // Use fetched contact info or fallback to user defaults
                contact: {
                    email: data.email || user.email || '',
                    phone: data.phone || ''
                }
            }));

            setCurrentStep(1); // Move to confirm step
        } catch (err) {
            console.error(err);
            setError(err.message || 'USDOT not found.');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCreateBusiness = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const id = await createBusiness(user.uid, newBusiness);
            await loadBusinesses();
            // setShowNewBusinessForm(false); // This state is removed
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Called when user clicks "Start MCS-150" on Step 1
    const handleConfirmBusiness = async () => {
        setLoading(true);
        try {
            // Check if business exists in our DB, if not create it
            // Logic: we can just try to create/update.
            // For now, simpler: Just proceed. We bind businessId at submission if it exists

            // Actually, we might want to save it now so we have an ID?
            // Let's assume we proceed and just use the data.
            // If we want to save it:
            // const existing = businesses.find(b => b.usdot === formData.usdotNumber);
            // if (!existing) await createBusiness(...)

            setCurrentStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPdf = async () => {
        if (!driverLicenseFile || !signatureCanvas || !user) {
            setPdfError('Please upload driver license and provide signature');
            return;
        }

        setProcessingPdf(true);
        setPdfError(null);

        try {
            // Get auth token
            const idToken = await user.getIdToken(true);
            if (!idToken) {
                throw new Error('Failed to get authentication token');
            }

            // Prepare form data for PDF generation
            const formDataForPdf = new FormData();
            formDataForPdf.append('driverLicense', driverLicenseFile);
            formDataForPdf.append('signature', signatureCanvas);

            // Calculate power units
            const calculatePowerUnits = (vehicleType) => {
                if (!vehicleType || typeof vehicleType !== 'object') return 0;
                return (parseInt(vehicleType.owned) || 0) +
                    (parseInt(vehicleType.termLeased) || 0) +
                    (parseInt(vehicleType.tripLeased) || 0);
            };

            const calculatedPowerUnits =
                calculatePowerUnits(formData.vehicles.straightTrucks) +
                calculatePowerUnits(formData.vehicles.truckTractors) +
                calculatePowerUnits(formData.vehicles.hazmatCargoTrucks);

            const driversTotal = formData.drivers.total ||
                (parseInt(formData.drivers.interstate || 0) + parseInt(formData.drivers.intrastate || 0));

            formDataForPdf.append('formData', JSON.stringify({
                usdotNumber: formData.usdotNumber,
                businessName: selectedBusiness.name,
                ein: formData.ein || selectedBusiness.ein || '',
                address: selectedBusiness.address ? `${selectedBusiness.address.street}, ${selectedBusiness.address.city}, ${selectedBusiness.address.state} ${selectedBusiness.address.zip}` : '',
                mileage: formData.mileage,
                mileageYear: formData.mileageYear,
                powerUnits: calculatedPowerUnits.toString(),
                vehicles: formData.vehicles,
                drivers: {
                    ...formData.drivers,
                    total: driversTotal.toString()
                },
                classifications: formData.classifications,
                companyOperations: formData.companyOperations,
                companyOfficial: formData.companyOfficial,
                contact: formData.contact,
                filingReason: filingReason,
                hasChanges: hasChanges,
                selectedChanges: selectedChanges
            }));

            // Call API to generate PDF
            const pdfResponse = await fetch('/api/mcs150/generate-pdf', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
                body: formDataForPdf,
            });

            if (!pdfResponse.ok) {
                const errorData = await pdfResponse.json().catch(() => ({ error: 'PDF generation failed' }));
                throw new Error(errorData.error || 'Failed to generate PDF');
            }

            const pdfResult = await pdfResponse.json();

            if (!pdfResult.pdfUrl && !pdfResult.pdfDataUrl) {
                throw new Error('PDF generation failed - no PDF received');
            }

            let pdfUrl = pdfResult.pdfUrl;
            let submissionId = pdfResult.submissionId;

            // If for some reason server upload failed but we got data URL fallback
            if (!pdfUrl && pdfResult.pdfDataUrl) {
                console.warn('Server upload failed, attempting client-side upload fallback');
                const { uploadFile } = await import('@/lib/storage');
                const pdfBlob = await fetch(pdfResult.pdfDataUrl).then(r => r.blob());
                const pdfFile = new File([pdfBlob], `mcs150-${Date.now()}.pdf`, { type: 'application/pdf' });
                pdfUrl = await uploadFile(pdfFile, `mcs150-submissions/${user.uid}/${Date.now()}-mcs150-filled.pdf`);

                // If we also didn't get a submissionId, we need to create it manually
                if (!submissionId) {
                    const { createMcs150Submission } = await import('@/lib/db');
                    submissionId = await createMcs150Submission(user.uid, {
                        pdfUrl: pdfUrl,
                        formData: pdfResult.formData,
                        status: 'submitted',
                        filingType: 'mcs150',
                    });
                }
            }

            setPdfSubmissionId(submissionId);

            // Definitions for initial filing record
            const needPin = submissionMethod === 'request_pin';
            const price = 49 + (needPin ? 20 : 0);

            let bId = selectedBusiness?.id;
            if (!bId && selectedBusiness) {
                const newBiz = {
                    name: selectedBusiness.name,
                    ein: selectedBusiness.ein || '',
                    type: selectedBusiness.type || 'Corporation',
                    address: selectedBusiness.address ? `${selectedBusiness.address.street}, ${selectedBusiness.address.city}, ${selectedBusiness.address.state} ${selectedBusiness.address.zip}` : '',
                    usdot: formData.usdotNumber,
                    phone: formData.contact.phone,
                    email: formData.contact.email
                };
                bId = await createBusiness(user.uid, newBiz);
            }

            const initialFilingId = await createFiling({


                userId: user.uid,
                businessId: bId,
                filingType: 'mcs150',
                status: 'pending_payment',
                paymentStatus: 'pending',
                mcs150Status: 'pending_payment',
                mcs150Price: price,
                mcs150Reason: filingReason,
                mcs150HasChanges: hasChanges,
                mcs150UsdotNumber: formData.usdotNumber,
                mcs150Pin: submissionMethod === 'enter_pin' ? pin : null,
                needPinService: needPin,
                mcs150SubmissionId: submissionId,
                companyOfficial: formData.companyOfficial,
                contact: {
                    email: formData.contact?.email || '',
                    phone: formData.contact?.phone || ''
                },
                mcs150Data: {
                    mileage: formData.mileage,
                    mileageYear: formData.mileageYear,
                    powerUnits: calculatedPowerUnits.toString(),
                    vehicles: formData.vehicles,
                    drivers: {
                        ...formData.drivers,
                        total: driversTotal.toString()
                    },
                    classifications: formData.classifications,
                    companyOperations: formData.companyOperations,
                    method: submissionMethod,
                    selectedChanges: selectedChanges,
                    ein: formData.ein || selectedBusiness?.ein || ''
                },
                compliance: {
                    signature: formData.companyOfficial?.name,
                    date: new Date().toISOString()
                },
                createdAt: new Date().toISOString()
            });
            setFilingId(initialFilingId);

            // Proceed to payment step after successful PDF generation and upload
            setCurrentStep(6);


        } catch (err) {
            console.error('Error processing PDF:', err);
            setPdfError(err.message || 'Failed to process PDF. Please try again.');
        } finally {
            setProcessingPdf(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (filingId) {
                const { updateFiling } = await import('@/lib/db');
                await updateFiling(filingId, {
                    status: 'submitted',
                    mcs150Status: 'submitted',
                    updatedAt: new Date().toISOString()
                });
            }
            setCurrentStep(7); // Go to success step
        } catch (err) {
            setError(err.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    // --- Helper Components ---

    const Sidebar = () => (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Business Details</h3>

            {selectedBusiness ? (
                <div className="space-y-4 text-sm">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase">Business Name</label>
                        <div className="font-medium text-slate-900">{selectedBusiness.name}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase">Entity Type</label>
                        <div className="font-medium text-slate-900">{selectedBusiness.type}</div>
                    </div>
                    {formData.usdotNumber && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase">USDOT Number</label>
                            <div className="font-medium text-slate-900">{formData.usdotNumber}</div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase">Last Updated</label>
                        <div className="font-medium text-slate-900">Feb 03, 2025</div> {/* Mock for now */}
                    </div>
                </div>
            ) : (
                <div className="text-slate-400 text-sm italic">No business selected</div>
            )}
        </div>
    );

    const ProgressBar = () => {
        // Approximate progress
        // Steps 0 to 6 (7 total view states)
        if (currentStep === 0 || currentStep === 7) return null; // Hide on search and success

        // Logical steps for bar: 1=Start, 2=Reason, 3=Changes, 4=Review, 5=PIN, 6=Pay
        const percent = Math.min(100, Math.round(((currentStep) / 6) * 100));

        return (
            <div className="mb-8 hidden sm:block">
                <div className="flex justify-end mb-1 text-xs font-bold text-[var(--color-navy)]">{Math.round(percent)}%</div>
                <div className="h-2 bg-[var(--color-page-alt)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-navy)] transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
            </div>
        );
    };

    // --- Step Renderers ---

    // Step 0: Search
    const renderStep0 = () => (
        <div className="max-w-xl mx-auto py-12 text-center space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-[var(--color-text)]">File Your MCS-150</h1>
                <p className="text-[var(--color-muted)]">Enter your USDOT number to retrieve your business details and start filing.</p>
            </div>

            <form onSubmit={handleSearchUsdot} className="bg-white p-2 rounded-xl shadow-lg border border-[var(--color-border)] flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-[var(--color-muted)]" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-4 bg-transparent border-none focus:ring-0 text-lg placeholder:text-slate-300"
                        placeholder="Enter USDOT Number"
                        value={searchUsdot}
                        onChange={e => setSearchUsdot(e.target.value)}
                        autoFocus
                    />
                </div>
                <button
                    disabled={!searchUsdot || searchLoading}
                    className="bg-[var(--color-navy)] hover:bg-[var(--color-navy-soft)] text-white px-8 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                    {searchLoading ? <Loader2 className="animate-spin" /> : 'Search'}
                </button>
            </form>

            <div className="flex justify-center gap-8 text-sm text-[var(--color-muted)]">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-navy)]" /> Secure Filing
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-navy)]" /> FMCSA Compliant
                </div>
            </div>
        </div>
    );

    // Step 1: Business Confirm
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">We've found the following business details.</h2>
                <div className="text-[var(--color-muted)] mt-2">
                    Result for USDOT <span className="font-mono font-bold text-[var(--color-text)] bg-slate-100 px-2 py-0.5 rounded">{formData.usdotNumber}</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-[var(--color-page-alt)] p-4 rounded border border-[var(--color-border)]">
                        <label className="block text-xs font-bold mb-1 uppercase text-[var(--color-muted)]">Legal Business Name</label>
                        <div className="font-bold text-lg text-[var(--color-text)]">{selectedBusiness.name}</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-[var(--color-page-alt)] p-4 rounded border border-[var(--color-border)]">
                        <label className="block text-xs font-bold mb-1 uppercase text-[var(--color-muted)]">EIN (Tax ID)</label>
                        <div className="font-bold text-lg text-[var(--color-text)]">{selectedBusiness.ein || 'N/A'}</div>
                    </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                    <div className="bg-[var(--color-page-alt)] p-4 rounded border border-[var(--color-border)]">
                        <label className="block text-xs font-bold mb-1 uppercase text-[var(--color-muted)]">Official Address</label>
                        <div className="font-medium text-[var(--color-text)]">
                            {selectedBusiness.address?.street}, {selectedBusiness.address?.city}, {selectedBusiness.address?.state} {selectedBusiness.address?.zip}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-border)] mt-6">
                <div>
                    <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Email Address <span className="text-red-500">*</span></label>
                    <input
                        className="w-full bg-white border border-[var(--color-border)] p-3 rounded focus:border-[var(--color-navy)] outline-none text-[var(--color-text)]"
                        value={formData.contact?.email || ''}
                        placeholder="For filing confirmation"
                        onChange={e => setFormData({ ...formData, contact: { ...(formData.contact || {}), email: e.target.value } })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Mobile Phone Number <span className="text-red-500">*</span></label>
                    <input
                        className="w-full bg-white border border-[var(--color-border)] p-3 rounded focus:border-[var(--color-navy)] outline-none text-[var(--color-text)]"
                        value={formData.contact?.phone || ''}
                        placeholder="For status updates"
                        onChange={e => setFormData({ ...formData, contact: { ...(formData.contact || {}), phone: e.target.value } })}
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-8">
                <button className="border border-[var(--color-border)] text-[var(--color-muted)] py-3 px-6 rounded-lg font-bold hover:bg-[var(--color-page-alt)]" onClick={() => setCurrentStep(0)}>
                    Wrong USDOT?
                </button>
                <button
                    onClick={handleConfirmBusiness}
                    className="flex-1 bg-[var(--color-navy)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-navy-soft)]"
                >
                    Confirm & Start Filing <ChevronRight className="inline w-5 h-5" />
                </button>
            </div>
        </div>
    );

    // Step 2: Reason
    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Select the reason for filing MCS-150</h2>

            <div className="space-y-4">
                {[
                    { id: 'biennial', label: 'Biennial Update or Change', sub: "Select this if you're filing for a biennial update due this month or making changes." },
                    { id: 'reapplication', label: 'Reapplication (after revocation)', sub: null },
                    { id: 'reactivate', label: 'Reactivate USDOT number', sub: null },
                    { id: 'out_of_business', label: 'Notify FMCSA that the USDOT is out of business', sub: null },
                ].map(opt => {
                    const isSelected = filingReason === opt.id;
                    return (
                        <div key={opt.id} className={`block relative p-4 rounded-lg border-2 cursor-pointer transition ${isSelected ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)] hover:border-[var(--color-navy)]'}`} onClick={() => setFilingReason(opt.id)}>
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[var(--color-navy)]' : 'border-[var(--color-border)]'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-navy)]" />}
                                </div>
                                <div>
                                    <div className="font-bold text-[var(--color-text)]">{opt.label}</div>
                                    {opt.sub && <div className="text-sm text-[var(--color-muted)] mt-1">{opt.sub}</div>}
                                    {isSelected && opt.sub && opt.id === 'biennial' && (
                                        <div className="mt-2 text-xs bg-blue-100 text-blue-800 p-2 rounded">
                                            Most common choice for active carriers.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4 pt-4">
                <button className="text-[var(--color-navy)] font-bold px-4 hover:underline" onClick={() => setCurrentStep(1)}>Go Back</button>
                <button className="bg-[var(--color-navy)] text-white py-3 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)]" onClick={() => setCurrentStep(3)}>Continue Filing <ChevronRight className="inline w-4 h-4" /></button>
            </div>
        </div>
    );

    const [selectedChanges, setSelectedChanges] = useState([]); // Array of strings: 'company', 'address', 'vehicles', 'drivers', 'mileage'

    // Toggle a change category
    const toggleChange = (id) => {
        if (selectedChanges.includes(id)) {
            setSelectedChanges(selectedChanges.filter(c => c !== id));
        } else {
            setSelectedChanges([...selectedChanges, id]);
        }
    };

    // Step 3: Changes Triage - Granular Selection to make it "Not Lengthy"
    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text)]">What information needs updating?</h2>
            <p className="text-[var(--color-muted)]">Select the specific items you want to change. We will only show fields for the items you select.</p>

            <div className="space-y-4">
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${hasChanges === false ? 'border-[var(--color-navy)] bg-blue-50 ring-1 ring-[var(--color-navy)]' : 'border-[var(--color-border)] hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${hasChanges === false ? 'border-[var(--color-navy)] bg-white' : 'border-slate-300'}`}>
                            {hasChanges === false && <div className="w-3 h-3 rounded-full bg-[var(--color-navy)]" />}
                        </div>
                        <span className="font-bold text-[var(--color-text)]">No updates needed (Verify & Sign)</span>
                    </div>
                    <input type="radio" checked={hasChanges === false} onChange={() => { setHasChanges(false); setSelectedChanges([]); }} className="hidden" />
                </label>

                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${hasChanges === true ? 'border-[var(--color-navy)] bg-blue-50 ring-1 ring-[var(--color-navy)]' : 'border-[var(--color-border)] hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${hasChanges === true ? 'border-[var(--color-navy)] bg-white' : 'border-slate-300'}`}>
                            {hasChanges === true && <div className="w-3 h-3 rounded-full bg-[var(--color-navy)]" />}
                        </div>
                        <span className="font-bold text-[var(--color-text)]">Yes, I need to make changes</span>
                    </div>
                    <input type="radio" checked={hasChanges === true} onChange={() => setHasChanges(true)} className="hidden" />

                    {hasChanges === true && (
                        <div className="mt-6 ml-4 animate-in slide-in-from-top-2 fade-in duration-300 space-y-6">

                            {/* Group 1: Company Information */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                    Company Information
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Select all you wish to update)</span>
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-2 ml-7">
                                    {[
                                        { id: 'owner_name', label: "Owner's Name (Officer)" },
                                        { id: 'dba_name', label: "DBA (Doing Business As) Name" },
                                        { id: 'phy_address', label: 'Company Physical Address' },
                                        { id: 'mail_address', label: 'Company Mailing Address' },
                                        { id: 'phone', label: 'Business Phone Number' },
                                        { id: 'email', label: 'Business Email Address' },
                                        { id: 'company_name', label: 'Company Name' },
                                        { id: 'ein', label: 'EIN or SSN Number' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                checked={selectedChanges.includes(item.id)}
                                                onChange={() => toggleChange(item.id)}
                                            />
                                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Group 2: Operating Information */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-orange-600" />
                                    Operating Information
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Select all you wish to update)</span>
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-2 ml-7">
                                    {[
                                        { id: 'vehicles', label: 'Number of Vehicles' },
                                        { id: 'drivers', label: 'Number of Drivers' },
                                        { id: 'operations', label: 'Company Operations' },
                                        { id: 'op_class', label: 'Operation Classifications' },
                                        { id: 'cargo_class', label: 'Cargo Classifications' },
                                        { id: 'hazmat', label: 'Hazardous Materials' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                checked={selectedChanges.includes(item.id)}
                                                onChange={() => toggleChange(item.id)}
                                            />
                                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Group 3: Other */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-600" />
                                    Other
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-2 ml-7">
                                    {[
                                        { id: 'mileage', label: 'Mileage Information' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                checked={selectedChanges.includes(item.id)}
                                                onChange={() => toggleChange(item.id)}
                                            />
                                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <button className="border border-[var(--color-navy)] text-[var(--color-navy)] py-2 px-6 rounded-lg font-bold hover:bg-slate-50 transition" onClick={() => setCurrentStep(2)}>Go Back</button>
                <button
                    disabled={hasChanges === null || (hasChanges === true && selectedChanges.length === 0)}
                    className="bg-[var(--color-navy)] text-white py-3 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                    onClick={() => setCurrentStep(4)}
                >
                    Continue Filing <ChevronRight className="inline w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // Step 4: Review Data - Dynamic & Granular
    const renderStep4 = () => {
        // Calculate totals dynamically for display
        const totalVehicles = Object.values(formData.vehicles).reduce((acc, curr) => {
            // Sum owned+term+trip for each category, possibly excluding trailers if strict Power Unit def used, 
            // but usually simplistic count is fine for this display unless specified.
            // However, specifically excluding Trailers and Hazmat Trailers from "Power Units" is standard.
            // We'll trust simple sum for now or just sum power units.
            // Let's summing everything for "Vehicles Operated" display, but "Power Units" is technically specific.
            // For this UI, let's just sum all inputs to show activity.
            return acc + (parseInt(curr.owned) || 0) + (parseInt(curr.termLeased) || 0) + (parseInt(curr.tripLeased) || 0);
        }, 0);

        const isMileageSelected = selectedChanges.includes('mileage') || hasChanges === false || true; // Mileage is always mandatory
        const isCompanySelected = selectedChanges.includes('company');
        const isAddressSelected = selectedChanges.includes('address');
        const isVehiclesSelected = selectedChanges.includes('vehicles');
        const isDriversSelected = selectedChanges.includes('drivers');
        const isClassificationsSelected = selectedChanges.includes('classifications');

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Review & Complete</h2>
                    <p className="text-slate-500">Please review the mandatory information below and update any sections you selected.</p>
                </div>

                {/* 1. MILEAGE (Always Required) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[var(--color-navy)] transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-navy)]"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-[var(--color-navy)] rounded-lg"><FileText className="w-5 h-5" /></div>
                        <h3 className="font-bold text-lg text-slate-800">Mileage Information <span className="text-red-500 text-sm">*</span></h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Total Miles (Last 12 Months)</label>
                            <input
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent outline-none transition-all font-mono"
                                placeholder="e.g. 25000"
                                type="number"
                                value={formData.mileage}
                                onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Year of Mileage</label>
                            <input
                                className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-500"
                                value={formData.mileageYear}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* 2. COMPANY IDENTITY (Granular) */}
                {(['company_name', 'dba_name', 'ein', 'phone', 'email', 'owner_name'].some(k => selectedChanges.includes(k))) && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[var(--color-navy)] transition-colors animate-in slide-in-from-bottom-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
                            <h3 className="font-bold text-lg text-slate-800">Company Information</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {selectedChanges.includes('company_name') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Legal Business Name</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        value={selectedBusiness?.name || ''}
                                        readOnly
                                    />
                                    <div className="text-xs text-orange-600 mt-1">Proof required for name change.</div>
                                </div>
                            )}
                            {selectedChanges.includes('dba_name') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">DBA Name (Doing Business As)</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        placeholder="Doing Business As Name"
                                    />
                                </div>
                            )}
                            {selectedChanges.includes('ein') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">EIN (Employer ID)</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3 font-mono"
                                        value={formData.ein || ''}
                                        onChange={e => setFormData({ ...formData, ein: e.target.value })}
                                    />
                                </div>
                            )}
                            {selectedChanges.includes('phone') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Phone Number</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        value={formData.contact.phone || ''}
                                        onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                                    />
                                </div>
                            )}
                            {selectedChanges.includes('email') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Email Address</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        value={formData.contact.email || ''}
                                        onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                                    />
                                </div>
                            )}
                            {selectedChanges.includes('owner_name') && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Owner's Name</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        placeholder="Full Name"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. ADDRESSES (Conditional) */}
                {(selectedChanges.includes('phy_address') || selectedChanges.includes('mail_address')) && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[var(--color-navy)] transition-colors animate-in slide-in-from-bottom-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin className="w-5 h-5" /></div>
                            <h3 className="font-bold text-lg text-slate-800">Company Address</h3>
                        </div>
                        <div className="space-y-4">
                            {selectedChanges.includes('phy_address') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Physical Address</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        placeholder="Street, City, State ZIP"
                                        defaultValue={selectedBusiness?.address ? `${selectedBusiness.address.street}, ${selectedBusiness.address.city}, ${selectedBusiness.address.state} ${selectedBusiness.address.zip}` : ''}
                                    />
                                </div>
                            )}
                            {selectedChanges.includes('mail_address') && (
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Mailing Address</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-3"
                                        placeholder="Mailing Street, City, State ZIP"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox" id="same_as_phy" className="rounded border-slate-300 text-[var(--color-navy)]" />
                                        <label htmlFor="same_as_phy" className="text-sm text-slate-600">Same as Physical Address</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. VEHICLES (Conditional) */}
                {selectedChanges.includes('vehicles') && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[var(--color-navy)] transition-colors animate-in slide-in-from-bottom-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Truck className="w-5 h-5" /></div>
                            <h3 className="font-bold text-lg text-slate-800">Vehicle Information</h3>
                        </div>

                        <div className="space-y-6">

                            {/* Helper Function for Rows */}
                            {(() => {
                                const renderVehicleRow = (key, label) => (
                                    <div key={key} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">{label}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['owned', 'termLeased', 'tripLeased'].map(type => (
                                                <div key={type}>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-slate-200 rounded p-2 text-center text-sm font-semibold focus:border-orange-400 focus:outline-none"
                                                        placeholder="0"
                                                        value={formData.vehicles[key]?.[type] || ''}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                vehicles: {
                                                                    ...prev.vehicles,
                                                                    [key]: {
                                                                        ...prev.vehicles[key],
                                                                        [type]: val
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                    />
                                                    <div className="text-[9px] text-center text-slate-400 mt-1 uppercase tracking-tighter font-semibold">
                                                        {type.replace(/([A-Z])/g, ' $1').trim()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        {/* Column 1: Trucks and Trailers */}
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 border-b-2 border-orange-100 pb-2 mb-4">Truck and Trailers</h4>
                                            {renderVehicleRow('straightTrucks', 'Straight Trucks')}
                                            {renderVehicleRow('truckTractors', 'Truck Tractors')}
                                            {renderVehicleRow('trailers', 'Trailers')}
                                            {renderVehicleRow('hazmatCargoTrucks', 'Hazmat Cargo Tank Trucks')}
                                            {renderVehicleRow('hazmatCargoTrailers', 'Hazmat Cargo Tank Trailers')}
                                        </div>

                                        {/* Column 2: Passenger Vehicles */}
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 border-b-2 border-orange-100 pb-2 mb-4">Passenger Vehicles</h4>
                                            {renderVehicleRow('motorCoach', 'Motor-Coach')}
                                            {renderVehicleRow('schoolBus8', 'School Bus (1-8 Pass)')}
                                            {renderVehicleRow('schoolBus9to15', 'School Bus (9-15 Pass)')}
                                            {renderVehicleRow('schoolBus16', 'School Bus (16+ Pass)')}
                                            {renderVehicleRow('bus16', 'Bus (16+ Pass)')}
                                            {renderVehicleRow('van8', 'Van (1-8 Pass)')}
                                            {renderVehicleRow('van9to15', 'Van (9-15 Pass)')}
                                            {renderVehicleRow('limo8', 'Limousine (1-8 Pass)')}
                                            {renderVehicleRow('limo9to15', 'Limousine (9-15 Pass)')}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="bg-orange-50 p-4 rounded-lg flex justify-between items-center text-sm font-bold text-orange-800 border border-orange-100">
                                <span>Total Vehicles to be Operated in US:</span>
                                <span className="text-xl">{totalVehicles}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. DRIVERS (Conditional) */}
                {selectedChanges.includes('drivers') && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[var(--color-navy)] transition-colors animate-in slide-in-from-bottom-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><User className="w-5 h-5" /></div>
                            <h3 className="font-bold text-lg text-slate-800">Driver Information</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Interstate</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-300 rounded-lg p-3"
                                    value={formData.drivers.interstate}
                                    onChange={e => setFormData({ ...formData, drivers: { ...formData.drivers, interstate: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Intrastate</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-300 rounded-lg p-3"
                                    value={formData.drivers.intrastate}
                                    onChange={e => setFormData({ ...formData, drivers: { ...formData.drivers, intrastate: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Total CDL Holders</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-300 rounded-lg p-3"
                                    value={formData.drivers.cdl}
                                    onChange={e => setFormData({ ...formData, drivers: { ...formData.drivers, cdl: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. OPERATIONS & CLASSIFICATIONS (Conditional) */}
                {(selectedChanges.includes('operations') || selectedChanges.includes('op_class') || selectedChanges.includes('cargo_class') || selectedChanges.includes('hazmat')) && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[var(--color-navy)] transition-colors animate-in slide-in-from-bottom-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                            <h3 className="font-bold text-lg text-slate-800">Classifications</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Company Operations */}
                            {selectedChanges.includes('operations') && (
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">Company Operations</h4>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {[
                                            'Interstate',
                                            'Intrastate Only (HM)',
                                            'Intrastate Only (Non-HM)',
                                            'Interstate Hazmat Shipper',
                                            'Intrastate Non-Hazmat Shipper'
                                        ].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                    checked={formData.companyOperations?.includes(opt)}
                                                    onChange={(e) => {
                                                        const current = formData.companyOperations || [];
                                                        const updated = e.target.checked
                                                            ? [...current, opt]
                                                            : current.filter(x => x !== opt);
                                                        setFormData({ ...formData, companyOperations: updated });
                                                    }}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Operation Classifications */}
                            {selectedChanges.includes('op_class') && (
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">Operation Classifications</h4>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {[
                                            'Authorized For Hire', 'Exempt For Hire', 'Private (Property)', 'Private (Passengers, Business)',
                                            'Private (Passengers, Non-Business)', 'Migrant', 'U.S. Mail', 'Federal Government',
                                            'State Government', 'Local Government', 'Indian Tribe'
                                        ].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                    checked={formData.classifications?.operations?.includes(opt)}
                                                    onChange={(e) => {
                                                        const current = formData.classifications?.operations || [];
                                                        const updated = e.target.checked
                                                            ? [...current, opt]
                                                            : current.filter(x => x !== opt);
                                                        setFormData({ ...formData, classifications: { ...formData.classifications, operations: updated } });
                                                    }}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cargo Classifications */}
                            {selectedChanges.includes('cargo_class') && (
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">Cargo Classifications</h4>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {[
                                            'General Freight', 'Household Goods', 'Metal: sheets, coils, rolls', 'Motor Vehicles',
                                            'Drive/Tow away', 'Logs, Poles, Beams, Lumber', 'Building Materials', 'Mobile Homes',
                                            'Machinery, Large Objects', 'Fresh Produce', 'Liquids/Gases', 'Intermodal Cont.',
                                            'Passengers', 'Oilfield Equipment', 'Livestock', 'Grain, Feed, Hay',
                                            'Coal/Coke', 'Meat', 'Garbage/Refuse', 'US Mail',
                                            'Chemicals', 'Commodities Dry Bulk', 'Refrigerated Food', 'Beverages',
                                            'Paper Products', 'Utilities', 'Agricultural/Farm Supplies', 'Construction', 'Water Well'
                                        ].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                    checked={formData.classifications?.cargo?.includes(opt)}
                                                    onChange={(e) => {
                                                        const current = formData.classifications?.cargo || [];
                                                        const updated = e.target.checked
                                                            ? [...current, opt]
                                                            : current.filter(x => x !== opt);
                                                        setFormData({ ...formData, classifications: { ...formData.classifications, cargo: updated } });
                                                    }}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hazardous Materials - Detailed Matrix */}
                            {selectedChanges.includes('hazmat') && (
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3 border-b pb-1">Hazardous Materials</h4>
                                    <div className="space-y-4">
                                        <div className="text-xs text-slate-500 mb-2">
                                            Select Carrier/Shipper and Bulk/Non-Bulk for each material type.
                                        </div>
                                        {[
                                            'Div 1.1 Explosives (Mass Explosion)',
                                            'Div 1.2 Explosives (Projection Hazard)',
                                            'Div 1.3 Explosives (Fire Hazard)',
                                            'Div 1.4 Explosives (Minor Blast)',
                                            'Div 1.5 Very Insensitive Explosives',
                                            'Div 1.6 Extremely Insensitive',
                                            'Div 2.1 Flammable Gas', 'Div 2.1 LPG', 'Div 2.1 Methane',
                                            'Div 2.2 Non-Flammable Gas',
                                            'Div 2.3 Poisonous Gas',
                                            'Div 2.3 A (Poison Gas Zone A)', 'Div 2.3 B (Poison Gas Zone B)',
                                            'Div 2.3 C (Poison Gas Zone C)', 'Div 2.3 D (Poison Gas Zone D)',
                                            'Div 3 Flammable Liquid',
                                            'Combustible Liquid',
                                            'Div 4.1 Flammable Solid',
                                            'Div 4.2 Spontaneously Combustible',
                                            'Div 4.3 Dangerous When Wet',
                                            'Div 5.1 Oxidizer', 'Div 5.2 Organic Peroxide',
                                            'Div 6.1 Poison (Liquid/Solid)',
                                            'Div 6.1 A (Poison Liquid Zone A)', 'Div 6.1 B (Poison Liquid Zone B)',
                                            'Div 6.2 Infectious Substance',
                                            'Class 7 Radioactive', 'HRCQ',
                                            'Div 8 Corrosive', 'Class 8 A (Corrosive Liquid Zone A)', 'Class 8 B (Corrosive Liquid Zone B)',
                                            'Div 9 Miscellaneous Hazardous Materials',
                                            'Elevated Temperature Material', 'Infectious Waste', 'Marine Pollutants',
                                            'Hazardous Substances (RQ)', 'Hazardous Waste', 'ORM'
                                        ].map(material => {
                                            const selections = formData.classifications?.hazmat?.[material] || [];
                                            return (
                                                <div key={material} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                                                    <div className="font-semibold text-sm text-slate-800 mb-2">{material}</div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Carrier', 'Shipper', 'Bulk', 'Non-Bulk'].map(type => (
                                                            <label key={type} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                                                                    checked={selections.includes(type)}
                                                                    onChange={(e) => {
                                                                        const current = formData.classifications?.hazmat?.[material] || [];
                                                                        const updated = e.target.checked
                                                                            ? [...current, type]
                                                                            : current.filter(t => t !== type);

                                                                        setFormData({
                                                                            ...formData,
                                                                            classifications: {
                                                                                ...formData.classifications,
                                                                                hazmat: {
                                                                                    ...formData.classifications.hazmat,
                                                                                    [material]: updated
                                                                                }
                                                                            }
                                                                        });
                                                                    }}
                                                                />
                                                                {type}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 6. SIGNATURE (Always Required) */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 border-b pb-2">Certification & Signature</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Name of Official <span className="text-red-500">*</span></label>
                            <input
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent"
                                placeholder="Full Legal Name"
                                value={formData.companyOfficial?.name || ''}
                                onChange={e => setFormData({ ...formData, companyOfficial: { ...(formData.companyOfficial || {}), name: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Title <span className="text-red-500">*</span></label>
                            <input
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent"
                                placeholder="e.g. Owner, President, Partner"
                                value={formData.companyOfficial?.title || ''}
                                onChange={e => setFormData({ ...formData, companyOfficial: { ...(formData.companyOfficial || {}), title: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-[var(--color-navy)]" />
                        <span>By typing your name, you certify that the information provided is true and correct to the best of your knowledge.</span>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button className="border border-[var(--color-navy)] text-[var(--color-navy)] py-2 px-6 rounded-lg font-bold hover:bg-slate-50 transition" onClick={() => setCurrentStep(3)}>Go Back</button>
                    <button
                        disabled={!formData.mileage || !formData.companyOfficial?.name || !formData.companyOfficial?.title}
                        className="bg-[var(--color-navy)] text-white py-3 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50 transition shadow-lg hover:shadow-xl transform active:scale-95"
                        onClick={() => setCurrentStep(5)}
                    >
                        Continue to PIN <ChevronRight className="inline w-4 h-4" />
                    </button>
                </div>
            </div >
        );
    };

    // Step 5: Submission Method / PIN
    const renderStep5 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Select the method of submission</h2>

            <div className="space-y-6">
                {/* Option 1: File with PIN */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition ${submissionMethod === 'enter_pin' ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)]'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${submissionMethod === 'enter_pin' ? 'border-[var(--color-navy)]' : 'border-[var(--color-border)]'}`}>
                            {submissionMethod === 'enter_pin' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-navy)]" />}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[var(--color-text)] mb-1">File with USDOT PIN</div>
                            <div className="text-sm text-[var(--color-muted)] mb-4">Enter the PIN associated with your USDOT number.</div>

                            {submissionMethod === 'enter_pin' && (
                                <div className="animate-in fade-in">
                                    <label className="block text-xs font-bold mb-1">Enter your USDOT PIN</label>
                                    <input
                                        className="w-full max-w-sm border border-red-200 rounded p-3 text-slate-900 placeholder:text-slate-300"
                                        placeholder="USDOT PIN, example 1A23BC4D"
                                        value={pin}
                                        onChange={e => setPin(e.target.value)}
                                    />
                                    <div className="text-xs text-red-500 mt-1 italic">Please enter the USDOT PIN.</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <input type="radio" value="enter_pin" checked={submissionMethod === 'enter_pin'} onChange={() => setSubmissionMethod('enter_pin')} className="hidden" />
                </label>

                {/* Option 2: Request New PIN - DISABLED */}
                <label className={`block p-4 rounded-lg border-2 cursor-not-allowed transition opacity-50 ${submissionMethod === 'request_pin' ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)]'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${submissionMethod === 'request_pin' ? 'border-[var(--color-navy)]' : 'border-[var(--color-border)]'}`}>
                            {submissionMethod === 'request_pin' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-navy)]" />}
                        </div>
                        <div>
                            <div className="font-bold text-[var(--color-text)]">Generate a new PIN (+ $20.00)</div>
                            <div className="text-sm text-[var(--color-muted)]">Don't have it handy? We can request a new PIN for you.</div>
                            <div className="text-xs text-red-500 mt-1 italic">Currently disabled</div>
                        </div>
                    </div>
                    <input type="radio" value="request_pin" checked={submissionMethod === 'request_pin'} onChange={() => { }} disabled className="hidden" />
                </label>

                {/* Option 3: Upload Driver License */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition ${submissionMethod === 'upload_driver_license' ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)]'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${submissionMethod === 'upload_driver_license' ? 'border-[var(--color-navy)]' : 'border-[var(--color-border)]'}`}>
                            {submissionMethod === 'upload_driver_license' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-navy)]" />}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[var(--color-text)] mb-1">Upload Driver License</div>
                            <div className="text-sm text-[var(--color-muted)] mb-4">Upload your driver license and sign the form digitally.</div>

                            {submissionMethod === 'upload_driver_license' && (
                                <div className="animate-in fade-in space-y-4 mt-4">
                                    {/* Driver License Upload */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1">
                                            Upload Driver License: <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setDriverLicenseFile(file);
                                                    }
                                                }}
                                                className="hidden"
                                                id="driver-license-upload"
                                            />
                                            <label
                                                htmlFor="driver-license-upload"
                                                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                                            >
                                                <Upload className="w-5 h-5 text-slate-500" />
                                                <span className="text-sm text-slate-700">
                                                    {driverLicenseFile ? driverLicenseFile.name : 'Choose File'}
                                                </span>
                                            </label>
                                        </div>
                                        {driverLicenseFile && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDriverLicenseFile(null);
                                                    const input = document.getElementById('driver-license-upload');
                                                    if (input) input.value = '';
                                                }}
                                                className="mt-2 text-xs text-red-600 hover:underline flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" />
                                                Remove file
                                            </button>
                                        )}
                                    </div>

                                    {/* Signature */}
                                    <div>
                                        <label className="block text-xs font-bold mb-1">
                                            Signature: <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-slate-300 rounded-lg p-2 bg-white">
                                            <SignatureCanvas
                                                ref={sigCanvasRef}
                                                canvasProps={{
                                                    width: 600,
                                                    height: 200,
                                                    className: 'signature-canvas w-full border border-slate-200 rounded cursor-crosshair'
                                                }}
                                                backgroundColor="white"
                                                onEnd={() => {
                                                    if (sigCanvasRef.current) {
                                                        setSignatureCanvas(sigCanvasRef.current.toDataURL());
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    if (sigCanvasRef.current) {
                                                        sigCanvasRef.current.clear();
                                                        setSignatureCanvas(null);
                                                    }
                                                }}
                                                className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 transition"
                                            >
                                                Clear
                                            </button>
                                            <span className="text-xs text-slate-500 self-center">Draw with mouse or finger</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <input type="radio" value="upload_driver_license" checked={submissionMethod === 'upload_driver_license'} onChange={() => setSubmissionMethod('upload_driver_license')} className="hidden" />
                </label>
            </div>

            <div className="flex gap-4 pt-6">
                <button className="border border-[var(--color-navy)] text-[var(--color-navy)] py-2 px-6 rounded-lg font-bold" onClick={() => setCurrentStep(4)}>Go Back</button>
                <button
                    onClick={async () => {
                        if (submissionMethod === 'upload_driver_license') {
                            // Process PDF generation before proceeding to payment
                            await handleProcessPdf();
                        } else {
                            // For PIN methods, go directly to payment
                            setCurrentStep(6);
                        }
                    }}
                    disabled={
                        processingPdf ||
                        (submissionMethod === 'enter_pin' && !pin) ||
                        (submissionMethod === 'upload_driver_license' && (!driverLicenseFile || !signatureCanvas))
                    }
                    className="bg-[var(--color-navy)] text-white py-2 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50 flex items-center gap-2"
                >
                    {processingPdf ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" />
                            Processing PDF...
                        </>
                    ) : (
                        <>
                            Continue Filing <ChevronRight className="inline w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {pdfError && (
                <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {pdfError}
                </div>
            )}
        </div>
    );

    // Step 6: Checkout
    const renderStep6 = () => {
        const needPin = submissionMethod === 'request_pin';
        const price = 49 + (needPin ? 20 : 0);

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold">Pay Service Fee</h2>
                <p className="text-slate-600">Please select the method to complete the transaction for filing this form MCS-150.</p>

                <div className="grid md:grid-cols-[1fr_300px] gap-8">
                    {/* Left: Payment Method */}
                    <div className="space-y-6">
                        <StripeWrapper
                            amount={price}
                            metadata={{
                                filingType: 'mcs150',
                                userId: user.uid,
                                filingId: filingId,
                                submissionId: pdfSubmissionId,
                                usdotNumber: formData.usdotNumber
                            }}
                            onSuccess={(paymentIntent) => {
                                console.log('Payment Succeeded:', paymentIntent);
                                setCurrentStep(7); // Go directly to success step as webhook handles status
                            }}
                            onCancel={() => setCurrentStep(5)}
                        />
                    </div>


                    {/* Right: Summary */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                        <h3 className="font-bold text-slate-900 border-b pb-2 mb-4">Service Fee Summary</h3>
                        <div className="space-y-2 text-sm text-slate-700">
                            <div className="flex justify-between">
                                <span>Service Fee:</span>
                                <span className="font-bold">${price.toFixed(2)}</span>
                            </div>
                            {needPin && (
                                <div className="text-xs text-orange-600">Includes PIN Retrieval</div>
                            )}
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-bold">Total:</span>
                                <span className="font-bold text-lg">${price.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6 bg-slate-200/50 p-2 rounded text-center text-xs text-slate-500">
                            Secure Payment via Stripe
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Step 7: Success
    const renderStep7 = () => (
        <div className="py-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-[#0F766E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-100">
                <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Success! We've Started Preparing Your MCS-150 Filing!</h1>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl my-8 text-left flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-orange-200 shrink-0">
                    <User className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-sm text-orange-900">
                    We will reach out to you for your driver's license or you can email us a copy of your driver's license at <span className="font-bold underline">support@quicktrucktax.com</span>. The FMCSA requires your driver's license along with the MCS-150 filing for verification.
                </div>
            </div>

            <h3 className="font-bold text-lg mb-8">Next Steps</h3>

            <div className="relative flex justify-between items-start max-w-xl mx-auto mb-12">
                {/* Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-teal-100 -z-10"></div>

                <div className="flex flex-col items-center w-1/3">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0F766E] text-[#0F766E] font-bold flex items-center justify-center mb-2">1</div>
                    <div className="font-bold text-sm mb-1">Submitted to the FMCSA</div>
                    <div className="text-xs text-slate-500 max-w-[120px]">Your MCS-150 filing is submitted to the FMCSA.</div>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0F766E] text-[#0F766E] font-bold flex items-center justify-center mb-2">2</div>
                    <div className="font-bold text-sm mb-1">Processed by the FMCSA</div>
                    <div className="text-xs text-slate-500 max-w-[120px]">Your filing is processed. It may take upto 7 working days.</div>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0F766E] text-[#0F766E] font-bold flex items-center justify-center mb-2">3</div>
                    <div className="font-bold text-sm mb-1">Accepted by the FMCSA</div>
                    <div className="text-xs text-slate-500 max-w-[120px]">Your filing is acknowledged and updated on SAFER.</div>
                </div>
            </div>

            <button
                onClick={() => router.push('/dashboard')}
                className="bg-[#0F766E] text-white py-3 px-8 rounded-lg font-bold hover:bg-[#115E59]"
            >
                Go to Dashboard
            </button>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50/50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {currentStep < 7 ? (
                        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
                            {/* Left Sidebar - Hidden on Search Step */}
                            {currentStep > 0 && <Sidebar />}

                            {/* Main Content */}
                            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 ${currentStep === 0 ? 'col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                                <ProgressBar />

                                {/* Error Banner */}
                                {error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                {currentStep === 0 && renderStep0()}
                                {currentStep === 1 && renderStep1()}
                                {currentStep === 2 && renderStep2()}
                                {currentStep === 3 && renderStep3()}
                                {currentStep === 4 && renderStep4()}
                                {currentStep === 5 && renderStep5()}
                                {currentStep === 6 && renderStep6()}
                            </div>
                        </div>
                    ) : (
                        // Success View (Full Width)
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12">
                            {renderStep7()}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
