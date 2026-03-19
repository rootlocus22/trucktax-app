/** Features landing is a client page — metadata must live in layout. */
export const metadata = {
  title: 'EasyUCR Features — UCR Filing Tools & Compliance | EasyUCR',
  description:
    'Explore EasyUCR features for guided UCR filing, fee calculation, USDOT-aligned brackets, and secure checkout.',
  alternates: {
    canonical: 'https://www.easyucr.com/features',
  },
  robots: { index: true, follow: true },
};

export default function FeaturesLayout({ children }) {
  return children;
}
