'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { validateVIN } from '@/lib/validation';

// Tax rate mappings
const TAX_RATES_NON_LOGGING = {
  'A': 100.00, 'B': 122.00, 'C': 144.00, 'D': 166.00, 'E': 188.00,
  'F': 210.00, 'G': 232.00, 'H': 254.00, 'I': 276.00, 'J': 298.00,
  'K': 320.00, 'L': 342.00, 'M': 364.00, 'N': 386.00, 'O': 408.00,
  'P': 430.00, 'Q': 452.00, 'R': 474.00, 'S': 496.00, 'T': 518.00,
  'U': 540.00, 'V': 550.00, 'W': 550.00
};

const TAX_RATES_LOGGING = {
  'A': 75.00, 'B': 91.50, 'C': 108.00, 'D': 124.50, 'E': 141.00,
  'F': 157.50, 'G': 174.00, 'H': 190.50, 'I': 207.00, 'J': 223.50,
  'K': 240.00, 'L': 256.50, 'M': 273.00, 'N': 289.50, 'O': 306.00,
  'P': 322.50, 'Q': 339.00, 'R': 355.50, 'S': 372.00, 'T': 388.50,
  'U': 405.00, 'V': 412.50, 'W': 412.50
};

// Vehicle type options
const vehicleTypes = [
  { value: 'taxable', label: 'Taxable Vehicle' },
  { value: 'suspended', label: 'Suspended Vehicle' },
  { value: 'credit', label: 'Credit Vehicle' },
  { value: 'priorYearSold', label: 'Prior Year Sold Suspended Vehicle' }
];

// Credit reason options
const creditReasons = [
  { value: 'sold', label: 'Sold' },
  { value: 'stolen', label: 'Stolen' },
  { value: 'destroyed', label: 'Destroyed' },
  { value: 'lowMileage', label: 'Low Mileage' }
];

// Helper function to format currency with 2 decimal places
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to get weight category options with pricing
const getWeightCategoryOptions = (isLogging) => {
  const taxRates = isLogging === true ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
  const loggingText = isLogging === true ? ' (Logging)' : isLogging === false ? ' (Non-Logging)' : '';

  return [
    { value: 'A', label: `A - 55,000 lbs${loggingText} - ${formatCurrency(taxRates['A'])}` },
    { value: 'B', label: `B - 55,001 - 56,000 lbs${loggingText} - ${formatCurrency(taxRates['B'])}` },
    { value: 'C', label: `C - 56,001 - 57,000 lbs${loggingText} - ${formatCurrency(taxRates['C'])}` },
    { value: 'D', label: `D - 57,001 - 58,000 lbs${loggingText} - ${formatCurrency(taxRates['D'])}` },
    { value: 'E', label: `E - 58,001 - 59,000 lbs${loggingText} - ${formatCurrency(taxRates['E'])}` },
    { value: 'F', label: `F - 59,001 - 60,000 lbs${loggingText} - ${formatCurrency(taxRates['F'])}` },
    { value: 'G', label: `G - 60,001 - 61,000 lbs${loggingText} - ${formatCurrency(taxRates['G'])}` },
    { value: 'H', label: `H - 61,001 - 62,000 lbs${loggingText} - ${formatCurrency(taxRates['H'])}` },
    { value: 'I', label: `I - 62,001 - 63,000 lbs${loggingText} - ${formatCurrency(taxRates['I'])}` },
    { value: 'J', label: `J - 63,001 - 64,000 lbs${loggingText} - ${formatCurrency(taxRates['J'])}` },
    { value: 'K', label: `K - 64,001 - 65,000 lbs${loggingText} - ${formatCurrency(taxRates['K'])}` },
    { value: 'L', label: `L - 65,001 - 66,000 lbs${loggingText} - ${formatCurrency(taxRates['L'])}` },
    { value: 'M', label: `M - 66,001 - 67,000 lbs${loggingText} - ${formatCurrency(taxRates['M'])}` },
    { value: 'N', label: `N - 67,001 - 68,000 lbs${loggingText} - ${formatCurrency(taxRates['N'])}` },
    { value: 'O', label: `O - 68,001 - 69,000 lbs${loggingText} - ${formatCurrency(taxRates['O'])}` },
    { value: 'P', label: `P - 69,001 - 70,000 lbs${loggingText} - ${formatCurrency(taxRates['P'])}` },
    { value: 'Q', label: `Q - 70,001 - 71,000 lbs${loggingText} - ${formatCurrency(taxRates['Q'])}` },
    { value: 'R', label: `R - 71,001 - 72,000 lbs${loggingText} - ${formatCurrency(taxRates['R'])}` },
    { value: 'S', label: `S - 72,001 - 73,000 lbs${loggingText} - ${formatCurrency(taxRates['S'])}` },
    { value: 'T', label: `T - 73,001 - 74,000 lbs${loggingText} - ${formatCurrency(taxRates['T'])}` },
    { value: 'U', label: `U - 74,001 - 75,000 lbs${loggingText} - ${formatCurrency(taxRates['U'])}` },
    { value: 'V', label: `V - More than 75,000 lbs${loggingText} - ${formatCurrency(taxRates['V'])}` }
  ];
};

