import { NextResponse } from 'next/server';
import { getCarrierByUsdot } from '@/lib/fmcsa';

/** User-facing message when FMCSA lookup fails so the UI can suggest manual entry */
const LOOKUP_UNAVAILABLE_MESSAGE = "We couldn't fetch your details from FMCSA. Please enter your business information below.";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const usdot = searchParams.get('usdot');

    if (!usdot) {
        return NextResponse.json({ error: 'USDOT number is required' }, { status: 400 });
    }

    try {
        const carrier = await getCarrierByUsdot(usdot);

        if (!carrier) {
            return NextResponse.json({ error: LOOKUP_UNAVAILABLE_MESSAGE }, { status: 404 });
        }

        const headers = {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
        };
        return NextResponse.json(carrier, { headers });
    } catch (error) {
        console.error('FMCSA lookup error:', error?.message || error);
        const message = error?.message || LOOKUP_UNAVAILABLE_MESSAGE;
        const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 502;
        return NextResponse.json({ error: message }, { status });
    }
}
