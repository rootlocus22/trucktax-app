export const metadata = {
    title: 'Form 2290 Blog - Expert HVUT Filing Guides & Tips',
    description: 'Comprehensive guides on IRS Form 2290 filing, HVUT deadlines, common mistakes, e-filing tips, and trucking tax compliance. Stay updated with the latest 2026 regulations.',
    keywords: 'Form 2290 blog, HVUT guides, IRS Form 2290 tips, heavy vehicle use tax, trucking tax blog, Form 2290 deadline, e-file HVUT',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/blog',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Form 2290 Blog - Expert HVUT Filing Guides & Tips',
        description: 'Comprehensive guides on IRS Form 2290 filing, HVUT deadlines, and trucking tax compliance.',
        url: 'https://www.quicktrucktax.com/blog',
        siteName: 'QuickTruckTax',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://www.quicktrucktax.com/quicktrucktax-logo.png',
                width: 1280,
                height: 720,
                alt: 'QuickTruckTax Blog - Form 2290 & HVUT Guides',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@quicktrucktax',
        creator: '@quicktrucktax',
        title: 'Form 2290 Blog - Expert HVUT Filing Guides',
        description: 'Comprehensive guides on IRS Form 2290 filing and trucking tax compliance.',
        images: ['https://www.quicktrucktax.com/quicktrucktax-logo.png'],
    },
};

export default function BlogLayout({ children }) {
    return children;
}
