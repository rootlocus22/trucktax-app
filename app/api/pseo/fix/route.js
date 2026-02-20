import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebaseAdmin';


/**
 * POST /api/pseo/fix
 * Fix SEO metadata issues for a page (title/description length)
 */
export async function POST(request) {
    try {
        const { slug, fixes } = await request.json();

        if (!slug || !fixes) {
            return NextResponse.json({ error: 'Slug and fixes are required' }, { status: 400 });
        }

        // Validate slug - Firestore doc IDs can't contain slashes
        if (slug.includes('/')) {
            return NextResponse.json({
                error: 'Invalid slug - only pSEO pages can be fixed. This page is static content.',
                type: 'static_content'
            }, { status: 400 });
        }

        const docRef = db.collection('pseo_pages').doc(slug);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const currentData = docSnap.data();
        const updates = {};

        // Apply fixes
        if (fixes.meta_title) {
            // Truncate to 60 chars if needed
            updates.meta_title = fixes.meta_title.slice(0, 60);
        }

        if (fixes.meta_description) {
            // Truncate to 160 chars if needed
            updates.meta_description = fixes.meta_description.slice(0, 160);
        }

        // Auto-fix title if too long
        if (fixes.autoFixTitle && currentData.meta_title && currentData.meta_title.length > 60) {
            updates.meta_title = currentData.meta_title.slice(0, 57) + '...';
        }

        // Auto-fix description if too long
        if (fixes.autoFixDescription && currentData.meta_description && currentData.meta_description.length > 160) {
            updates.meta_description = currentData.meta_description.slice(0, 157) + '...';
        }

        if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date().toISOString();
            await docRef.update(updates);
        }

        return NextResponse.json({
            success: true,
            slug,
            applied: updates
        });
    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/pseo/fix?action=batch-status
 * Get pSEO page stats from Firestore
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'batch-status') {
        try {
            const snapshot = await db.collection('pseo_pages').get();

            const stats = {
                total: snapshot.size,
                byType: {},
                issues: {
                    longTitle: 0,
                    longDescription: 0,
                    missingContent: 0
                }
            };

            snapshot.forEach(doc => {
                const data = doc.data();

                // Count by type
                const type = data.type || 'unknown';
                stats.byType[type] = (stats.byType[type] || 0) + 1;

                // Count issues
                if (data.meta_title && data.meta_title.length > 60) {
                    stats.issues.longTitle++;
                }
                if (data.meta_description && data.meta_description.length > 160) {
                    stats.issues.longDescription++;
                }
                if (!data.intro_html || data.intro_html.length < 100) {
                    stats.issues.missingContent++;
                }
            });

            return NextResponse.json(stats);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
