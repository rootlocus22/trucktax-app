export const metadata = {
    title: 'Blog – UCR & Trucking Compliance Guides',
    description: 'UCR filing tips, renewal guides, and trucking compliance. easyucr.com is a UCR filing service.',
    keywords: 'UCR blog, UCR filing tips, trucking compliance, UCR deadline, UCR renewal',
    alternates: {
        canonical: 'https://www.easyucr.com/blog',
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
        title: 'Blog – UCR & Compliance Guides',
        description: 'UCR filing tips and trucking compliance guides. We\'re a UCR filing service with compliance guides, due date calculators, and reminders.',
        url: 'https://www.easyucr.com/blog',
        siteName: 'easyucr.com',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://www.easyucr.com/quicktrucktax-logo.png',
                width: 1280,
                height: 720,
                alt: 'easyucr.com Blog – UCR & Compliance Guides',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@easyucr',
        creator: '@easyucr',
        title: 'Blog – UCR & Compliance Guides',
        description: 'UCR filing tips and trucking compliance guides.',
        images: ['https://www.easyucr.com/quicktrucktax-logo.png'],
    },
};

import UcrCtaBanner from '@/components/UcrCtaBanner';

export default function BlogLayout({ children }) {
    return (
        <>
            {children}
            <UcrCtaBanner />
        </>
    );
}
