"use server"

const PORT = process.env.PORT ?? 3001

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://localhost:3005";

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    // Post/course images are served as full-size originals from Vercel Blob
    // (up to ~1.3MB PNGs) — let Next.js resize/compress them on the fly
    // instead of shipping the raw file to every visitor. Also allowlist the
    // other external hosts next/image actually renders across the site:
    // YouTube/Vumbnail video thumbnails, and the Unsplash fallback images.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "vumbnail.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  webpack(config, { isServer }) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    }

    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"]
    }

    return config
  },

  async rewrites() {
    return [
      { source: "/api/reviews",       destination: `${API_PROXY_TARGET}/api/reviews` },
      { source: "/api/reviews/:path*",destination: `${API_PROXY_TARGET}/api/reviews/:path*` },

    ];
  },
};


export default nextConfig
