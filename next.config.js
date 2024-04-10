/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*", // Right now we set a wildcard, but you can put the domain of your API here
      },
      {
        protocol: "http",
        hostname: "*", // Right now we set a wildcard, but you can put the domain of your API here
      },
    ],
  },
};

module.exports = nextConfig;
