const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stops Next.js from scanning the Windows user-home lockfile as project root
  // (it finds C:\Users\azizk\package-lock.json and traverses everything under it).
  outputFileTracingRoot: path.join(__dirname, "../../"),
  reactStrictMode: true,
  // Allow importing the shared workspace packages without pre-compilation.
  transpilePackages: ["@maxs/types", "@maxs/services"],
};
module.exports = nextConfig;
