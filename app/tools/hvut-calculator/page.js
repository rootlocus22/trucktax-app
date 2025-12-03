import CalculatorClient from './CalculatorClient';

export const metadata = {
  title: "Form 2290 HVUT Tax Calculator | QuickTruckTax",
  description:
    "Calculate your Heavy Vehicle Use Tax (HVUT) for Form 2290. Estimate tax due based on weight and first use month.",
  alternates: {
    canonical: "https://www.quicktrucktax.com/tools/hvut-calculator",
  },
  openGraph: {
    title: "Form 2290 HVUT Tax Calculator | QuickTruckTax",
    description:
      "Calculate your Heavy Vehicle Use Tax (HVUT) for Form 2290. Estimate tax due based on weight and first use month.",
    url: "https://www.quicktrucktax.com/tools/hvut-calculator",
    siteName: "QuickTruckTax",
    type: "website",
    images: [
      {
        url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
        width: 1280,
        height: 720,
        alt: "HVUT Tax Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Form 2290 HVUT Tax Calculator | QuickTruckTax",
    description:
      "Calculate your Heavy Vehicle Use Tax (HVUT) for Form 2290.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Form 2290 HVUT Tax Calculator",
  description:
    "Calculate your Heavy Vehicle Use Tax (HVUT) for Form 2290. Estimate tax due based on weight and first use month.",
  url: "https://www.quicktrucktax.com/tools/hvut-calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "QuickTruckTax",
    logo: {
      "@type": "ImageObject",
      url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
    },
  },
};

export default function HvutCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CalculatorClient />
    </>
  );
}
