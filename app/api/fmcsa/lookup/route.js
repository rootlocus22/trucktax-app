import { NextResponse } from 'next/server';
import { getCarrierByUsdot } from '@/lib/fmcsa';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const usdot = searchParams.get('usdot');

    if (!usdot) {
        return NextResponse.json({ error: 'USDOT number is required' }, { status: 400 });
    }

    try {
        const carrier = await getCarrierByUsdot(usdot);

        if (!carrier) {
            return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
        }

        return NextResponse.json(carrier);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
