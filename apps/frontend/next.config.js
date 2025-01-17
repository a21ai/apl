/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
  transpilePackages: [
    '@repo/arch-sdk',
    '@repo/apl-sdk',
  ],
}

module.exports = nextConfig
