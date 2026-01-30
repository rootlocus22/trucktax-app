/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // Redirect non-www to www (both HTTP and HTTPS)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'quicktrucktax.com',
          },
        ],
        destination: 'https://www.quicktrucktax.com/:path*',
        permanent: true,
      },
      // Redirect HTTP www to HTTPS www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.quicktrucktax.com',
          },
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.quicktrucktax.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

