/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
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
    ];
  },
};

module.exports = nextConfig;

