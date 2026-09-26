import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 80],
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/media/**" }, // fotos enviadas pelo painel (armazenamento local)
      { pathname: "/samples/**" }, // fotos de exemplo
      { pathname: "/brand/**" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }, // Vercel Blob
      { protocol: "https", hostname: "*.cdninstagram.com" }, // posts do Instagram (opcional)
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "40mb" }, // envio de várias fotos de uma vez no painel
  },
  poweredByHeader: false,
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
