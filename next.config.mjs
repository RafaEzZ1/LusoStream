/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Isto desliga a otimização da Vercel e resolve o erro do limite
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;