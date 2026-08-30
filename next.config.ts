import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* A /services oldal megszűnt: a szolgáltatói lista a főoldalon él.
     A szűrők (category, county) a query stringben automatikusan átmennek. */
  async redirects() {
    return [{ source: "/services", destination: "/#szolgaltatok", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
