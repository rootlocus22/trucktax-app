import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const FMCSA_API_KEY = process.env.FMCSA_API_KEY;
const BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';

/**
 * Fetches carrier information by USDOT number using caching strategy.
 * 1. Checks Firestore 'fmcsa_cache' collection.
 * 2. If missing/stale, calls FMCSA API.
 * 3. Caches result in Firestore.
 */
export async function getCarrierByUsdot(usdot) {
    if (!usdot) throw new Error('USDOT number is required');

    // 0. MOCK DATA for Testing
    if (usdot === '1234567') {
        return {
            usdot: '1234567',
            name: 'MOCK TRUCKING LLC',
            dba: 'MT LOGISTICS',
            ein: '12-3456789',
            email: 'test@mocktrucking.com',
            phone: '555-123-4567',
            address: {
                street: '123 Test St',
                city: 'Testville',
                state: 'CA',
                zip: '90001',
                country: 'US'
            },
            type: 'Interstate',
            status: 'Active',
            updatedAt: new Date().toISOString(),
            cachedAt: new Date().toISOString()
        };
    }

    // 1. Check Cache
    // 1. Check Cache
    const cacheRef = doc(db, 'fmcsa_cache', usdot);
    try {
        const cacheSnap = await getDoc(cacheRef);
        if (cacheSnap.exists()) {
            // Ideally check for staleness here (e.g., older than 30 days)
            // For now, return cached data
            console.log('FMCSA Cache Hit:', usdot);
            return cacheSnap.data();
        }
    } catch (err) {
        console.warn('FMCSA Cache Read Skipped:', err.message);
    }

    // 2. Call External API
    console.log('FMCSA Cache Miss, calling API:', usdot);
    if (!FMCSA_API_KEY) {
        console.error("Missing FMCSA_API_KEY");
        throw new Error("Server configuration error");
    }

    try {
        const response = await fetch(`${BASE_URL}/${usdot}?webKey=${FMCSA_API_KEY}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`FMCSA API Error: ${response.statusText}`);
        }

        if (!response.ok) {
            throw new Error(`FMCSA API Error: ${response.statusText}`);
        }

        const json = await response.json();

        // Check for the "data" object as per user provided sample
        const carrierData = json.data || json.content?.carrier;

        if (!carrierData) {
            return null;
        }

        // normalize data for our app
        // enhanced to handle both potential structures, prioritizing the user's new format
        const normalizedData = {
            usdot: carrierData.dot_number || carrierData.dotNumber,
            name: carrierData.legal_business_name || carrierData.legalName,
            dba: carrierData.dba_name || carrierData.dbaName,
            // Prioritize decrypted_ein, then ein, then taxId
            ein: carrierData.decrypted_ein || carrierData.ein || carrierData.taxId || '',

            // Contact info from new format
            email: carrierData.email_address || '',
            phone: carrierData.business_phone_number || '',

            address: {
                street: carrierData.phyStreet || '', // New format didn't show address fields in sample, keeping fallback
                city: carrierData.phyCity || '',
                state: carrierData.phyState || '',
                zip: carrierData.phyZipcode || '',
                country: carrierData.phyCountry || 'US'
            },
            type: carrierData.carrier_operation || carrierData.allowedOper || 'Unknown',
            status: carrierData.statusCode || 'Active', // Defaulting if missing
            updatedAt: serverTimestamp(),
            cachedAt: serverTimestamp()
        };

        // 3. Update Cache
        // 3. Update Cache
        try {
            await setDoc(cacheRef, normalizedData);
        } catch (err) {
            console.warn('FMCSA Cache Write Skipped:', err.message);
        }

        return normalizedData;

    } catch (error) {
        console.error('Error fetching from FMCSA:', error);
        throw error;
    }
}
