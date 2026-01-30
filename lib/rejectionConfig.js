export const REJECTION_REASONS = [
    {
        id: 'vin_mismatch',
        label: 'VIN Mismatch / Error',
        code: 'R0000-900-01',
        description: 'The VIN provided does not match IRS or FMCSA records, or contains invalid characters.',
        defaultAction: 'correct_info',
        template: 'The IRS rejected this filing because the VIN provided does not match their records. Please verify the VIN on your registration documents and provide the correct number below.'
    },
    {
        id: 'ein_mismatch',
        label: 'EIN / Name Control Mismatch',
        code: 'R0000-901-01',
        description: 'The Business Name and EIN combination does not match IRS records.',
        defaultAction: 'correct_info',
        template: 'The IRS rejected this filing because the Business Name and EIN do not match their records. Please provide the exact legal name as it appears on your SS-4 (EIN assignment) letter.'
    },
    {
        id: 'duplicate_filing',
        label: 'Duplicate Filing',
        code: 'R0000-902-01',
        description: 'A Form 2290 has already been accepted for this VIN and tax period.',
        defaultAction: 'general_reply',
        template: 'The IRS indicates a return has already been filed for this vehicle for the current tax period. If you believe this is an error, please explain below or upload proof of prior filing.'
    },
    {
        id: 'missing_info',
        label: 'Missing Information',
        code: 'R0000-903-01',
        description: 'Required information is missing from the return.',
        defaultAction: 'correct_info',
        template: 'The filing was rejected due to missing information. Please review the specific error details and provide the missing data.'
    },
    {
        id: 'payment_issue',
        label: 'Payment Issue',
        code: 'R0000-904-01',
        description: 'There was an issue processing the tax payment.',
        defaultAction: 'general_reply',
        template: 'The IRS could not process the tax payment. Please verify your bank details or payment method and provide updated instructions.'
    },
    {
        id: 'other',
        label: 'Other / Custom',
        code: 'MISC',
        description: 'Other rejection reason.',
        defaultAction: 'general_reply',
        template: 'Your filing requires attention. Please see the notes below and provide the requested information.'
    }
];

export const REQUIRED_ACTIONS = [
    { id: 'correct_info', label: 'Correct Information (Text)' },
    { id: 'upload_document', label: 'Upload Document' },
    { id: 'general_reply', label: 'General Reply / Confirmation' }
];

export const getRejectionConfig = (id) => REJECTION_REASONS.find(r => r.id === id);
