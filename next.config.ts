import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "maxtuero.thenightowl.team" },
      { protocol: "https", hostname: "backend.expoviviendas.com" },
      { protocol: "https", hostname: "d2c6uubg0k03va.cloudfront.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;