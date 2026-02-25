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
    default: "QuickTruckTax – The Smart UCR Filing & Compliance Platform for Truckers",
    template: "%s | QuickTruckTax",
  },
  description:
    "Simple. Fast. Smart UCR filing. Calculate your fee, file in minutes, and stay compliant. The best UCR-focused platform for truckers.",
  keywords: [
    "ucr filing",
    "ucr registration",
    "ucr renewal 2026",
    "ucr fee calculator",
    "ucr filing in texas",
    "ucr for brokers",
    "ucr penalty",
    "form 2290 guides",
    "e-file form 2290",
    "HVUT tax help",
    "reactivate usdot number",
    "ifta reporting",
    "mcs-150 biennial update",
    "heavy vehicle use tax",
    "irs form 2290 deadline",
    "schedule 1 proof of payment",
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
    icon: "/quicktrucktax-favicon.png",
    shortcut: "/quicktrucktax-favicon.png",
    apple: "/quicktrucktax-favicon.png",
  },
  verification: {
    google: "-95Bq4XHD66PIeHdHG3cDSad9_yp6kTmOVeUtUKUIc0",
  },
  openGraph: {
    title: "Form 2290 Guides & Resources | QuickTruckTax",
    description:
      "Free Form 2290 guides, checklists, and HVUT resources for trucking compliance.",
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
    title: "Form 2290 Guides & Resources | QuickTruckTax",
    description:
      "Free Form 2290 guides, checklists, and HVUT resources for trucking compliance.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

import Header from "@/components/ui/Header";
import StickyUcrCta from "@/components/StickyUcrCta";
import Providers from "@/components/Providers";

// JSON-LD for WebSite
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
        <Script id="microsoft-clarity" strategy="lazyOnload">
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
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 sm:py-16 min-h-[calc(100vh-100px)]">
              {children}
              <StickyUcrCta />
              <Analytics />
              <FirebaseAnalytics />

            </main>
            <footer className="border-t border-[var(--color-border)] bg-[var(--color-midnight)] text-white pt-10 sm:pt-12 pb-8 pb-safe">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-white/10 pb-8">
                  {/* Brand */}
                  <div className="space-y-4 md:col-span-3 lg:col-span-1">
                    <div>
                      <span className="text-xl font-bold tracking-tight text-white">QuickTruckTax</span>
                      <p className="text-xs text-blue-200 uppercase tracking-widest mt-1">Guides &amp; Resources</p>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed">
                      <p>
                        This site provides educational content about Form 2290, HVUT, and trucking compliance. We are not the IRS, FMCSA, or any government agency.
                      </p>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Resources</h3>
                    <div className="flex flex-col gap-1">
                      <Link href="/ucr/file" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2 font-medium min-h-[44px] py-2 touch-manipulation">
                        UCR Filing
                      </Link>
                      <Link href="/tools/ucr-calculator" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2 min-h-[44px] py-2 touch-manipulation">
                        UCR Fee Calculator
                      </Link>
                      <Link href="/ucr/dispatcher" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2 min-h-[44px] py-2 touch-manipulation">
                        File UCR for Multiple Trucks
                      </Link>
                      <Link href="/insights/trucking-compliance-calendar" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2 min-h-[44px] py-2 touch-manipulation">
                        Compliance Calendar
                      </Link>
                      <Link href="/insights/form-2290-checklist-download" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2 min-h-[44px] py-2 touch-manipulation">
                        Form 2290 Checklist
                      </Link>
                      <Link href="/resources/2290-tax-directory" className="text-sm text-[#f97316] hover:text-[#fbbf24] transition flex items-center gap-2 font-bold min-h-[44px] py-2 touch-manipulation">
                        Tax Guide Directory <span className="text-[10px] bg-white/10 px-1 rounded">NEW</span>
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Legal</h3>
                    <div className="flex flex-col gap-1">
                      <Link href="/privacy-policy" className="text-sm text-slate-300 hover:text-white transition min-h-[44px] flex items-center touch-manipulation">Privacy Policy</Link>
                      <Link href="/terms" className="text-sm text-slate-300 hover:text-white transition min-h-[44px] flex items-center touch-manipulation">Terms of Service</Link>
                    </div>
                  </div>
                </div>

                {/* Disclaimer & copyright */}
                <div className="space-y-4 mb-8">
                  <div className="text-sm text-slate-300 leading-relaxed space-y-2">
                    <p>The information and images on this website are the property of QuickTruckTax and may not be reproduced, reused, or appropriated without the express written consent of the owner.</p>
                    <p>QuickTruckTax is a private third-party provider offering services for a fee. This website serves as a commercial solicitation and advertisement. We are not affiliated with any government authority such as the IRS, USDOT, or FMCSA.</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                  <p>&copy; 2026 QuickTruckTax, All Rights Reserved.</p>
                  <div className="flex gap-6">
                    <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html >
  );
}
