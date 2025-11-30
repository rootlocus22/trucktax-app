import { validateVIN } from './validation';

/**
 * Calculate the due date for a weight increase amendment
 * Due by: Last day of the month following the month of increase
 * 
 * @param {string} increaseMonth - Format: "July 2025"
 * @returns {Date} - Due date
 */
export function calculateWeightIncreaseDueDate(increaseMonth) {
    // Month name to index mapping
    const monthMap = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    // Parse "July 2025" format
    const parts = increaseMonth.trim().split(' ');
    if (parts.length !== 2) {
        throw new Error('Invalid month format. Expected format: "Month YYYY"');
    }

    const [monthName, yearStr] = parts;
    const monthIndex = monthMap[monthName];
    const year = parseInt(yearStr, 10);

    if (monthIndex === undefined || isNaN(year)) {
        throw new Error('Invalid month or year');
    }

    // Get last day of following month
    // monthIndex + 2 gives us the first day of the month after next
    // Day 0 gives us the last day of the previous month (which is the month we want)
    const dueDate = new Date(year, monthIndex + 2, 0);
    return dueDate;
}

/**
 * Validate VIN correction data
 * 
 * @param {string} originalVIN - The incorrect VIN
 * @param {string} correctedVIN - The correct VIN
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateVINCorrection(originalVIN, correctedVIN) {
    const errors = [];

    const originalValidation = validateVIN(originalVIN);
    if (!originalValidation.isValid) {
        errors.push(`Original VIN: ${originalValidation.error}`);
    }

    const correctedValidation = validateVIN(correctedVIN);
    if (!correctedValidation.isValid) {
        errors.push(`Corrected VIN: ${correctedValidation.error}`);
    }

    if (originalVIN.toUpperCase() === correctedVIN.toUpperCase()) {
        errors.push('Original and corrected VINs must be different');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate weight increase data
 * 
 * @param {string} originalCategory - Original weight category (e.g., 'F')
 * @param {string} newCategory - New weight category (e.g., 'H')
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateWeightIncrease(originalCategory, newCategory) {
    // Weight categories in order from lowest to highest (A-W)
    // A = 55,000 lbs, B = 56,000 lbs, ... V = 75,000 lbs, W = 75,000+ lbs
    const validCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];

    const originalIndex = validCategories.indexOf(originalCategory);
    const newIndex = validCategories.indexOf(newCategory);

    if (!originalCategory) {
        return {
            isValid: false,
            error: 'Please select the original weight category from the dropdown'
        };
    }

    if (originalIndex === -1) {
        return {
            isValid: false,
            error: `Invalid original weight category "${originalCategory}". Please select a valid category (A-W) from the dropdown.`
        };
    }

    if (!newCategory) {
        return {
            isValid: false,
            error: 'Please select the new weight category from the dropdown'
        };
    }

    if (newIndex === -1) {
        return {
            isValid: false,
            error: `Invalid new weight category "${newCategory}". Please select a valid category (A-W) from the dropdown.`
        };
    }

    if (newIndex <= originalIndex) {
        return {
            isValid: false,
            error: `New weight category (${newCategory}) must be higher than original category (${originalCategory}). For a weight increase amendment, the vehicle must have moved to a heavier category.`
        };
    }

    return { isValid: true };
}

/**
 * Validate mileage exceeded data
 * 
 * @param {number} actualMileage - Actual mileage used
 * @param {boolean} isAgriculturalVehicle - Whether it's an agricultural vehicle
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateMileageExceeded(actualMileage, isAgriculturalVehicle) {
    const limit = isAgriculturalVehicle ? 7500 : 5000;

    if (typeof actualMileage !== 'number' || actualMileage < 0) {
        return {
            isValid: false,
            error: 'Actual mileage must be a positive number'
        };
    }

    if (actualMileage <= limit) {
        return {
            isValid: false,
            error: `Actual mileage (${actualMileage}) must exceed the ${limit} mile limit for ${isAgriculturalVehicle ? 'agricultural' : 'standard'} vehicles`
        };
    }

    return { isValid: true };
}

/**
 * Get amendment type display information
 * 
 * @param {string} amendmentType - Type of amendment
 * @returns {Object} - Display configuration
 */
