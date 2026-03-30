/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.producthunt.com' },
    ],
  },
}

export default nextConfig
