'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, createFiling } from '@/lib/db';
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
    Search
} from 'lucide-react';

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
        powerUnits: '',
        drivers: { total: '', cdl: '' }
    });

    // Submission Data
    const [submissionMethod, setSubmissionMethod] = useState('enter_pin'); // enter_pin, request_pin, manual_sign
    const [pin, setPin] = useState('');

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
            if (!res.ok) throw new Error('Carrier not found');
            const data = await res.json();

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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const needPin = submissionMethod === 'request_pin';
            const price = 49 + (needPin ? 20 : 0);

            // 1. Persist Business if not already saved (from API lookup)
            let businessId = selectedBusiness?.id;
            if (!businessId) {
                // Check if it already exists by USDOT to avoid duplicates (optional but good)
                // For now, simpler: Create it
                // We need to construct the full business object expected by createBusiness
                const newBiz = {
                    name: selectedBusiness.name,
                    ein: selectedBusiness.ein || '',
                    type: selectedBusiness.type || 'Corporation',
                    address: selectedBusiness.address ? `${selectedBusiness.address.street}, ${selectedBusiness.address.city}, ${selectedBusiness.address.state} ${selectedBusiness.address.zip}` : '',
                    // Split address if needed or store as string
                    usdot: formData.usdotNumber,
                    phone: formData.contact.phone,
                    email: formData.contact.email
                };

                // We assume createBusiness returns the ID. 
                // Note: db.js createBusiness implementation takes (userId, businessData)
                businessId = await createBusiness(user.uid, newBiz);
            }

            await createFiling({
                userId: user.uid,
                businessId: businessId,
                filingType: 'mcs150',
                status: 'submitted',
                mcs150Status: 'submitted',
                mcs150Price: price,
                mcs150Reason: filingReason,
                mcs150HasChanges: hasChanges,
                mcs150UsdotNumber: formData.usdotNumber,
                mcs150Pin: submissionMethod === 'enter_pin' ? pin : null,
                needPinService: needPin,
                companyOfficial: formData.companyOfficial,
                mcs150Data: {
                    mileage: formData.mileage,
                    mileageYear: formData.mileageYear,
                    powerUnits: formData.powerUnits,
                    drivers: formData.drivers,
                    method: submissionMethod
                },
                compliance: {
                    signature: formData.companyOfficial?.name,
                    date: new Date().toISOString()
                },
                paymentDetails: {
                    method: paymentMethod,
                    amount: price,
                    date: new Date().toISOString()
                }
            });
            setCurrentStep(7); // Go to success step
        } catch (err) {
            setError('Submission failed. Please try again.');
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

    // Step 3: Changes
    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Do you need to update any information?</h2>

            <div className="space-y-4">
                <label className={`block p-4 rounded-lg border-2 cursor-pointer ${hasChanges === false ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)]'}`}>
                    <div className="flex items-center gap-4">
                        <input type="radio" checked={hasChanges === false} onChange={() => setHasChanges(false)} className="w-5 h-5 text-[var(--color-navy)] accent-[var(--color-navy)]" />
                        <span className="font-bold text-[var(--color-text)]">No, all the information is the same as before.</span>
                    </div>
                </label>
                <label className={`block p-4 rounded-lg border-2 cursor-pointer ${hasChanges === true ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)]'}`}>
                    <div className="flex items-center gap-4">
                        <input type="radio" checked={hasChanges === true} onChange={() => setHasChanges(true)} className="w-5 h-5 text-[var(--color-navy)] accent-[var(--color-navy)]" />
                        <span className="font-bold text-[var(--color-text)]">Yes, there are some changes I wish to do before submitting.</span>
                    </div>
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <button className="border border-[var(--color-navy)] text-[var(--color-navy)] py-2 px-6 rounded-lg font-bold" onClick={() => setCurrentStep(2)}>Go Back</button>
                <button
                    disabled={hasChanges === null}
                    className="bg-[var(--color-navy)] text-white py-2 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50"
                    onClick={() => setCurrentStep(4)}
                >
                    Continue Filing <ChevronRight className="inline w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // Step 4: Review Data
    const renderStep4 = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Review & Complete Your MCS-150</h2>
                <p className="text-red-500 text-sm font-bold text-right">* Mandatory Fields</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold mb-1">Enter total miles driven in the last 12 months <span className="text-red-500">*</span></label>
                    <div className="text-xs text-slate-500 mb-2">Total miles driven by all vehicles</div>
                    <input
                        className="w-full border rounded p-3"
                        placeholder="e.g. 25000"
                        value={formData.mileage}
                        onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">EIN (Employer Identification Number) <span className="text-red-500">*</span></label>
                    <div className="text-xs text-[var(--color-muted)] mb-2">Associated with USDOT filing</div>
                    <input
                        className="w-full border rounded p-3"
                        placeholder="e.g. 12-3456789"
                        value={formData.ein || ''}
                        onChange={e => setFormData({ ...formData, ein: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold mb-1">Total Power Units <span className="text-red-500">*</span></label>
                    <div className="text-xs text-slate-500 mb-2">Trucks, Tractors, etc.</div>
                    <input
                        className="w-full border rounded p-3"
                        placeholder="e.g. 5"
                        value={formData.powerUnits}
                        onChange={e => setFormData({ ...formData, powerUnits: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Total Drivers <span className="text-red-500">*</span></label>
                    <div className="text-xs text-[var(--color-muted)] mb-2">Interstate & Intrastate</div>
                    <input
                        className="w-full border rounded p-3"
                        placeholder="e.g. 5"
                        value={formData.drivers?.total || ''}
                        onChange={e => setFormData({ ...formData, drivers: { ...(formData.drivers || {}), total: e.target.value } })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Total CDL Drivers <span className="text-red-500">*</span></label>
                    <div className="text-xs text-[var(--color-muted)] mb-2">With Commercial License</div>
                    <input
                        className="w-full border rounded p-3"
                        placeholder="e.g. 5"
                        value={formData.drivers?.cdl || ''}
                        onChange={e => setFormData({ ...formData, drivers: { ...(formData.drivers || {}), cdl: e.target.value } })}
                    />
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Enter the Details of a Company Official</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                            className="w-full border rounded p-3"
                            value={formData.companyOfficial?.name || ''}
                            onChange={e => setFormData({ ...formData, companyOfficial: { ...(formData.companyOfficial || {}), name: e.target.value } })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            className="w-full border rounded p-3"
                            placeholder="e.g. Owner, President"
                            value={formData.companyOfficial?.title || ''}
                            onChange={e => setFormData({ ...formData, companyOfficial: { ...(formData.companyOfficial || {}), title: e.target.value } })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button className="border border-[var(--color-navy)] text-[var(--color-navy)] py-2 px-6 rounded-lg font-bold" onClick={() => setCurrentStep(3)}>Go Back</button>
                <button
                    disabled={!formData.mileage || !formData.companyOfficial?.name || !formData.powerUnits || !formData.drivers?.total || !formData.ein}
                    className="bg-[var(--color-navy)] text-white py-2 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50"
                    onClick={() => setCurrentStep(5)}
                >
                    Continue Filing <ChevronRight className="inline w-4 h-4" />
                </button>
            </div>
        </div>
    );

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

                {/* Option 2: Request New PIN */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition ${submissionMethod === 'request_pin' ? 'border-[var(--color-navy)] bg-blue-50' : 'border-[var(--color-border)]'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${submissionMethod === 'request_pin' ? 'border-[var(--color-navy)]' : 'border-[var(--color-border)]'}`}>
                            {submissionMethod === 'request_pin' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-navy)]" />}
                        </div>
                        <div>
                            <div className="font-bold text-[var(--color-text)]">Generate a new PIN (+ $20.00)</div>
                            <div className="text-sm text-[var(--color-muted)]">Don't have it handy? We can request a new PIN for you.</div>
                        </div>
                    </div>
                    <input type="radio" value="request_pin" checked={submissionMethod === 'request_pin'} onChange={() => setSubmissionMethod('request_pin')} className="hidden" />
                </label>
            </div>

            <div className="flex gap-4 pt-6">
                <button className="border border-[var(--color-navy)] text-[var(--color-navy)] py-2 px-6 rounded-lg font-bold" onClick={() => setCurrentStep(4)}>Go Back</button>
                <button
                    onClick={() => setCurrentStep(6)}
                    disabled={submissionMethod === 'enter_pin' && !pin}
                    className="bg-[var(--color-navy)] text-white py-2 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50"
                >
                    Continue Filing <ChevronRight className="inline w-4 h-4" />
                </button>
            </div>
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
                        <label className="block text-sm font-bold">Select Payment Method <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`border p-4 rounded flex items-center gap-2 cursor-pointer ${paymentMethod === 'card' ? 'border-[#0F766E] bg-teal-50' : 'border-slate-200'}`}>
                                <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-[#0F766E]" />
                                <CreditCard className="w-5 h-5 text-slate-700" />
                                <span className="font-bold text-sm">Credit Card</span>
                            </label>
                            <label className={`border p-4 rounded flex items-center gap-2 cursor-pointer ${paymentMethod === 'google_pay' ? 'border-[#0F766E] bg-teal-50' : 'border-slate-200'}`}>
                                <input type="radio" checked={paymentMethod === 'google_pay'} onChange={() => setPaymentMethod('google_pay')} className="w-4 h-4 text-[#0F766E]" />
                                <span className="font-bold text-sm">Google Pay</span>
                            </label>
                        </div>

                        {/* Mock Card Form */}
                        <div className="border rounded-lg p-6 space-y-4 bg-white">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold mb-1">Enter Card Number <span className="text-red-500">*</span></label>
                                    <input className="w-full border rounded p-2" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold mb-1">Expires On <span className="text-red-500">*</span></label>
                                    <input className="w-full border rounded p-2" placeholder="MM/YY" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold mb-1">Cardholder's Name <span className="text-red-500">*</span></label>
                                    <input className="w-full border rounded p-2" placeholder="Name on Card" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold mb-1">CVV Number <span className="text-red-500">*</span></label>
                                    <input className="w-full border rounded p-2" placeholder="123" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button className="border border-[#0F766E] text-[#0F766E] py-2 px-6 rounded-lg font-bold" onClick={() => setCurrentStep(5)}>Go Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-[#0F766E] text-white py-2 px-8 rounded-lg font-bold hover:bg-[#115E59] disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                Pay & Finish <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
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
                    We will reach out to you for your driver's license or you can email us a copy of your driver's license at <span className="font-bold underline">support@trucktax.com</span>. The FMCSA requires your driver's license along with the MCS-150 filing for verification.
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
