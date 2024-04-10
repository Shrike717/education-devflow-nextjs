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

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     mdxRs: true,
//     serverComponentsExternalPackages: ["mongoose"],
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "*", // Right now we set a wildcard, but you can put the domain of your API here
//       },
//       {
//         protocol: "http",
//         hostname: "*", // Right now we set a wildcard, but you can put the domain of your API here
//       },
//     ],
//   },
//   async headers() {
//     return [
//       {
//         // matching all API routes
//         source: "/api/:path*",
//         headers: [
//           { key: "Access-Control-Allow-Origin", value: "*" },
//           { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
//           {
//             key: "Access-Control-Allow-Headers",
//             value: "Content-Type, Authorization",
//           },
//         ],
//       },
//     ];
//   },
// };

// module.exports = nextConfig;
