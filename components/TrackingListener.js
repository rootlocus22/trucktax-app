'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TrackingListener() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Capture UTM and referral data only if not already stored or if new UTMs are present
        const captureAcquisitionData = () => {
            const utmSource = searchParams.get('utm_source');
            const utmMedium = searchParams.get('utm_medium');
            const utmCampaign = searchParams.get('utm_campaign');
            const utmContent = searchParams.get('utm_content');
            const utmTerm = searchParams.get('utm_term');
            const gclid = searchParams.get('gclid');
            const fbclid = searchParams.get('fbclid');

            // Only proceed if we have some tracking data or if it's the first visit
            const hasTrackingData = utmSource || gclid || fbclid;
            const existingData = localStorage.getItem('acquisition_data');

            if (hasTrackingData || !existingData) {
                const acquisitionData = {
                    acquisitionSource: utmSource || (document.referrer.includes('google.com') ? 'google' : 'direct'),
                    acquisitionMedium: utmMedium || (document.referrer ? 'referral' : 'organic'),
                    acquisitionCampaign: utmCampaign || null,
                    acquisitionContent: utmContent || null,
                    acquisitionTerm: utmTerm || null,
                    acquisitionReferrerUrl: document.referrer || '(direct)',
                    acquisitionLandingPage: window.location.href,
                    acquisitionTimestamp: new Date().toISOString(),
                    gclid: gclid || null,
                    fbclid: fbclid || null,
                    userAgent: navigator.userAgent
                };

                // Don't overwrite if it's just a sub-page visit without new UTMs
                if (hasTrackingData || !existingData) {
                    localStorage.setItem('acquisition_data', JSON.stringify(acquisitionData));
                    console.log('Acquisition data captured:', acquisitionData);
                }
            }
        };

        captureAcquisitionData();
    }, [searchParams]);

    return null;
}
