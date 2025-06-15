/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Suppress dynamic require warning from Supabase Realtime
    config.module.exprContextCritical = false;
    return config;
  },
}

export default nextConfig
