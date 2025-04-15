/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: false
  },
  async rewrites() {
    return [
      {
        source: '/api/webhook',
        destination: '/api/webhook/',
      }
    ];
  }
};

export default nextConfig;
