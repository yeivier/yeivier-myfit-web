import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pnpm's nested node_modules layout makes Next.js's serverless file
  // tracing miss Prisma's native query engine binary, which crashes every
  // Prisma call at runtime ("could not locate the Query Engine"). Force it
  // to be included in the bundled function.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
  },
};

export default nextConfig;
