import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ProvidersContent } from "@/components/providers/providers-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { Briefcase } from "lucide-react";
import type { Provider } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Esküvői szolgáltatók",
  description: "Böngészd az összes esküvői szolgáltatót egy helyen – fotósok, zenészek, vőfélyek, helyszínek, torták és még sok más. Szűrj kategória és megye szerint.",
  alternates: { canonical: "https://eskuvorekeszulok.hu/services" },
};

export default async function ServicesPage() {
  let providers: Provider[] = [];
  const categoryCounts: Record<string, number> = {};

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("approval_status", "approved")
      .or("active.is.null,active.eq.true")
      .order("created_at", { ascending: false });

    const raw = (data as Provider[]) ?? [];

    // Category counts (over unique providers)
    for (const p of raw) {
      for (const c of (p.categories as string[] | undefined) ?? []) {
        categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
      }
    }

    // Live review aggregates
    const ids = raw.map((p) => p.id);
    const { data: reviewRows } = ids.length > 0
      ? await supabase.from("reviews").select("provider_id, rating").in("provider_id", ids)
      : { data: [] };

    const statsMap: Record<string, { count: number; sum: number }> = {};
    for (const r of reviewRows ?? []) {
      if (!statsMap[r.provider_id]) statsMap[r.provider_id] = { count: 0, sum: 0 };
      statsMap[r.provider_id].count++;
      statsMap[r.provider_id].sum += r.rating;
    }

    providers = raw.map((p) => {
      const s = statsMap[p.id];
      return s
        ? { ...p, review_count: s.count, average_rating: Math.round((s.sum / s.count) * 10) / 10 }
        : { ...p, review_count: 0, average_rating: 0 };
    });
  } catch (e) {
    console.error("Supabase error:", e);
  }

  return (
    <div>
      <PageHeader
        icon={Briefcase}
        title="Szolgáltatók"
        description="Böngészd az összes esküvői szolgáltatót – szűrj kategória és megye szerint, és nézd meg az értékeléseket."
        ctaLabel="Csoportos / Egyéni ajánlatkérés"
        ctaHref="/profil?tab=quotes"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Suspense>
          <ProvidersContent providers={providers} categoryCounts={categoryCounts} />
        </Suspense>
      </div>
    </div>
  );
}
