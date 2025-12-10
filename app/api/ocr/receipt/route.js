import { NextResponse } from 'next/server';
import { parseFuelReceipt } from '@/lib/gemini';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || 'image/jpeg';

        // Call Gemini OCR
        const data = await parseFuelReceipt(buffer, mimeType);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('OCR Error:', error);
        return NextResponse.json(
            { error: 'Failed to process receipt', details: error.message },
            { status: 500 }
        );
    }
}
