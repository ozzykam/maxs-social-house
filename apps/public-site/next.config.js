/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@maxs/types", "@maxs/services"],
  images: {
    // Firebase Storage public URLs
    remotePatterns: [{ protocol: "https", hostname: "firebasestorage.googleapis.com" }],
  },
};
module.exports = nextConfig;
