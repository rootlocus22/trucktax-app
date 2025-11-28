
/**
 * IRS Form 2290 Validation Rules
 * Based on IRS e-file specifications and Form 2290 instructions.
 */

// Allowed characters for Business Name: A-Z, 0-9, &, -
// Note: IRS systems are very strict. Commas, periods, and other symbols are often rejected or cause name control mismatches.
const BUSINESS_NAME_REGEX = /^[A-Z0-9&\- ]+$/i;

// VIN: 17 chars, alphanumeric, cannot contain I, O, or Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

// EIN: 9 digits
const EIN_REGEX = /^\d{9}$/;

export const validateBusinessName = (name) => {
    if (!name) return { isValid: false, error: 'Business name is required' };
    if (name.length < 1) return { isValid: false, error: 'Business name is too short' };
    if (name.length > 70) return { isValid: false, error: 'Business name is too long (max 70 chars)' };

    if (!BUSINESS_NAME_REGEX.test(name)) {
        return {
            isValid: false,
            error: 'Contains invalid characters. IRS only allows letters, numbers, spaces, "&" and "-". Please remove commas, periods, or other symbols.'
        };
    }

    return { isValid: true, error: '' };
};

export const validateEIN = (ein) => {
    // Remove any non-digit characters for validation
    const cleanEin = ein.replace(/\D/g, '');

    if (!cleanEin) return { isValid: false, error: 'EIN is required' };
    if (cleanEin.length !== 9) return { isValid: false, error: 'EIN must be exactly 9 digits' };

    if (!EIN_REGEX.test(cleanEin)) {
        return { isValid: false, error: 'EIN must contain only numbers' };
    }

    return { isValid: true, error: '' };
};

export const formatEIN = (ein) => {
    const clean = ein.replace(/\D/g, '');
    if (clean.length <= 2) return clean;
    return `${clean.slice(0, 2)}-${clean.slice(2, 9)}`;
};

export const validateVIN = (vin) => {
    if (!vin) return { isValid: false, error: 'VIN is required' };

    const upperVin = vin.toUpperCase();

    if (upperVin.length !== 17) {
        return { isValid: false, error: `VIN must be exactly 17 characters (currently ${upperVin.length})` };
    }

    if (/[IOQ]/.test(upperVin)) {
        return { isValid: false, error: 'VIN cannot contain letters I, O, or Q (use 1 or 0 instead)' };
    }

    if (!/^[A-Z0-9]+$/.test(upperVin)) {
        return { isValid: false, error: 'VIN must contain only letters and numbers' };
    }

    // Optional: Checksum validation could be added here, but IRS mainly cares about format and uniqueness.

    return { isValid: true, error: '' };
};

export const validateAddress = (address) => {
    if (!address) return { isValid: false, error: 'Address is required' };
    if (address.length < 5) return { isValid: false, error: 'Address is too short' };
    // IRS allows most characters in address, but recommends avoiding strict punctuation if possible.
    // We'll be lenient here but ensure it's not empty.
    return { isValid: true, error: '' };
};

export const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return { isValid: false, error: 'Phone number must be at least 10 digits' };
    return { isValid: true, error: '' };
};
