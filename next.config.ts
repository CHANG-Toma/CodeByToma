import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: ["pdfkit", "@prisma/client", "bcryptjs"],
};

export default nextConfig;
