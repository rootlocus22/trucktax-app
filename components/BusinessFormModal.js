'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import {
    validateBusinessName,
    validateEIN,
    formatEIN,
    validateAddress,
    validatePhone,
    validateCity,
    validateState,
    validateZip,
    validateCountry,
    validatePIN
} from '@/lib/validation';

/**
 * Reusable Business Form Modal Component
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onSubmit - Callback when form is submitted (receives business data)
 * @param {object} initialBusiness - Initial business data (for editing or pre-populating)
 * @param {boolean} loading - Whether form submission is in progress
 * @param {string} submitButtonText - Text for submit button (default: "Add Business")
 * @param {string} title - Modal title (default: "Add New Business")
 * @param {object} externalErrors - Errors passed from parent
 */
export default function BusinessFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialBusiness = null,
    loading = false,
    submitButtonText = 'Add Business',
    title = 'Add New Business',
    externalErrors = {}
}) {
    const [business, setBusiness] = useState({
        businessName: '',
        ein: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States of America',
        phone: '',
        signingAuthorityName: '',
        signingAuthorityPhone: '',
        signingAuthorityPIN: '',
        hasThirdPartyDesignee: false,
        thirdPartyDesigneeName: '',
        thirdPartyDesigneePhone: '',
        thirdPartyDesigneePIN: ''
    });
    const [errors, setErrors] = useState({});
    const errorRef = useRef(null);

    // Scroll to top when error occurs
    useEffect(() => {
        const hasError = Object.keys(errors).length > 0;
        if (hasError && errorRef.current && isOpen) {
            setTimeout(() => {
                const element = errorRef.current;
                if (element) {
                    const modalContainer = element.closest('.overflow-y-auto');
                    if (modalContainer) {
                        const elementTop = element.getBoundingClientRect().top;
                        const containerTop = modalContainer.getBoundingClientRect().top;
                        const offset = 20;
                        modalContainer.scrollTo({
                            top: modalContainer.scrollTop + (elementTop - containerTop) - offset,
                            behavior: 'smooth'
                        });
                    } else {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 150);
        }
    }, [errors, isOpen]);

    // Initialize form
    useEffect(() => {
        if (isOpen) {
            if (initialBusiness) {
                setBusiness({
                    businessName: initialBusiness.businessName || initialBusiness.name || '',
                    ein: initialBusiness.ein || '',
                    address: initialBusiness.address || '',
                    city: initialBusiness.city || '',
                    state: (initialBusiness.state || '').toUpperCase().trim(),
                    zip: initialBusiness.zip || '',
                    country: initialBusiness.country || 'United States of America',
                    phone: initialBusiness.phone || '',
                    signingAuthorityName: initialBusiness.signingAuthorityName || '',
                    signingAuthorityPhone: initialBusiness.signingAuthorityPhone || '',
                    signingAuthorityPIN: initialBusiness.signingAuthorityPIN || '',
                    hasThirdPartyDesignee: initialBusiness.hasThirdPartyDesignee || false,
                    thirdPartyDesigneeName: initialBusiness.thirdPartyDesigneeName || '',
                    thirdPartyDesigneePhone: initialBusiness.thirdPartyDesigneePhone || '',
                    thirdPartyDesigneePIN: initialBusiness.thirdPartyDesigneePIN || ''
                });
            } else {
                setBusiness({
                    businessName: '',
                    ein: '',
                    address: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'United States of America',
                    phone: '',
                    signingAuthorityName: '',
                    signingAuthorityPhone: '',
                    signingAuthorityPIN: '',
                    hasThirdPartyDesignee: false,
                    thirdPartyDesigneeName: '',
                    thirdPartyDesigneePhone: '',
                    thirdPartyDesigneePIN: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, initialBusiness]);

    // Merge external errors
    useEffect(() => {
        if (Object.keys(externalErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...externalErrors }));
        }
    }, [externalErrors]);

    const handleChange = (field, value) => {
        let formattedValue = value;

        if (field === 'ein') {
            formattedValue = formatEIN(value);
        } else if (field === 'zip') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 5) {
                formattedValue = formattedValue.slice(0, 5) + '-' + formattedValue.slice(5, 9);
            }
        } else if (field === 'state') {
            formattedValue = value.toUpperCase().trim();
        } else if (['phone', 'signingAuthorityPhone', 'thirdPartyDesigneePhone'].includes(field)) {
            const cleanPhone = value.replace(/\D/g, '');
            if (cleanPhone.length <= 3) {
                formattedValue = cleanPhone;
            } else if (cleanPhone.length <= 6) {
                formattedValue = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3)}`;
            } else if (cleanPhone.length <= 10) {
                formattedValue = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 10)}`;
            } else {
                formattedValue = `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7, 11)}`;
            }
        } else if (['signingAuthorityPIN', 'thirdPartyDesigneePIN'].includes(field)) {
            formattedValue = value.replace(/\D/g, '').slice(0, 5);
        }

        setBusiness(prev => ({ ...prev, [field]: formattedValue }));

        // Validation
        let validation = { isValid: true, error: '' };
        if (field === 'businessName') validation = validateBusinessName(formattedValue);
        else if (field === 'ein') validation = validateEIN(formattedValue);
        else if (field === 'address') validation = validateAddress(formattedValue, true);
        else if (field === 'city') validation = validateCity(formattedValue, true);
        else if (field === 'state') validation = validateState(formattedValue, true);
        else if (field === 'zip') validation = validateZip(formattedValue, true);
        else if (field === 'phone') validation = validatePhone(formattedValue, true);
        else if (field === 'signingAuthorityName') {
            validation = formattedValue && formattedValue.trim().length >= 2
                ? { isValid: true, error: '' }
                : { isValid: false, error: 'Signing Authority Name is required and must be at least 2 characters' };
        }
        else if (field === 'signingAuthorityPhone') validation = validatePhone(formattedValue, true);
        else if (field === 'signingAuthorityPIN') validation = validatePIN(formattedValue, true);
        else if (field === 'thirdPartyDesigneeName') {
            validation = business.hasThirdPartyDesignee
                ? (formattedValue && formattedValue.trim().length >= 2
                    ? { isValid: true, error: '' }
                    : { isValid: false, error: 'Name is required' })
                : { isValid: true, error: '' };
        }
        else if (field === 'thirdPartyDesigneePhone') validation = validatePhone(formattedValue, business.hasThirdPartyDesignee);
        else if (field === 'thirdPartyDesigneePIN') validation = validatePIN(formattedValue, business.hasThirdPartyDesignee);

        setErrors(prev => ({ ...prev, [field]: validation.isValid ? '' : validation.error }));
    };

    const handleSubmit = () => {
        const newErrors = {};

        // Core validations
        const nameVal = validateBusinessName(business.businessName);
        if (!nameVal.isValid) newErrors.businessName = nameVal.error;

        const einVal = validateEIN(business.ein);
        if (!einVal.isValid) newErrors.ein = einVal.error;

        const addrVal = validateAddress(business.address, true);
        if (!addrVal.isValid) newErrors.address = addrVal.error;

        const cityVal = validateCity(business.city, true);
        if (!cityVal.isValid) newErrors.city = cityVal.error;

        const stateVal = validateState(business.state, true);
        if (!stateVal.isValid) newErrors.state = stateVal.error;

        const zipVal = validateZip(business.zip, true);
        if (!zipVal.isValid) newErrors.zip = zipVal.error;

        const phoneVal = validatePhone(business.phone, true);
        if (!phoneVal.isValid) newErrors.phone = phoneVal.error;

        if (!business.signingAuthorityName || business.signingAuthorityName.trim().length < 2) {
            newErrors.signingAuthorityName = 'Signing Authority Name is required';
        }

        const saPhoneVal = validatePhone(business.signingAuthorityPhone, true);
        if (!saPhoneVal.isValid) newErrors.signingAuthorityPhone = saPhoneVal.error;

        const saPinVal = validatePIN(business.signingAuthorityPIN, true);
        if (!saPinVal.isValid) newErrors.signingAuthorityPIN = saPinVal.error;

        if (business.hasThirdPartyDesignee) {
            if (!business.thirdPartyDesigneeName || business.thirdPartyDesigneeName.trim().length < 2) {
                newErrors.thirdPartyDesigneeName = 'Name is required';
            }
            const tpdPhoneVal = validatePhone(business.thirdPartyDesigneePhone, true);
            if (!tpdPhoneVal.isValid) newErrors.thirdPartyDesigneePhone = tpdPhoneVal.error;
            const tpdPinVal = validatePIN(business.thirdPartyDesigneePIN, true);
            if (!tpdPinVal.isValid) newErrors.thirdPartyDesigneePIN = tpdPinVal.error;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(business);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto" onClick={() => !loading && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-2 border-b">
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div ref={errorRef}>
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{errors.general}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business Name */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Business Name <span className="text-[#14b8a6]">*</span>
                            </label>
                            <div className="group relative">
                                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-20">
                                    <strong>IRS Rule:</strong> Only letters, numbers, spaces, "&" and "-" are allowed.
                                </div>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={business.businessName}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.businessName ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="ABC Trucking LLC"
                        />
                        {errors.businessName && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.businessName}</p>
                        )}
                    </div>

                    {/* EIN */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            EIN (Employer Identification Number) <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="text"
                            value={business.ein}
                            onChange={(e) => handleChange('ein', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all font-mono ${errors.ein ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="12-3456789"
                            maxLength="10"
                        />
                        {errors.ein && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.ein}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Business Address <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="text"
                            value={business.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.address ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="123 Main St"
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.address}</p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            City <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="text"
                            value={business.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.city ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="Los Angeles"
                        />
                        {errors.city && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.city}</p>
                        )}
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            State <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="text"
                            value={business.state}
                            onChange={(e) => handleChange('state', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all uppercase ${errors.state ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="CA"
                            maxLength="2"
                        />
                        {errors.state && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.state}</p>
                        )}
                    </div>

                    {/* ZIP */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ZIP Code <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="text"
                            value={business.zip}
                            onChange={(e) => handleChange('zip', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all font-mono ${errors.zip ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="12345"
                            maxLength="10"
                        />
                        {errors.zip && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.zip}</p>
                        )}
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Country <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="text"
                            value={business.country}
                            readOnly
                            disabled
                            className="w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                            placeholder="United States of America"
                        />
                        <p className="mt-1 text-xs text-slate-500">Only US entities supported</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone <span className="text-[#14b8a6]">*</span>
                        </label>
                        <input
                            type="tel"
                            value={business.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="(555) 123-4567"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>
                        )}
                    </div>

                    {/* Signing Authority */}
                    <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            Signing Authority
                            <div className="group relative">
                                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                                <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-20">
                                    Authorized individual to sign Form 2290.
                                </div>
                            </div>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={business.signingAuthorityName}
                                    onChange={(e) => handleChange('signingAuthorityName', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.signingAuthorityName ? 'border-red-500' : 'border-slate-200'}`}
                                    placeholder="John Doe"
                                />
                                {errors.signingAuthorityName && <p className="mt-1 text-xs text-red-600">{errors.signingAuthorityName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone *</label>
                                <input
                                    type="tel"
                                    value={business.signingAuthorityPhone}
                                    onChange={(e) => handleChange('signingAuthorityPhone', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.signingAuthorityPhone ? 'border-red-500' : 'border-slate-200'}`}
                                    placeholder="(555) 123-4567"
                                />
                                {errors.signingAuthorityPhone && <p className="mt-1 text-xs text-red-600">{errors.signingAuthorityPhone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">5-Digit PIN *</label>
                                <input
                                    type="text"
                                    value={business.signingAuthorityPIN}
                                    onChange={(e) => handleChange('signingAuthorityPIN', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all font-mono ${errors.signingAuthorityPIN ? 'border-red-500' : 'border-slate-200'}`}
                                    placeholder="12345"
                                    maxLength="5"
                                />
                                {errors.signingAuthorityPIN && <p className="mt-1 text-xs text-red-600">{errors.signingAuthorityPIN}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Third Party Designee */}
                    <div className="md:col-span-2 border-t border-slate-100 pt-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Authorize a Third Party Designee?
                        </label>
                        <div className="flex gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setBusiness({ ...business, hasThirdPartyDesignee: false, thirdPartyDesigneeName: '', thirdPartyDesigneePhone: '', thirdPartyDesigneePIN: '' })}
                                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 transition-all ${!business.hasThirdPartyDesignee ? 'border-[#14b8a6] bg-teal-50 text-[#14b8a6]' : 'border-slate-100 text-slate-400'}`}
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={() => setBusiness({ ...business, hasThirdPartyDesignee: true })}
                                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 transition-all ${business.hasThirdPartyDesignee ? 'border-[#14b8a6] bg-teal-50 text-[#14b8a6]' : 'border-slate-100 text-slate-400'}`}
                            >
                                Yes
                            </button>
                        </div>

                        {business.hasThirdPartyDesignee && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={business.thirdPartyDesigneeName}
                                        onChange={(e) => handleChange('thirdPartyDesigneeName', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.thirdPartyDesigneeName ? 'border-red-500' : 'border-white'}`}
                                        placeholder="Jane Doe"
                                    />
                                    {errors.thirdPartyDesigneeName && <p className="mt-1 text-xs text-red-600">{errors.thirdPartyDesigneeName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        value={business.thirdPartyDesigneePhone}
                                        onChange={(e) => handleChange('thirdPartyDesigneePhone', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all ${errors.thirdPartyDesigneePhone ? 'border-red-500' : 'border-white'}`}
                                        placeholder="(555) 123-4567"
                                    />
                                    {errors.thirdPartyDesigneePhone && <p className="mt-1 text-xs text-red-600">{errors.thirdPartyDesigneePhone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">5-Digit PIN *</label>
                                    <input
                                        type="text"
                                        value={business.thirdPartyDesigneePIN}
                                        onChange={(e) => handleChange('thirdPartyDesigneePIN', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all font-mono ${errors.thirdPartyDesigneePIN ? 'border-red-500' : 'border-white'}`}
                                        placeholder="12345"
                                        maxLength="5"
                                    />
                                    {errors.thirdPartyDesigneePIN && <p className="mt-1 text-xs text-red-600">{errors.thirdPartyDesigneePIN}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-[#14b8a6] text-white rounded-xl font-bold hover:bg-[#0d9488] transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            submitButtonText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
