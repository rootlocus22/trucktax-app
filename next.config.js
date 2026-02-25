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
      // ----- Phase 0: UCR & core service URL fixes (avoid 404s) -----
      { source: '/services/mcs150-update', destination: '/services/mcs-150-update', permanent: true },
      { source: '/services/mcs150-update/:path*', destination: '/services/mcs-150-update/:path*', permanent: true },
      { source: '/services/ifta-filing', destination: '/services/ifta-irp', permanent: true },
      { source: '/services/ifta-filing/:path*', destination: '/services/ifta-irp/:path*', permanent: true },
      { source: '/ucr-registration', destination: '/services/ucr-registration', permanent: true },
      { source: '/ucr-registration/:path*', destination: '/services/ucr-registration/:path*', permanent: true },
      // ----- Canonical: non-www → www -----
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'quicktrucktax.com' }],
        destination: 'https://www.quicktrucktax.com/:path*',
        permanent: true,
      },
      // ----- HTTP → HTTPS -----
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.quicktrucktax.com' },
          { type: 'header', key: 'x-forwarded-proto', value: 'http' },
        ],
        destination: 'https://www.quicktrucktax.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

