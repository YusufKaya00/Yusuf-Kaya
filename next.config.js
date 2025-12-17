// next.config.js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
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

module.exports = nextConfig;
