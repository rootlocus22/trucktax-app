import { Golos_Text } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./error-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LayoutRouter } from "@/components/LayoutRouter";
import { NotificationToast } from "@/components/NotificationToast";
import TrackingListener from "@/components/TrackingListener";
import { Suspense } from "react";

const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.quicktrucktax.com"),
  title: {
    default: "File Form 2290 Online - $34.99 | Get Schedule 1 in Minutes | QuickTruckTax",
    template: "%s | QuickTruckTax",
  },
  description:
    "File Form 2290 in 2 minutes. Get IRS Schedule 1 instantly. $34.99 flat fee. Free VIN corrections. Trusted by 10,000+ truckers. E-file Form 2290 for 2025-2026 tax year. Start now →",
  keywords: [
    "form 2290", "HVUT", "UCR", "MCS-150", "IFTA",
    "trucking compliance", "heavy vehicle use tax",
    "IRS Form 2290", "schedule 1", "e-file form 2290", "trucking tax"
  ],
  authors: [{ name: "QuickTruckTax Team" }],
  creator: "QuickTruckTax",
  publisher: "QuickTruckTax",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.quicktrucktax.com",
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
  icons: {
    icon: "/quicktrucktax-logo-new.png",
    shortcut: "/quicktrucktax-logo-new.png",
    apple: "/quicktrucktax-logo-new.png",
  },
  verification: {
    google: "-95Bq4XHD66PIeHdHG3cDSad9_yp6kTmOVeUtUKUIc0",
  },
  openGraph: {
    title: "QuickTruckTax - Fast & Easy Form 2290 Filing",
    description:
      "File your IRS Form 2290 in minutes. QuickTruckTax is the fastest way for truckers to get their Schedule 1.",
    url: "https://www.quicktrucktax.com",
    siteName: "QuickTruckTax",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
        width: 1280,
        height: 720,
        alt: "QuickTruckTax - Trucking Tax Compliance Guide",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@quicktrucktax",
    creator: "@quicktrucktax",
    title: "File Form 2290 Online - $34.99 | Get Schedule 1 in Minutes",
    description:
      "File Form 2290 in 2 minutes. Get IRS Schedule 1 instantly. $34.99 flat fee. Free VIN corrections. Trusted by 10,000+ truckers.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "QuickTruckTax",
  "url": "https://www.quicktrucktax.com",
  "description": "File Form 2290 in 2 minutes. Get IRS Schedule 1 instantly. $34.99 flat fee. Free VIN corrections. Trusted by 10,000+ truckers.",
  "publisher": {
    "@type": "Organization",
    "name": "QuickTruckTax"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Resource Hints for Performance */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <Script id="structured-data-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ukqsfhcozl");
          `}
        </Script>
      </head>
      <body
        className={`${golosText.variable} min-h-screen bg-[var(--color-page)] text-[var(--color-text)] antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              <TrackingListener />
            </Suspense>
            <LayoutRouter>{children}</LayoutRouter>
            <NotificationToast />
            <Analytics />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html >
  );
}
