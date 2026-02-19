const FMCSA_API_KEY = process.env.FMCSA_API_KEY;
const BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';

/**
 * Fetches carrier information by USDOT from the official FMCSA API.
 * When FMCSA_API_KEY is set, only the real API is used. Use a real USDOT (e.g. 44110) to get real data.
 * Mock data is used only when FMCSA_API_KEY is not set (e.g. local dev without a key).
 */
export async function getCarrierByUsdot(usdot) {
    if (!usdot) throw new Error('USDOT number is required');
    const dot = String(usdot).trim();

    const MOCK_DATA = {
        '1234567': {
            usdot: '1234567',
            name: 'MOCK TRUCKING LLC',
            dba: 'MT LOGISTICS',
            ein: '12-3456789',
            email: 'test@mocktrucking.com',
            phone: '555-123-4567',
            address: { street: '123 Test St', city: 'Testville', state: 'CA', zip: '90001', country: 'US' },
            type: 'Interstate',
            status: 'Active',
            totalUnits: 5,
            updatedAt: new Date().toISOString(),
            cachedAt: new Date().toISOString()
        },
        '9999999': {
            usdot: '9999999',
            name: 'TEST CARRIER INC',
            dba: '',
            ein: '99-9999999',
            email: 'test@testcarrier.com',
            phone: '555-999-9999',
            address: { street: '999 Test Ave', city: 'Test City', state: 'TX', zip: '75001', country: 'US' },
            type: 'Intrastate',
            status: 'Active',
            totalUnits: 42,
            updatedAt: new Date().toISOString(),
            cachedAt: new Date().toISOString()
        },
        '0000000': { usdot: '0000000', error: 'Carrier not found' }
    };

    // No API key: use mock only (e.g. local dev)
    if (!FMCSA_API_KEY) {
        if (MOCK_DATA[dot] && !MOCK_DATA[dot].error) return MOCK_DATA[dot];
        return MOCK_DATA['1234567'];
    }
    // Explicit mock override for tests
    if (process.env.FMCSA_USE_MOCK === 'true' && MOCK_DATA[dot] && !MOCK_DATA[dot].error) {
        return MOCK_DATA[dot];
    }

    // Real FMCSA API call (official endpoint)
    const url = `${BASE_URL}/${encodeURIComponent(dot)}?webKey=${encodeURIComponent(FMCSA_API_KEY)}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        let message = "We couldn't fetch your details from FMCSA. Please enter your business information below.";
        if (status === 403) message = "FMCSA lookup isn't available for this request. Please enter your business details below.";
        if (status === 404) message = "Carrier not found for this USDOT. Please enter your business details below.";
        if (status >= 500) message = "FMCSA service is temporarily unavailable. Please enter your business details below.";
        throw new Error(message);
    }

    let json;
    try {
        json = await response.json();
    } catch {
        throw new Error("We couldn't fetch your details from FMCSA. Please enter your business information below.");
    }

    // API can return carrier in content.carrier, data, or as root object
    const raw = json.content?.carrier ?? json.data ?? (json.legalName != null || json.dotNumber != null ? json : null);
    if (!raw) {
        return null;
    }

    // Map official FMCSA API field names (apiElements) to our shape
    const dotNumber = raw.dot_number ?? raw.dotNumber ?? dot;
    const legalName = raw.legal_business_name ?? raw.legalName ?? '';
    const dbaName = raw.dba_name ?? raw.dbaName ?? '';
    const phyStreet = raw.phyStreet ?? '';
    const phyCity = raw.phyCity ?? '';
    const phyState = raw.phyState ?? '';
    const phyZip = raw.phyZip ?? raw.phyZipcode ?? '';
    const phyCountry = raw.phyCountry ?? 'US';
    const telephone = raw.telephone ?? raw.business_phone_number ?? raw.phone ?? '';
    const email = raw.email_address ?? raw.email ?? '';
    const totalUnits = Number(raw.total_units ?? raw.totalUnits ?? raw.powerUnits ?? raw.passengerVehicle ?? 0) || 0;
    const operation = raw.carrier_operation ?? raw.operationClassification ?? raw.allowedOper ?? 'Unknown';
    const status = raw.statusCode ?? (raw.allowToOperate === 'Y' ? 'Active' : 'Inactive');

    const now = new Date().toISOString();
    return {
        usdot: dotNumber,
        name: legalName,
        dba: dbaName,
        ein: raw.decrypted_ein ?? raw.ein ?? raw.taxId ?? '',
        email,
        phone: telephone,
        totalUnits,
        address: { street: phyStreet, city: phyCity, state: phyState, zip: phyZip, country: phyCountry },
        type: operation,
        status,
        updatedAt: now,
        cachedAt: now
    };
}
