/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Keep your existing webpack config for backward compatibility 
       if you still plan to use 'next dev --webpack' or for production builds 
       until Turbopack fully supports your entire stack. */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // Turbopack specific configuration
  experimental: {
    turbopack: {
      rules: {
        // This mimics your webpack rule for SVG files
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

module.exports = nextConfig;
