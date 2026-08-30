import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://eskuvorekeszulok.hu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/informaciok`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/kapcsolat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let providerPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("providers")
      .select("id, updated_at")
      .eq("approval_status", "approved")
      .or("active.is.null,active.eq.true");
    providerPages = (data ?? []).map((p) => ({
      url: `${BASE}/providers/${p.id}`,
      lastModified: new Date(p.updated_at ?? new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // silently ignore
  }

  return [...staticPages, ...providerPages];
}