export function getAmendmentTypeConfig(amendmentType) {
    const configs = {
        'vin_correction': {
            label: 'VIN Correction',
            shortLabel: 'VIN',
            icon: '📝',
            color: 'blue',
            description: 'Correct an incorrect Vehicle Identification Number',
            deadline: 'No specific deadline',
            cost: 'FREE - No additional tax due'
        },
        'weight_increase': {
            label: 'Taxable Gross Weight Increase',
            shortLabel: 'Weight ↑',
            icon: '⚖️',
            color: 'orange',
            description: 'Report when your vehicle moved to a higher weight category during the tax period',
            deadline: 'DUE: Last day of month following weight increase',
            cost: 'Additional tax will be calculated'
        },
        'mileage_exceeded': {
            label: 'Mileage Use Limit Exceeded',
            shortLabel: 'Mileage',
            icon: '🛣️',
            color: 'purple',
            description: 'Report when a suspended vehicle exceeded the 5,000 mile limit (7,500 for agricultural vehicles)',
            deadline: 'Report the month mileage was exceeded',
            cost: 'Full tax will be calculated'
        }
    };

    return configs[amendmentType] || {
        label: 'Amendment',
        shortLabel: 'AMD',
        icon: '🔄',
        color: 'gray',
        description: 'General amendment',
        deadline: 'Varies by type',
        cost: 'Varies by type'
    };
}

/**
 * Calculate months remaining in tax period after a given month
 * 
 * @param {string} month - Month name (e.g., "July")
 * @param {string} taxYear - Tax year (e.g., "2025-2026")
 * @returns {number} - Number of months remaining
 */
export function calculateRemainingMonths(month, taxYear) {
    const monthMap = {
        'July': 0, 'August': 1, 'September': 2, 'October': 3,
        'November': 4, 'December': 5, 'January': 6, 'February': 7,
        'March': 8, 'April': 9, 'May': 10, 'June': 11
    };

    const monthIndex = monthMap[month];
    if (monthIndex === undefined) {
        throw new Error('Invalid month');
    }

    // Tax year runs July to June
    // Months remaining = 12 - monthIndex (where July = 0)
    return 12 - monthIndex;
}

/**
 * Format amendment details for display
 * 
 * @param {Object} filing - Filing object with amendment details
 * @returns {string} - Formatted string for display
 */
export function formatAmendmentSummary(filing) {
    if (!filing || filing.filingType !== 'amendment') {
        return '';
    }

    const { amendmentType, amendmentDetails } = filing;

    switch (amendmentType) {
        case 'vin_correction':
            return `VIN Correction: ${amendmentDetails?.vinCorrection?.originalVIN} → ${amendmentDetails?.vinCorrection?.correctedVIN}`;

        case 'weight_increase':
            return `Weight Increase: ${amendmentDetails?.weightIncrease?.originalWeightCategory} → ${amendmentDetails?.weightIncrease?.newWeightCategory} (${amendmentDetails?.weightIncrease?.increaseMonth})`;

        case 'mileage_exceeded':
            return `Mileage Exceeded: ${amendmentDetails?.mileageExceeded?.actualMileageUsed?.toLocaleString()} miles (Limit: ${amendmentDetails?.mileageExceeded?.originalMileageLimit?.toLocaleString()})`;

        default:
            return 'Amendment';
    }
}

/**
 * Get agent instructions for processing amendment filings
 * Provides clear step-by-step instructions for agents
 * 
 * @param {Object} filing - Filing object with amendment details
 * @returns {Object} - { title, description, steps, importantNotes, taxInfo }
 */
