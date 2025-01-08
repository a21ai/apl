/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable new forbidden() and unauthorized() APIs
    authInterrupts: true
  }
};

export default nextConfig;
