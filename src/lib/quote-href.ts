import type { Provider } from "@/lib/types";

/* Az ajánlatkérő űrlap ezzel a szolgáltatóval előtöltve nyílik: a
   kategóriája és a megyéi ki vannak választva, ő maga pedig bejelölve a
   címzettek között. */
export function quoteHrefFor(provider: Pick<Provider, "id" | "categories" | "counties">): string {
  const params = new URLSearchParams({ tab: "quotes", szolgaltato: provider.id });
  if (provider.categories?.[0]) params.set("kategoria", provider.categories[0]);
  const counties = (provider.counties ?? []).filter((c) => c !== "Országosan");
  if (counties.length) params.set("megye", counties.join(","));
  return `/profil?${params}`;
}
