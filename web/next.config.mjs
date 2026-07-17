/** @type {import('next').NextConfig} */
const nextConfig = {
  // kb/ lives outside web/ — tell Next it's fine to read it at build time
  outputFileTracingIncludes: {
    '/**': ['../kb/**/*'],
  },
};

export default nextConfig;
