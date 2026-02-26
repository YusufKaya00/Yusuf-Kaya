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
};

export default nextConfig; 