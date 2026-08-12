const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    outputFileTracingIncludes: {
      "/**": [
        "./node_modules/.prisma/client/**/*",
        "./node_modules/@prisma/client/**/*",
      ],
    },
  },
};

module.exports = nextConfig
