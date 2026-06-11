import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Cross-origin isolation — lets MediaPipe's threaded WASM use
        // SharedArrayBuffer. `credentialless` keeps the CDN-hosted model
        // and WASM (jsDelivr / Google Storage) loadable without CORP headers.
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