const getWeightCategoryWLabel = (isLogging) => {
  const taxRates = isLogging === true ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
  const loggingText = isLogging === true ? ' (Logging)' : isLogging === false ? ' (Non-Logging)' : '';
  return `W - Over 75,000 lbs (Maximum)${loggingText} - ${formatCurrency(taxRates['W'])}`;
};

// Get min/max dates for date pickers
const getMinDate = (type) => {
  if (type === 'credit') {
    // From July 2024
    return '2024-07-01';
  } else if (type === 'priorYearSold') {
    // From last year
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    return lastYear.toISOString().split('T')[0];
  }
  return '';
};

const getMaxDate = (type) => {
  // For credit dates, exclude June (last month of tax period - no credit available)
  if (type === 'credit') {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed: 0=January, 5=June
    const currentYear = today.getFullYear();

    // If current month is June or later, set max to May 31st of current year
    // Otherwise, use current date
    if (currentMonth >= 5) { // June (5) or later
      return `${currentYear}-05-31`; // May 31st
    }
    return today.toISOString().split('T')[0];
  }
  // For other types, use present date
  return new Date().toISOString().split('T')[0];
};

/**
 * Reusable Vehicle Form Modal Component
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onSubmit - Callback when form is submitted (receives vehicle data)
 * @param {array} businesses - List of businesses for selection
 * @param {object} initialVehicle - Initial vehicle data (for editing)
 * @param {boolean} loading - Whether form submission is in progress
 * @param {string} submitButtonText - Text for submit button (default: "Add Vehicle")
 * @param {string} title - Modal title (default: "Add New Vehicle")
 */
