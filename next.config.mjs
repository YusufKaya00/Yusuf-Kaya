/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript type checking during production build
  typescript: {
    // !! WARN !!
    // This allows production builds to successfully complete even if
    // your project has TypeScript errors
    ignoreBuildErrors: true,
  },
  // Disable ESLint during production build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  experimental: {
    // Bellek kullanımını optimize etmek için
    memoryBasedWorkersCount: true,
    optimizePackageImports: ['framer-motion'],
  },
  // Resim optimizasyonu
  images: {
    deviceSizes: [640, 768, 1024, 1280],
    imageSizes: [16, 32, 64, 96],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  // Sunucu yükünü azaltmak için
  compress: true,
  poweredByHeader: false,
};

export default nextConfig; 