/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  images: {
    unoptimized: true,
  },
  output: 'export', // Enables static exporting
};

module.exports = nextConfig;