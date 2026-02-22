export const metadata = {
    title: 'Blog – UCR, Form 2290 & Compliance Guides | QuickTruckTax',
    description: 'UCR filing tips, Form 2290 guides, and trucking compliance. QuickTruckTax is primarily a UCR filing service; we also offer 2290, MCS-150, IFTA, compliance guides, due date calculators, and reminders.',
    keywords: 'UCR blog, Form 2290 blog, HVUT guides, UCR filing tips, trucking compliance, Form 2290 deadline, e-file HVUT',
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
        title: 'Blog – UCR, Form 2290 & Compliance Guides | QuickTruckTax',
        description: 'UCR filing tips, Form 2290 guides, and trucking compliance. We\'re primarily a UCR filing service; we also offer 2290, MCS-150, IFTA, compliance guides, due date calculators, and reminders.',
        url: 'https://www.quicktrucktax.com/blog',
        siteName: 'QuickTruckTax',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://www.quicktrucktax.com/quicktrucktax-logo.png',
                width: 1280,
                height: 720,
                alt: 'QuickTruckTax Blog – UCR & Compliance Guides',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@quicktrucktax',
        creator: '@quicktrucktax',
        title: 'Blog – UCR, Form 2290 & Compliance Guides',
        description: 'UCR filing tips, Form 2290 guides, and trucking compliance.',
        images: ['https://www.quicktrucktax.com/quicktrucktax-logo.png'],
    },
};

export default function BlogLayout({ children }) {
    return children;
}
