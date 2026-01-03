import Link from "next/link";
import Script from "next/script";
import FirebaseAnalytics from "./components/FirebaseAnalytics";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Not critical for initial render
});

export const metadata = {
  metadataBase: new URL("https://www.quicktrucktax.com"),
  title: {
    default: "QuickTruckTax | 2025-2026 Tax Year Form 2290 E-Filing",
    template: "%s | QuickTruckTax (2025-2026)",
  },
  description:
    "E-file IRS Form 2290 for Tax Year 2025-2026 with QuickTruckTax. Fast, secure, and instant Schedule 1. We help carriers stay compliant with HVUT, UCR, MCS-150, and IFTA.",
  keywords: [
    "form 2290",
    "e-file form 2290",
    "HVUT",
    "2025-2026 tax year",
    "eform2290",
    "eform 2290",
    "file 2290 online",
    "2290 due date",
    "UCR",
    "MCS-150",
    "IFTA",
    "trucking compliance",
    "heavy vehicle use tax",
    "IRS Form 2290",
    "schedule 1",
    "trucking tax",
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
    title: "QuickTruckTax | 2025-2026 Tax Year Form 2290 E-Filing",
    description:
      "Actionable guides and checklists for Form 2290, UCR, MCS-150, IFTA, and trucking authority filings. Stay compliant and avoid penalties.",
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
    title: "QuickTruckTax | 2025-2026 Tax Year Form 2290 E-Filing",
    description:
      "Stay ahead of trucking compliance deadlines with detailed Form 2290 and HVUT guides.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

import Header from "@/components/ui/Header";

// JSON-LD for WebSite
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'QuickTruckTax',
  alternateName: ['QuickTruckTax E-Filing', 'QTT'],
  url: 'https://www.quicktrucktax.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.quicktrucktax.com/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--color-page)] text-[var(--color-text)] antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 sm:py-16">
            {children}
            <Analytics />
            <FirebaseAnalytics />

          </main>
          <footer className="border-t border-[var(--color-border)] bg-[var(--color-midnight)] text-white pt-12 pb-8">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-white/10 pb-8">
                {/* Brand & Legal */}
                <div className="space-y-4 md:col-span-3 lg:col-span-1">
                  <div>
                    <span className="text-xl font-bold tracking-tight text-white">QuickTruckTax</span>
                    <p className="text-xs text-blue-200 uppercase tracking-widest mt-1">Compliance Simplified</p>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                    <p>
                      The information and images on this website are the property of QuickTruckTax and may not be reproduced, reused, or appropriated without the express written consent of the owner.
                    </p>
                    <p>
                      QuickTruckTax, operated by <strong className="text-white">Vendax Systems LLC</strong>, is a private third-party provider offering services for a fee. This website serves as a commercial solicitation and advertisement.
                    </p>
                    <p>
                      We are not affiliated with any government authority such as USDOT, FMCSA, or the IRS. We use third-party tools to file Form 2290 and MCS-150.
                    </p>
                  </div>
                </div>

                {/* Contact / Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Corporate Address</h3>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin shrink-0 text-[var(--color-orange)]"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    <address className="not-italic">
                      Vendax Systems LLC<br />
                      28 Geary St STE 650 Suite #500<br />
                      San Francisco, California 94108<br />
                      United States
                    </address>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Resources</h3>
                  <div className="flex flex-col gap-3">
                    <Link href="/insights/trucking-compliance-calendar" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2">
                      Compliance Calendar
                    </Link>
                    <Link href="/insights/form-2290-checklist-download" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2">
                      Form 2290 Checklist
                    </Link>
                    <Link href="/resources/2290-tax-directory" className="text-sm text-[#f97316] hover:text-[#fbbf24] transition flex items-center gap-2 font-bold">
                      Tax Guide Directory <span className="text-[10px] bg-white/10 px-1 rounded">NEW</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} QuickTruckTax (Vendax Systems LLC). All rights reserved.</p>
                <div className="flex gap-6">
                  <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html >
  );
}
