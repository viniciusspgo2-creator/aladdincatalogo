import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      // marca Ziggy foi fundida com ZGY Brasil (mesma marca)
      { source: '/marca/ziggy', destination: '/marca/zgy-brasil', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'arquivos.mercos.com' },
      { protocol: 'https', hostname: 'thumbnails.meuspedidos.com.br' },
      { protocol: 'https', hostname: 'arquivos.mercosusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
