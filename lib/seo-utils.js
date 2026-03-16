/**
 * SEO metadata helpers for EasyUCR
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.easyucr.com';

export function buildCanonical(path = '') {
  const base = SITE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function buildOgImage(path = '') {
  return `${SITE_URL}${path || '/og-image.png'}`;
}

export function defaultMetadata(overrides = {}) {
  return {
    metadataBase: new URL(SITE_URL),
    openGraph: {
      siteName: 'easyucr.com',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
    },
    ...overrides,
  };
}
