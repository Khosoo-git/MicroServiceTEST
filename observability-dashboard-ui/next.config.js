/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://service-registry-api:8085/api/services/:path*',
      },
    ]
  },
}

module.exports = nextConfig
