/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // ----- Apex to www: easyucr.com → www.easyucr.com -----
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'easyucr.com' }],
        destination: 'https://www.easyucr.com/:path*',
        permanent: true,
      },
      // ----- UCR registration alias -----
      { source: '/ucr-registration', destination: '/services/ucr-registration', permanent: true },
      { source: '/ucr-registration/:path*', destination: '/services/ucr-registration/:path*', permanent: true },
      // ----- Redirect deleted non-UCR pages to UCR file -----
      { source: '/services/form-2290-filing', destination: '/ucr/file', permanent: true },
      { source: '/services/vin-correction', destination: '/ucr/file', permanent: true },
      { source: '/services/suspended-vehicle', destination: '/ucr/file', permanent: true },
      { source: '/services/agricultural-logging', destination: '/ucr/file', permanent: true },
      { source: '/services/mcs-150-update', destination: '/ucr/file', permanent: true },
      { source: '/services/mcs150-update', destination: '/ucr/file', permanent: true },
      { source: '/services/form-8849-refund', destination: '/ucr/file', permanent: true },
      { source: '/services/ifta-irp', destination: '/ucr/file', permanent: true },
      { source: '/services/ifta-filing', destination: '/ucr/file', permanent: true },
      { source: '/tools/check-2290-status', destination: '/ucr/file', permanent: true },
      { source: '/tools/hvut-calculator', destination: '/tools/ucr-calculator', permanent: true },
      { source: '/tools/ifta-calculator', destination: '/tools/ucr-calculator', permanent: true },
      { source: '/resources/2290-due-date', destination: '/ucr/file', permanent: true },
      { source: '/resources/2290-tax-directory', destination: '/ucr/file', permanent: true },
      { source: '/comparisons/vs-express-truck-tax', destination: '/ucr/file', permanent: true },
      { source: '/comparisons', destination: '/ucr/file', permanent: true },
      { source: '/insights/form-2290-vs-ucr-difference', destination: '/insights', permanent: true },
      // ----- HTTP → HTTPS -----
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.easyucr.com' },
          { type: 'header', key: 'x-forwarded-proto', value: 'http' },
        ],
        destination: 'https://www.easyucr.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
