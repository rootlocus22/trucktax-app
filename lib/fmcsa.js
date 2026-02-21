const FMCSA_API_KEY = process.env.FMCSA_API_KEY;
const BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';

/**
 * FMCSA QCMobile API – data we can get (per https://mobile.fmcsa.dot.gov/QCDevsite/docs/apiElements and qcApi):
 *
 * From GET /carriers/:dotNumber (main carrier lookup):
 *   - dotNumber, mcNumber, legalName, dbaName
 *   - allowToOperate (Y/N), outOfService (Y/N), outOfServiceDate (MM/DD/YYYY)
 *   - complaintCount
 *   - phyStreet, phyCity, phyState, phyZip, phyCountry, telephone
 *   - busVehicle, limoVehicle, miniBusVehicle, motorCoachVehicle, vanVehicle, passengerVehicle (for totalUnits)
 *   - (email not in apiElements; some responses include ein)
 *
 * From GET /carriers/:dotNumber/operation-classification (optional second call):
 *   - Operation type: Authorized For Hire, Private, Interstate, Intrastate, etc.
 *
 * From GET /carriers/:dotNumber/basics:
 *   - BASIC safety percentiles and violation counts (separate endpoint)
 *
 * From GET /carriers/:dotNumber/cargo-carried, .../authority, .../docket-numbers, .../oos:
 *   - Cargo, authority, docket numbers, out-of-service details
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

    // Real FMCSA API call (official endpoint) — no caching
    const url = `${BASE_URL}/${encodeURIComponent(dot)}?webKey=${encodeURIComponent(FMCSA_API_KEY)}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
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

    // API can return carrier in content.carrier, data, or as root object.
    // Sometimes carrier is an array of apiElements: [{ name: "legalName", value: "..." }, ...]
    let raw = json.content?.carrier ?? json.data ?? (json.legalName != null || json.dotNumber != null ? json : null);
    if (!raw) {
        return null;
    }

    // Normalize apiElements array to a plain object
    if (Array.isArray(raw)) {
        raw = raw.reduce((acc, item) => {
            const key = item?.name ?? item?.key;
            const val = item?.value ?? item?.data;
            if (key != null) acc[key] = val;
            return acc;
        }, {});
    }

    // Map official FMCSA API field names (apiElements) to our shape
    const dotNumber = String(raw.dot_number ?? raw.dotNumber ?? dot).trim();
    const legalName = String(raw.legal_business_name ?? raw.legalName ?? '').trim();
    const dbaName = String(raw.dba_name ?? raw.dbaName ?? '').trim();
    const phyStreet = String(raw.phyStreet ?? '').trim();
    const phyCity = String(raw.phyCity ?? '').trim();
    const phyState = String(raw.phyState ?? '').trim();
    const phyZip = String(raw.phyZip ?? raw.phyZipcode ?? '').trim();
    const phyCountry = String(raw.phyCountry ?? 'US').trim();
    const telephone = String(raw.telephone ?? raw.business_phone_number ?? raw.phone ?? '').trim();
    const email = String(raw.email_address ?? raw.email ?? '').trim();

    // Power units: prefer explicit total, then sum of vehicle-type fields per FMCSA apiElements
    const explicitUnits = Number(raw.total_units ?? raw.totalUnits ?? raw.powerUnits ?? raw.passengerVehicle ?? 0);
    const bus = Number(raw.busVehicle ?? 0) || 0;
    const limo = Number(raw.limoVehicle ?? 0) || 0;
    const miniBus = Number(raw.miniBusVehicle ?? 0) || 0;
    const motorCoach = Number(raw.motorCoachVehicle ?? 0) || 0;
    const van = Number(raw.vanVehicle ?? 0) || 0;
    const passenger = Number(raw.passengerVehicle ?? 0) || 0;
    const summed = bus + limo + miniBus + motorCoach + van + passenger;
    const totalUnits = explicitUnits > 0 ? explicitUnits : (summed > 0 ? summed : 0);

    // Status: FMCSA may return "A" (Active), "I" (Inactive), or allowToOperate Y/N
    const allowToOperate = raw.allowToOperate ?? raw.allowToOperateFlag;
    const statusCode = raw.statusCode ?? raw.status;
    let status = 'Unknown';
    if (allowToOperate === 'Y' || statusCode === 'A' || String(statusCode).toUpperCase() === 'ACTIVE') status = 'Active';
    else if (allowToOperate === 'N' || statusCode === 'I' || statusCode === 'N' || String(statusCode).toUpperCase() === 'INACTIVE') status = 'Inactive';

    // Optional: fetch operation-classification so we get Interstate/Intrastate etc. instead of "Unknown"
    let operationType = raw.carrier_operation ?? raw.operationClassification ?? raw.allowedOper ?? null;
    if (!operationType) {
        try {
            const oc = await fetchOperationClassification(dot);
            if (oc) operationType = oc;
        } catch {
            // ignore; we'll return Unknown
        }
    }
    if (!operationType) operationType = 'Unknown';

    // All data we can get from FMCSA (per apiElements); no caching
    const out = {
        usdot: dotNumber,
        name: legalName,
        dba: dbaName,
        address: { street: phyStreet, city: phyCity, state: phyState, zip: phyZip, country: phyCountry },
        totalUnits,
        type: operationType,
        status,
    };
    if (telephone) out.phone = telephone;
    if (email) out.email = email;
    const einVal = raw.ein ?? raw.decrypted_ein ?? raw.taxId ?? raw.employerIdNumber;
    if (einVal !== undefined && einVal !== null && einVal !== '') out.ein = String(einVal).trim();
    const mc = raw.mcNumber ?? raw.mc_number;
    if (mc !== undefined && mc !== null && mc !== '') out.mcNumber = String(mc).trim();
    if (typeof raw.complaintCount === 'number') out.complaintCount = raw.complaintCount;
    if (raw.outOfService !== undefined) out.outOfService = raw.outOfService === 'Y' || raw.outOfService === true;
    if (raw.outOfServiceDate) out.outOfServiceDate = raw.outOfServiceDate;
    return out;
}

/**
 * Fetches operation classification for the carrier (Interstate, Intrastate, etc.).
 * Endpoint: GET /carriers/:dotNumber/operation-classification
 */
async function fetchOperationClassification(dot) {
    if (!FMCSA_API_KEY) return null;
    const url = `${BASE_URL}/${encodeURIComponent(dot)}/operation-classification?webKey=${encodeURIComponent(FMCSA_API_KEY)}`;
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const content = json.content ?? json.data ?? json;
    // Response may be array of classifications or single object with operation type
    const list = Array.isArray(content) ? content : (content?.carrier ?? content?.operationClassification ? [content] : []);
    const first = list[0];
    if (!first) return null;
    const rawItem = first?.name != null ? { [first.name]: first.value } : first;
    const op = rawItem.operationClassification ?? rawItem.operation ?? rawItem.type ?? rawItem.description ?? rawItem.value;
    if (op && typeof op === 'string') return op.trim();
    if (op && typeof op === 'object' && op.description) return String(op.description).trim();
    return null;
}
