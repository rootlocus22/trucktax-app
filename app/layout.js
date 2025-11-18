import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://quicktrucktax.com"),
  title: {
    default: "QuickTruckTax | Trucking Compliance Guides & Form 2290 Filing",
    template: "%s | QuickTruckTax",
  },
  description:
    "QuickTruckTax helps carriers, owner-operators, and brokers stay compliant with HVUT, UCR, MCS-150, and fuel tax filings. Expert Form 2290 guides, IFTA resources, and trucking compliance tools.",
  keywords: [
    "form 2290",
    "HVUT",
    "UCR",
    "MCS-150",
    "IFTA",
    "trucking compliance",
    "heavy vehicle use tax",
    "IRS Form 2290",
    "schedule 1",
    "e-file form 2290",
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
    canonical: "https://quicktrucktax.com",
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
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: "-95Bq4XHD66PIeHdHG3cDSad9_yp6kTmOVeUtUKUIc0",
  },
  openGraph: {
    title: "QuickTruckTax | Trucking Compliance Guides & Form 2290 Filing",
    description:
      "Actionable guides and checklists for Form 2290, UCR, MCS-150, IFTA, and trucking authority filings. Stay compliant and avoid penalties.",
    url: "https://quicktrucktax.com",
    siteName: "QuickTruckTax",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://quicktrucktax.com/quicktrucktax-logo.png",
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
    title: "QuickTruckTax | Trucking Compliance Guides",
    description:
      "Stay ahead of trucking compliance deadlines with detailed Form 2290 and HVUT guides.",
    images: ["https://quicktrucktax.com/quicktrucktax-logo.png"],
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/insights", label: "Guides" },
  { href: "/tools", label: "Tools" },
  { href: "/insights/form-2290-ultimate-guide", label: "Form 2290" },
  { href: "/insights/ucr-renewal-guide", label: "UCR" },
  { href: "/insights/mcs150-update-guide", label: "MCS-150" },
  { href: "/insights/ifta-filing-basics", label: "IFTA" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--color-page)] text-[var(--color-text)] antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white shadow-sm">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex flex-col text-white">
                <span className="text-xl font-semibold tracking-tight">QuickTruckTax</span>
                <span className="text-xs font-medium uppercase tracking-[0.35em] text-white/60">
                  Filing Made Simple
                </span>
              </Link>
              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium sm:justify-end">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full bg-white/5 px-3 py-1 text-white transition hover:bg-white/15 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
            {children}
          </main>
          <footer className="border-t border-[var(--color-border)] bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-midnight)] text-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-white/80">
                &copy; {new Date().getFullYear()} QuickTruckTax. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/insights/trucking-compliance-calendar" className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20">
                  Compliance Calendar
                </Link>
                <Link href="/insights/form-2290-checklist-download" className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20">
                  Form 2290 Checklist
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
