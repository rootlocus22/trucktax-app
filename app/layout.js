import Link from "next/link";
import Script from "next/script";
import FirebaseAnalytics from "./components/FirebaseAnalytics";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  metadataBase: new URL("https://www.easyucr.com"),
  title: {
    default: "easyucr.com – Simple UCR Filing for Truckers",
    template: "%s | easyucr.com",
  },
  description:
    "Guided UCR filing for interstate carriers: accurate brackets, a clear total before you pay, and your certificate in one dashboard. Transparent tiered pricing from $79 for small fleets.",
  keywords: [
    "ucr filing service",
    "ucr filing",
    "ucr registration",
    "ucr renewal 2026",
    "ucr fee calculator",
    "ucr filing in texas",
    "ucr for brokers",
    "ucr penalty",
    "unified carrier registration",
  ],
  authors: [{ name: "easyucr.com" }],
  creator: "easyucr.com",
  publisher: "easyucr.com",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.easyucr.com",
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
    icon: "/easyucr-logo-mark.png",
    shortcut: "/easyucr-logo-mark.png",
    apple: "/easyucr-logo-mark.png",
  },
  verification: {
    google: "-95Bq4XHD66PIeHdHG3cDSad9_yp6kTmOVeUtUKUIc0",
  },
  openGraph: {
    title: "UCR Filing | easyucr.com",
    description:
      "File UCR with confidence—guided steps, full cost breakdown, pay when your certificate is ready. Estimate fees anytime.",
    url: "https://www.easyucr.com",
    siteName: "easyucr.com",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "UCR Filing | easyucr.com",
    description:
      "File UCR with confidence—guided steps, full cost breakdown, pay when your certificate is ready. Estimate fees anytime.",
  },
};

import Header from "@/components/ui/Header";
import StickyUcrCta from "@/components/StickyUcrCta";
import Providers from "@/components/Providers";

// JSON-LD for WebSite
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "easyucr.com",
  "url": "https://www.easyucr.com",
  "description": "Guided UCR filing with transparent pricing: see government + service fee before you pay, certificate in your dashboard.",
  "publisher": {
    "@type": "Organization",
    "name": "easyucr.com"
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
        className={`${inter.variable} font-sans min-h-screen bg-[var(--color-page)] text-[var(--color-text)] antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="w-full flex-1 min-h-[calc(100vh-100px)]">
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
                      <span className="text-xl font-bold tracking-tight text-white">easyucr.com</span>
                      <p className="text-xs text-blue-200 uppercase tracking-widest mt-1">UCR Filing</p>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed">
                      <p>
                        This site provides UCR filing for truckers. We are not the IRS, FMCSA, or any government agency.
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
                      <Link href="/insights/ucr-renewal-guide" className="text-sm text-slate-300 hover:text-white transition flex items-center gap-2 min-h-[44px] py-2 touch-manipulation">
                        UCR Renewal Guide
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
                    <p>The information and images on this website are the property of easyucr.com and may not be reproduced, reused, or appropriated without the express written consent of the owner.</p>
                    <p>easyucr.com is a private third-party provider offering UCR filing services for a fee. We are not affiliated with any government authority.</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                  <p>&copy; 2026 easyucr.com, All Rights Reserved.</p>
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
