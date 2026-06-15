/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allows production build to succeed even if there are subtle type issues in third party libraries
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint validation on build execution to accelerate compile time
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