export function getAgentAmendmentInstructions(filing) {
    if (!filing || filing.filingType !== 'amendment' || !filing.amendmentType) {
        return null;
    }

    const { amendmentType, amendmentDetails, amendmentDueDate } = filing;

    switch (amendmentType) {
        case 'vin_correction':
            return {
                title: 'VIN Correction Amendment - Processing Instructions',
                description: 'Customer is correcting an incorrectly entered Vehicle Identification Number on a previously filed Form 2290.',
                steps: [
                    'Verify the original VIN was incorrectly filed',
                    'Confirm the corrected VIN matches the vehicle registration',
                    'File Form 2290 Amendment with IRS using the corrected VIN',
                    'Mark the "VIN Correction" box on the form',
                    'Upload the stamped Schedule 1 showing the corrected VIN'
                ],
                importantNotes: [
                    'NO additional tax is due for VIN corrections',
                    'This amendment is FREE for the customer',
                    'Ensure the corrected VIN is exactly 17 characters',
                    'The original tax amount should already have been paid on the initial filing'
                ],
                taxInfo: {
                    additionalTaxDue: 0,
                    serviceFee: 0,
                    isFree: true
                },
                originalVIN: amendmentDetails?.vinCorrection?.originalVIN,
                correctedVIN: amendmentDetails?.vinCorrection?.correctedVIN,
                originalFilingId: amendmentDetails?.vinCorrection?.originalFilingId
            };

        case 'weight_increase':
            return {
                title: 'Weight Increase Amendment - Processing Instructions',
                description: 'Customer is reporting that their vehicle moved to a higher weight category during the tax period, requiring additional tax payment.',
                steps: [
                    'Verify the vehicle weight increase date',
                    'Confirm the original weight category and new weight category',
                    'Calculate and verify the prorated additional tax amount',
                    'File Form 2290 Amendment with IRS',
                    'Mark the "Amended Return" box on the form',
                    'Include payment for the additional tax due',
                    'Upload the stamped Schedule 1'
                ],
                importantNotes: [
                    `Additional tax due: $${amendmentDetails?.weightIncrease?.additionalTaxDue?.toFixed(2) || '0.00'}`,
                    (() => {
                        if (!amendmentDueDate) return 'Verify due date';
                        let dueDate;
                        if (amendmentDueDate.seconds) {
                            dueDate = new Date(amendmentDueDate.seconds * 1000);
                        } else if (amendmentDueDate.toDate) {
                            dueDate = amendmentDueDate.toDate();
                        } else if (amendmentDueDate instanceof Date) {
                            dueDate = amendmentDueDate;
                        } else {
                            dueDate = new Date(amendmentDueDate);
                        }
                        return `⏰ DUE BY: ${dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                    })(),
                    'Tax is prorated based on months remaining from the month of increase',
                    'Ensure the weight increase date is accurate',
                    'The original tax for the lower weight category should have already been paid'
                ],
                taxInfo: {
                    additionalTaxDue: amendmentDetails?.weightIncrease?.additionalTaxDue || 0,
                    serviceFee: 0,
                    isFree: false
                },
                originalCategory: amendmentDetails?.weightIncrease?.originalWeightCategory,
                newCategory: amendmentDetails?.weightIncrease?.newWeightCategory,
                increaseMonth: amendmentDetails?.weightIncrease?.increaseMonth,
                vehicleId: amendmentDetails?.weightIncrease?.vehicleId
            };

        case 'mileage_exceeded':
            return {
                title: 'Mileage Exceeded Amendment - Processing Instructions',
                description: 'Customer had a suspended vehicle (low mileage) that exceeded the mileage limit, requiring full HVUT tax payment.',
                steps: [
                    'Verify the vehicle exceeded the mileage limit',
                    `Confirm mileage limit: ${amendmentDetails?.mileageExceeded?.originalMileageLimit?.toLocaleString() || 'N/A'} miles ${amendmentDetails?.mileageExceeded?.isAgriculturalVehicle ? '(Agricultural)' : '(Standard)'}`,
                    `Verify actual mileage: ${amendmentDetails?.mileageExceeded?.actualMileageUsed?.toLocaleString() || 'N/A'} miles`,
                    'Determine the first-used month in the tax period (from original filing)',
                    'Calculate the full HVUT tax based on first-used month',
                    'File Form 2290 Amendment with IRS',
                    'Mark the "Amended Return" box on the form',
                    'Include payment for the full tax amount',
                    'Upload the stamped Schedule 1'
                ],
                importantNotes: [
                    'Full HVUT tax is now due (not prorated)',
                    'The vehicle was originally filed as suspended (no tax due)',
                    'Standard vehicles: 5,000 mile limit; Agricultural: 7,500 mile limit',
                    `Month exceeded: ${amendmentDetails?.mileageExceeded?.exceededMonth || 'N/A'}`,
                    'Tax is calculated from the first-used month in the tax period, not the exceeded month'
                ],
                taxInfo: {
                    additionalTaxDue: 0, // Will be calculated based on first-used month
                    serviceFee: 0,
                    isFree: false,
                    requiresFullTax: true
                },
                vehicleId: amendmentDetails?.mileageExceeded?.vehicleId,
                isAgricultural: amendmentDetails?.mileageExceeded?.isAgriculturalVehicle,
                mileageLimit: amendmentDetails?.mileageExceeded?.originalMileageLimit,
                actualMileage: amendmentDetails?.mileageExceeded?.actualMileageUsed,
                exceededMonth: amendmentDetails?.mileageExceeded?.exceededMonth
            };

        default:
            return null;
    }
}
