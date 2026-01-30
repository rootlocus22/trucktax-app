/**
 * Filing Intelligence Layer
 * Detects incomplete filings, duplicates, and provides resume functionality
 */

/**
 * Check if a filing is incomplete (can be resumed)
 * @param {Object} filing - Filing object (can be regular filing or draft)
 * @returns {boolean} - True if filing can be resumed
 */
export function isIncompleteFiling(filing) {
    if (!filing) return false;
    
    // Draft filings are always incomplete (in progress)
    if (filing.status === 'draft') {
        return true;
    }
    
    // Incomplete statuses that can be resumed
    const incompleteStatuses = ['submitted', 'processing', 'action_required'];
    
    // A filing is incomplete if:
    // 1. Status is submitted/processing/action_required (not completed)
    // 2. Has at least a business or vehicle selected
    const hasBasicData = filing.businessId || (filing.vehicleIds && filing.vehicleIds.length > 0);
    
    return incompleteStatuses.includes(filing.status) && hasBasicData;
}

/**
 * Detect if a new filing would be a duplicate of an existing incomplete filing
 * @param {Object} newFilingData - New filing data to check
 * @param {Array} existingFilings - Array of existing filings
 * @returns {Object|null} - Duplicate filing if found, null otherwise
 */
export function detectDuplicateFiling(newFilingData, existingFilings) {
    if (!newFilingData || !existingFilings || existingFilings.length === 0) {
        return null;
    }

    const { filingType, taxYear, businessId, vehicleIds, amendmentType } = newFilingData;

    // Filter incomplete filings only
    const incompleteFilings = existingFilings.filter(f => isIncompleteFiling(f));

    // Check for duplicates based on filing type
    if (filingType === 'standard') {
        // Standard filing: match tax year, business, and vehicles
        const duplicate = incompleteFilings.find(filing => {
            if (filing.filingType !== 'standard') return false;
            if (filing.taxYear !== taxYear) return false;
            
            // Check business match
            const businessMatch = filing.businessId === businessId;
            
            // Check vehicle match (same vehicles)
            const vehicleMatch = vehicleIds && filing.vehicleIds && 
                vehicleIds.length === filing.vehicleIds.length &&
                vehicleIds.every(id => filing.vehicleIds.includes(id));
            
            return businessMatch && vehicleMatch && vehicleIds && vehicleIds.length > 0;
        });

        return duplicate || null;
    }

    if (filingType === 'amendment' && amendmentType) {
        // Amendment: match type, tax year, and amendment-specific data
        const duplicate = incompleteFilings.find(filing => {
            if (filing.filingType !== 'amendment') return false;
            if (filing.amendmentType !== amendmentType) return false;
            if (filing.taxYear !== taxYear) return false;

            // VIN Correction: match original VIN
            if (amendmentType === 'vin_correction') {
                const newOriginalVIN = newFilingData.amendmentDetails?.vinCorrection?.originalVIN;
                const existingOriginalVIN = filing.amendmentDetails?.vinCorrection?.originalVIN;
                return newOriginalVIN && newOriginalVIN === existingOriginalVIN;
            }

            // Weight Increase: match vehicle
            if (amendmentType === 'weight_increase') {
                const newVehicleId = newFilingData.amendmentDetails?.weightIncrease?.vehicleId;
                const existingVehicleId = filing.amendmentDetails?.weightIncrease?.vehicleId;
                return newVehicleId && newVehicleId === existingVehicleId;
            }

            // Mileage Exceeded: match vehicle
            if (amendmentType === 'mileage_exceeded') {
                const newVehicleId = newFilingData.amendmentDetails?.mileageExceeded?.vehicleId;
                const existingVehicleId = filing.amendmentDetails?.mileageExceeded?.vehicleId;
                return newVehicleId && newVehicleId === existingVehicleId;
            }

            return false;
        });

        return duplicate || null;
    }

    if (filingType === 'refund') {
        // Refund: match tax year and refund vehicles
        const duplicate = incompleteFilings.find(filing => {
            if (filing.filingType !== 'refund') return false;
            if (filing.taxYear !== taxYear) return false;
            
            // Check if refund vehicles match
            if (!vehicleIds || !filing.vehicleIds) return false;
            
            return vehicleIds.length === filing.vehicleIds.length &&
                vehicleIds.every(id => filing.vehicleIds.includes(id));
        });

        return duplicate || null;
    }

    return null;
}

/**
 * Get incomplete filings grouped by type
 * @param {Array} filings - Array of all filings
 * @returns {Object} - Grouped incomplete filings
 */
export function getIncompleteFilings(filings) {
    const incomplete = filings.filter(f => isIncompleteFiling(f));
    
    return {
        all: incomplete,
        standard: incomplete.filter(f => f.filingType === 'standard'),
        amendment: incomplete.filter(f => f.filingType === 'amendment'),
        refund: incomplete.filter(f => f.filingType === 'refund'),
        actionRequired: incomplete.filter(f => f.status === 'action_required'),
        byTaxYear: groupByTaxYear(incomplete)
    };
}

/**
 * Group filings by tax year
 * @param {Array} filings - Array of filings
 * @returns {Object} - Filings grouped by tax year
 */
