/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing the shared workspace packages without pre-compilation.
  transpilePackages: ["@maxs/types", "@maxs/services"],
};
module.exports = nextConfig;
