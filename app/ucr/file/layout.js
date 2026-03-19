/**
 * Metadata for the filing flow (page is a client component).
 * Ensures correct canonical / title for Google (not inherited from a wrong global canonical).
 */
export const metadata = {
  title: 'File UCR Online — 2026 Registration & Renewal | EasyUCR',
  description:
    'Complete your UCR registration online: verify USDOT, see government + service fee before checkout, and get your certificate in your dashboard.',
  alternates: {
    canonical: 'https://www.easyucr.com/ucr/file',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UcrFileLayout({ children }) {
  return children;
}
