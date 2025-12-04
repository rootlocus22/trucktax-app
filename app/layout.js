import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./error-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LayoutRouter } from "@/components/LayoutRouter";
import { NotificationToast } from "@/components/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.quicktrucktax.com"),
  title: {
    default: "QuickTruckTax | Trucking Compliance Guides & Form 2290 Filing",
    template: "%s | QuickTruckTax",
  },
  description:
    "QuickTruckTax helps carriers stay compliant with HVUT, UCR, MCS-150, and IFTA. Expert Form 2290, 8849 guides and trucking compliance tools.",
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
    title: "QuickTruckTax | Trucking Compliance Guides",
    description:
      "Stay ahead of trucking compliance deadlines with detailed Form 2290 and HVUT guides.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--color-page)] text-[var(--color-text)] antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <LayoutRouter>{children}</LayoutRouter>
            <NotificationToast />
            <Analytics />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