export default function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  businesses = [],
  initialVehicle = null,
  initialBusinessId = '', // Pre-select a business ID
  loading = false,
  submitButtonText = 'Add Vehicle',
  title = 'Add New Vehicle',
  externalErrors = {} // Errors passed from parent (e.g., duplicate VIN)
}) {
  const [vehicle, setVehicle] = useState({
    vin: '',
    vehicleType: 'taxable',
    grossWeightCategory: '',
    logging: null,
    agricultural: null,
    creditReason: '',
    creditDate: '',
    soldTo: '',
    soldDate: '',
    businessId: ''
  });
  const [errors, setErrors] = useState({});
  const errorRef = useRef(null);

  // Scroll to top when error occurs
  useEffect(() => {
    const hasError = Object.keys(errors).length > 0;
    if (hasError && errorRef.current && isOpen) {
      // Small delay to ensure error is rendered
      setTimeout(() => {
        const element = errorRef.current;
        if (element) {
          // Find the modal's scrollable container
          const modalContainer = element.closest('.overflow-y-auto');
          if (modalContainer) {
            // Scroll within the modal container
            const elementTop = element.getBoundingClientRect().top;
            const containerTop = modalContainer.getBoundingClientRect().top;
            const offset = 20;
            modalContainer.scrollTo({
              top: modalContainer.scrollTop + (elementTop - containerTop) - offset,
              behavior: 'smooth'
            });
          } else {
            // Fallback to scrollIntoView
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }
      }, 150);
    }
  }, [errors, isOpen]);

  // Initialize form when modal opens or initialVehicle changes
  useEffect(() => {
    if (isOpen) {
      if (initialVehicle) {
        setVehicle({
          vin: initialVehicle.vin || '',
          vehicleType: initialVehicle.vehicleType || 'taxable',
          grossWeightCategory: initialVehicle.grossWeightCategory || '',
          logging: initialVehicle.logging ?? null,
          agricultural: initialVehicle.agricultural ?? null,
          creditReason: initialVehicle.creditReason || '',
          creditDate: initialVehicle.creditDate || '',
          soldTo: initialVehicle.soldTo || '',
          soldDate: initialVehicle.soldDate || '',
          businessId: initialVehicle.businessId || initialBusinessId || ''
        });
      } else {
        setVehicle({
          vin: '',
          vehicleType: 'taxable',
          grossWeightCategory: '',
          logging: null,
          agricultural: null,
          creditReason: '',
          creditDate: '',
          soldTo: '',
          soldDate: '',
          businessId: initialBusinessId || ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialVehicle]);

  // Merge external errors with internal errors
  useEffect(() => {
    if (Object.keys(externalErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...externalErrors }));
    }
  }, [externalErrors]);

  const handleVehicleTypeChange = (newType) => {
    setVehicle({
      ...vehicle,
      vehicleType: newType,
      // Reset type-specific fields when changing type
      grossWeightCategory: newType === 'suspended' ? 'W' : '',
      logging: null,
      agricultural: null,
      creditReason: '',
      creditDate: '',
      soldTo: '',
      soldDate: ''
    });
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors.grossWeightCategory;
    delete newErrors.logging;
    delete newErrors.agricultural;
    delete newErrors.creditReason;
    delete newErrors.creditDate;
    delete newErrors.soldTo;
    delete newErrors.soldDate;
    setErrors(newErrors);
  };

  const handleVINChange = (val) => {
    const upperVal = val.toUpperCase();
    setVehicle({ ...vehicle, vin: upperVal });
    if (upperVal.length === 17) {
      const vinVal = validateVIN(upperVal);
      setErrors({ ...errors, vin: vinVal.isValid ? '' : vinVal.error });
    } else {
      setErrors({ ...errors, vin: '' });
    }
  };

  const handleCreditDateChange = (selectedDate) => {
    setVehicle({ ...vehicle, creditDate: selectedDate });
    // Real-time validation for June
    if (selectedDate) {
      const dateObj = new Date(selectedDate);
      const month = dateObj.getMonth(); // 0-indexed: 0=January, 5=June
      if (month === 5) {
        setErrors({
          ...errors,
          creditDate: 'You cannot claim credit for the June month for any reason. June is the last month of the tax period, so there are no remaining months to claim credit.'
        });
      } else {
        const newErrors = { ...errors };
        delete newErrors.creditDate;
        setErrors(newErrors);
      }
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const newErrors = {};

    if (!vehicle.vin || vehicle.vin.length !== 17) {
      newErrors.vin = 'VIN is required and must be 17 characters';
    }

    if (!vehicle.businessId) {
      newErrors.businessId = 'Business selection is required';
    }

    if (vehicle.vehicleType === 'taxable' || vehicle.vehicleType === 'credit' || vehicle.vehicleType === 'suspended') {
      if (!vehicle.grossWeightCategory) {
        newErrors.grossWeightCategory = 'Weight category is required';
      }
      if (vehicle.logging === null) {
        newErrors.logging = 'Logging selection is required';
      }
    }

    if (vehicle.vehicleType === 'suspended' && vehicle.agricultural === null) {
      newErrors.agricultural = 'Agricultural selection is required';
    }

    if (vehicle.vehicleType === 'credit') {
      if (!vehicle.creditReason) {
        newErrors.creditReason = 'Credit reason is required';
      }
      if (!vehicle.creditDate) {
        newErrors.creditDate = 'Credit date is required';
      }
    }

    if (vehicle.vehicleType === 'priorYearSold') {
      if (!vehicle.soldTo) {
        newErrors.soldTo = 'Sold to is required';
      }
      if (!vehicle.soldDate) {
        newErrors.soldDate = 'Sold date is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call onSubmit with vehicle data
    onSubmit(vehicle);
  };

  const handleCancel = () => {
    setVehicle({
      vin: '',
      vehicleType: 'taxable',
      grossWeightCategory: '',
      logging: null,
      agricultural: null,
      creditReason: '',
      creditDate: '',
      soldTo: '',
      soldDate: '',
      businessId: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => !loading && handleCancel()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-2 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={handleCancel}
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

        <div className="space-y-4">
          {/* VIN */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              VIN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vehicle.vin}
              onChange={(e) => handleVINChange(e.target.value)}
              maxLength={17}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all font-mono ${errors.vin ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="17-character VIN"
            />
            {errors.vin && (
              <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.vin}</p>
            )}
          </div>

          {/* Business Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Business <span className="text-red-500">*</span>
            </label>
            <select
              value={vehicle.businessId || ''}
              onChange={(e) => setVehicle({ ...vehicle, businessId: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all bg-white appearance-none ${errors.businessId ? 'border-red-500' : 'border-slate-200'}`}
            >
              <option value="">Select a business</option>
              {businesses.map(business => (
                <option key={business.id} value={business.id}>
                  {business.businessName || business.name || 'Unnamed Business'}
                </option>
              ))}
            </select>
            {errors.businessId && (
              <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.businessId}</p>
            )}
            {businesses.length === 0 && (
              <p className="mt-1 text-xs sm:text-sm text-amber-600">
                No businesses found. Please create a business first.
              </p>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              value={vehicle.vehicleType || 'taxable'}
              onChange={(e) => handleVehicleTypeChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all bg-white appearance-none"
            >
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Gross Weight Category - Show for taxable, suspended, credit */}
          {(vehicle.vehicleType === 'taxable' || vehicle.vehicleType === 'credit' || vehicle.vehicleType === 'suspended') && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gross Weight Category <span className="text-red-500">*</span>
              </label>
              {vehicle.vehicleType === 'suspended' ? (
                <div className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-600 font-medium">
                  {getWeightCategoryWLabel(vehicle.logging)}
                </div>
              ) : (
                <select
                  value={vehicle.grossWeightCategory || ''}
                  onChange={(e) => setVehicle({ ...vehicle, grossWeightCategory: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all bg-white appearance-none ${errors.grossWeightCategory ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">Select weight category</option>
                  {getWeightCategoryOptions(vehicle.logging).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              )}
              {errors.grossWeightCategory && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.grossWeightCategory}</p>
              )}
            </div>
          )}

          {/* Logging - Show for taxable, suspended, credit */}
          {(vehicle.vehicleType === 'taxable' || vehicle.vehicleType === 'credit' || vehicle.vehicleType === 'suspended') && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Logging <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVehicle({ ...vehicle, logging: true })}
                  className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${vehicle.logging === true
                    ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setVehicle({ ...vehicle, logging: false })}
                  className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${vehicle.logging === false
                    ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                >
                  No
                </button>
              </div>
              {errors.logging && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.logging}</p>
              )}
            </div>
          )}

          {/* Agricultural - Show for suspended */}
          {vehicle.vehicleType === 'suspended' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Agricultural <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVehicle({ ...vehicle, agricultural: true })}
                  className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${vehicle.agricultural === true
                    ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                >
                  Yes (7,500 miles limit)
                </button>
                <button
                  type="button"
                  onClick={() => setVehicle({ ...vehicle, agricultural: false })}
                  className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${vehicle.agricultural === false
                    ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                >
                  No (5,000 miles limit)
                </button>
              </div>
              {errors.agricultural && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.agricultural}</p>
              )}
            </div>
          )}

          {/* Credit Reason - Show for credit */}
          {vehicle.vehicleType === 'credit' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={vehicle.creditReason || ''}
                onChange={(e) => setVehicle({ ...vehicle, creditReason: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all bg-white appearance-none ${errors.creditReason ? 'border-red-500' : 'border-slate-200'}`}
              >
                <option value="">Select reason</option>
                {creditReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>{reason.label}</option>
                ))}
              </select>
              {errors.creditReason && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.creditReason}</p>
              )}
            </div>
          )}

          {/* Credit Date - Show for credit */}
          {vehicle.vehicleType === 'credit' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={vehicle.creditDate || ''}
                onChange={(e) => handleCreditDateChange(e.target.value)}
                min={getMinDate('credit')}
                max={getMaxDate('credit')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${errors.creditDate ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.creditDate && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.creditDate}</p>
              )}
            </div>
          )}

          {/* Sold To - Show for priorYearSold */}
          {vehicle.vehicleType === 'priorYearSold' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sold To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vehicle.soldTo || ''}
                onChange={(e) => setVehicle({ ...vehicle, soldTo: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${errors.soldTo ? 'border-red-500' : 'border-slate-200'}`}
                placeholder="Buyer name or company"
              />
              {errors.soldTo && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.soldTo}</p>
              )}
            </div>
          )}

          {/* Sold Date - Show for priorYearSold */}
          {vehicle.vehicleType === 'priorYearSold' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sold Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={vehicle.soldDate || ''}
                onChange={(e) => setVehicle({ ...vehicle, soldDate: e.target.value })}
                min={getMinDate('priorYearSold')}
                max={getMaxDate()}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${errors.soldDate ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.soldDate && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{errors.soldDate}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[var(--color-orange)] text-white rounded-xl font-semibold hover:bg-[var(--color-orange-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
