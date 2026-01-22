
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

export const validateAddress = (address, required = false) => {
    if (!address || address.trim() === '') {
        if (required) {
            return { isValid: false, error: 'Address is required' };
        }
        return { isValid: true, error: '' };
    }
    if (address.trim().length < 5) return { isValid: false, error: 'Address is too short (minimum 5 characters)' };
    if (address.trim().length > 200) return { isValid: false, error: 'Address is too long (maximum 200 characters)' };
    // IRS allows most characters in address, but recommends avoiding strict punctuation if possible.
    // We'll be lenient here but ensure it's not empty.
    return { isValid: true, error: '' };
};

export const validatePhone = (phone, required = false) => {
    if (!phone || phone.trim() === '') {
        if (required) {
            return { isValid: false, error: 'Phone number is required' };
        }
        return { isValid: true, error: '' };
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // US phone number validation: 10 digits (area code + 7 digits)
    // Can also accept 11 digits if it starts with 1 (country code)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        // Valid: 1 + 10 digits
        return { isValid: true, error: '' };
    } else if (cleanPhone.length === 10) {
        // Valid: 10 digits (standard US format)
        return { isValid: true, error: '' };
    } else if (cleanPhone.length < 10) {
        return { isValid: false, error: 'Phone number must be at least 10 digits' };
    } else if (cleanPhone.length > 11) {
        return { isValid: false, error: 'Phone number is too long (max 11 digits)' };
    } else {
        return { isValid: false, error: 'Invalid phone number format. Please enter a valid US phone number' };
    }
};

// US States list for validation
const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export const validateState = (state, required = false) => {
    if (!state || state.trim() === '') {
        if (required) {
            return { isValid: false, error: 'State is required' };
        }
        return { isValid: true, error: '' };
    }
    
    const upperState = state.trim().toUpperCase();
    if (!US_STATES.includes(upperState)) {
        return { isValid: false, error: 'Invalid state code. Please enter a valid 2-letter US state code (e.g., CA, NY, TX)' };
    }
    
    return { isValid: true, error: '' };
};

export const validateZip = (zip, required = false) => {
    if (!zip || zip.trim() === '') {
        if (required) {
            return { isValid: false, error: 'ZIP code is required' };
        }
        return { isValid: true, error: '' };
    }
    
    const cleanZip = zip.replace(/\D/g, '');
    
    // US ZIP code: 5 digits (or 9 digits with hyphen: 12345-6789)
    if (cleanZip.length === 5) {
        return { isValid: true, error: '' };
    } else if (cleanZip.length === 9) {
        return { isValid: true, error: '' };
    } else if (cleanZip.length < 5) {
        return { isValid: false, error: 'ZIP code must be at least 5 digits' };
    } else {
        return { isValid: false, error: 'Invalid ZIP code format. Please enter a valid 5-digit US ZIP code' };
    }
};

export const validateCity = (city, required = false) => {
    if (!city || city.trim() === '') {
        if (required) {
            return { isValid: false, error: 'City is required' };
        }
        return { isValid: true, error: '' };
    }
    
    if (city.trim().length < 2) {
        return { isValid: false, error: 'City name is too short (minimum 2 characters)' };
    }
    
    if (city.trim().length > 50) {
        return { isValid: false, error: 'City name is too long (maximum 50 characters)' };
    }
    
    return { isValid: true, error: '' };
};

export const validateCountry = (country, required = false) => {
    if (!country || country.trim() === '') {
        if (required) {
            return { isValid: false, error: 'Country is required' };
        }
        return { isValid: true, error: '' };
    }
    
    const normalizedCountry = country.trim();
    
    // For Form 2290, only United States is allowed
    const validUSNames = [
        'United States',
        'United States of America',
        'USA',
        'US',
        'U.S.',
        'U.S.A.'
    ];
    
    const isUS = validUSNames.some(validName => 
        normalizedCountry.toLowerCase() === validName.toLowerCase()
    );
    
    if (!isUS) {
        return { isValid: false, error: 'Only United States is allowed for Form 2290 filings' };
    }
    
    return { isValid: true, error: '' };
};

export const validatePIN = (pin, required = false) => {
    if (!pin || pin.trim() === '') {
        if (required) {
            return { isValid: false, error: 'PIN is required' };
        }
        return { isValid: true, error: '' };
    }
    
    const cleanPIN = pin.replace(/\D/g, '');
    
    if (cleanPIN.length !== 5) {
        return { isValid: false, error: 'PIN must be exactly 5 digits' };
    }
    
    if (!/^\d{5}$/.test(cleanPIN)) {
        return { isValid: false, error: 'PIN must contain only numbers' };
    }
    
    // PIN cannot be 00000
    if (cleanPIN === '00000') {
        return { isValid: false, error: 'PIN cannot be 00000. Please enter a valid 5-digit PIN' };
    }
    
    return { isValid: true, error: '' };
};
