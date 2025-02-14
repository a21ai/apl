import webpack from "webpack";
import nextra from "nextra";

const withNextra = nextra({});

/** @type {import('next').NextConfig} */
const nextConfig = withNextra({
  experimental: {
    // Enable new forbidden() and unauthorized() APIs
    authInterrupts: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        fs: false,
        path: false,
        os: false,
      };

      config.resolve.alias = {
        ...config.resolve.alias,
        "node:crypto": false,
        "node:stream": false,
        "node:buffer": false,
        "node:util": false,
        "node:assert": false,
        "node:fs": false,
        "node:path": false,
        "node:os": false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        })
      );

      // Ensure proper handling of ESM modules
      config.module = {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      };
    }
    return config;
  },
});

export default nextConfig;
