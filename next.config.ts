import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // RainbowKit's bundled Coinbase/Base Account connector pulls in
      // @coinbase/cdp-sdk, which does dynamic imports for optional x402
      // payment packages that don't exist and aren't needed for this app.
      "@x402/core": "./stubs/empty-module.js",
      "@x402/core/client": "./stubs/empty-module.js",
      "@x402/evm": "./stubs/empty-module.js",
      "@x402/evm/exact/client": "./stubs/empty-module.js",
      "@x402/evm/upto/client": "./stubs/empty-module.js",
      "@x402/svm": "./stubs/empty-module.js",
      "@x402/svm/exact/client": "./stubs/empty-module.js",
    },
  },
};

export default nextConfig;
