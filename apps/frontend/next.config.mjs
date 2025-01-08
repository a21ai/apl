import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable new forbidden() and unauthorized() APIs
    authInterrupts: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  }
};

export default nextConfig;
