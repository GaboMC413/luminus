const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    outputFileTracingIncludes: {
      "/**": [
        "../../node_modules/.prisma/client/**/*",
        "../../node_modules/@prisma/client/**/*",
      ],
    },
  },
};

module.exports = nextConfig;