function groupByTaxYear(filings) {
    return filings.reduce((acc, filing) => {
        const year = filing.taxYear || 'Unknown';
        if (!acc[year]) acc[year] = [];
        acc[year].push(filing);
        return acc;
    }, {});
}

/**
 * Get resume progress information for a filing
 * @param {Object} filing - Filing object
 * @returns {Object} - Progress information
 */
export function getFilingProgress(filing) {
    if (!filing) return { completed: 0, total: 5, steps: [], percentage: 0 };

    // For upload workflow, check different steps
    if (filing.workflowType === 'upload') {
        const steps = [
            { name: 'Upload PDF', completed: !!filing.pdfUrl },
            { name: 'Business', completed: !!filing.selectedBusinessId || !!filing.extractedBusiness },
            { name: 'Vehicles', completed: filing.selectedVehicleIds && filing.selectedVehicleIds.length > 0 },
            { name: 'Review & Pay', completed: filing.pricing && filing.pricing.grandTotal > 0 }
        ];
        const completed = steps.filter(s => s.completed).length;
        const total = steps.length;
        
        // If we have step info, use that for more accurate progress
        let percentage = Math.round((completed / total) * 100);
        if (filing.step) {
            // Step 2 = 50%, Step 3 = 75%
            percentage = filing.step === 3 ? 75 : filing.step === 2 ? 50 : 25;
        }
        
        return {
            completed,
            total,
            percentage,
            steps,
            status: filing.status || 'draft',
            lastUpdated: filing.updatedAt || filing.createdAt
        };
    }

    // For manual workflow
    const steps = [
        { name: 'Filing Type', completed: !!filing.filingType },
        { name: 'Business', completed: !!filing.selectedBusinessId || !!filing.businessId },
        { name: 'Vehicles', completed: (filing.selectedVehicleIds && filing.selectedVehicleIds.length > 0) || (filing.vehicleIds && filing.vehicleIds.length > 0) },
        { name: 'Documents', completed: filing.inputDocuments && filing.inputDocuments.length > 0 },
        { name: 'Review & Pay', completed: filing.pricing && filing.pricing.grandTotal > 0 }
    ];

    const completed = steps.filter(s => s.completed).length;
    const total = steps.length;

    return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
        steps,
        status: filing.status,
        lastUpdated: filing.updatedAt || filing.createdAt
    };
}

/**
 * Format incomplete filing for display
 * @param {Object} filing - Filing object
 * @returns {Object} - Formatted display data
 */
export function formatIncompleteFiling(filing) {
    if (!filing) {
        console.log('formatIncompleteFiling: filing is null/undefined');
        return null;
    }

    // Always return something for drafts, even if minimal data
    const isDraft = filing.status === 'draft' || filing.isDraft;
    
    console.log('formatIncompleteFiling called with:', {
        id: filing.id || filing.draftId,
        workflowType: filing.workflowType,
        filingType: filing.filingType,
        status: filing.status,
        isDraft,
        taxYear: filing.taxYear,
        filingData: filing.filingData
    });

    const progress = getFilingProgress(filing);
    
    let description = '';
    if (filing.workflowType === 'upload') {
        description = 'Schedule 1 Upload';
    } else if (filing.filingType === 'amendment') {
        if (filing.amendmentType === 'vin_correction') {
            description = 'VIN Correction Amendment';
        } else if (filing.amendmentType === 'weight_increase') {
            description = 'Weight Increase Amendment';
        } else if (filing.amendmentType === 'mileage_exceeded') {
            description = 'Mileage Exceeded Amendment';
        } else {
            description = 'Amendment Filing';
        }
    } else if (filing.filingType === 'refund') {
        description = 'Refund Claim (Form 8849)';
    } else {
        description = filing.workflowType === 'upload' ? 'Schedule 1 Upload' : 'Standard Form 2290 Filing';
    }

    // Get tax year from filingData if not directly on filing
    const taxYear = filing.taxYear || filing.filingData?.taxYear || 'Unknown';
    
    // Get vehicle count - check both selectedVehicleIds and vehicleIds
    const vehicleCount = filing.selectedVehicleIds?.length || filing.vehicleIds?.length || 0;

    // Ensure we always have valid data, especially for drafts
    const formatted = {
        id: filing.id || filing.draftId || 'unknown',
        description: description || (isDraft ? 'Draft Filing' : 'Incomplete Filing'),
        taxYear: taxYear || 'Unknown',
        progress: progress.percentage || 0,
        status: filing.status || 'draft',
        lastUpdated: progress.lastUpdated || filing.updatedAt || filing.createdAt || new Date(),
        vehicleCount: vehicleCount || 0,
        hasBusiness: !!filing.selectedBusinessId || !!filing.businessId,
        statusLabel: filing.status === 'draft' ? 'Draft' : getStatusLabel(filing.status || 'draft')
    };

    console.log('formatIncompleteFiling returning:', formatted);
    return formatted;
}

/**
 * Get human-readable status label
 * @param {string} status - Status code
 * @returns {string} - Status label
 */
function getStatusLabel(status) {
    const labels = {
        'submitted': 'In Progress',
        'processing': 'Processing',
        'action_required': 'Action Required',
        'completed': 'Completed'
    };
    return labels[status] || status;
}

