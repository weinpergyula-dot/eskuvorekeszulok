import type { Provider } from "@/lib/types";

/* A kiemelt szolgáltatók szintenkénti színei – a kártya és a részletes
   profil is ezt használja, hogy a kettő mindig egyezzen. */
/* Az arany szint arany kiemelést (#B8925A / #9E7A45) visel a halvány
   pezsgő (#F8F2E8) fejlécen. */
export function featuredStyle(featured: Provider["featured"]) {
  const tc = featured === "gold"
    ? { text: "text-[#B8925A]", textHover: "hover:text-[#9E7A45]", groupHover: "group-hover:text-[#B8925A]", border50: "border-[#B8925A]/50", bg10: "bg-[#B8925A]/10", hoverBg20: "hover:bg-[#B8925A]/20", bgFill: "bg-[#B8925A]", hoverBgFill: "hover:bg-[#9E7A45]", buttonText: "text-white", borderBase: "border-[#B8925A]/40", borderHover: "hover:border-[#B8925A]", badgeClass: "border-[#B8925A]/40 text-[#9E7A45] bg-white/70", featuredBadgeClass: "bg-[#B8925A] text-white border-[#B8925A]" }
    : featured === "silver"
    ? { text: "text-slate-500", textHover: "hover:text-slate-600", groupHover: "group-hover:text-slate-500", border50: "border-slate-300", bg10: "bg-slate-50", hoverBg20: "hover:bg-slate-100", bgFill: "bg-slate-500", hoverBgFill: "hover:bg-slate-600", buttonText: "text-white", borderBase: "border-slate-200", borderHover: "hover:border-slate-400", badgeClass: "border-slate-300 text-slate-500 bg-slate-50", featuredBadgeClass: "bg-slate-100 text-slate-600 border-slate-300" }
    : featured === "teal"
    ? { text: "text-[#84AAA6]", textHover: "hover:text-[#6B8E8A]", groupHover: "group-hover:text-[#84AAA6]", border50: "border-[#84AAA6]/50", bg10: "bg-[#84AAA6]/10", hoverBg20: "hover:bg-[#84AAA6]/20", bgFill: "bg-[#84AAA6]", hoverBgFill: "hover:bg-[#6B8E8A]", buttonText: "text-white", borderBase: "border-[#84AAA6]/40", borderHover: "hover:border-[#84AAA6]", badgeClass: "border-[#84AAA6]/40 text-[#5C8480] bg-[#EDF4F3]", featuredBadgeClass: "bg-[#EDF4F3] text-[#5C8480] border-[#84AAA6]/40" }
    : { text: "text-[#84AAA6]", textHover: "hover:text-[#6B8E8A]", groupHover: "group-hover:text-[#84AAA6]", border50: "border-[#84AAA6]/50", bg10: "bg-[#84AAA6]/10", hoverBg20: "hover:bg-[#84AAA6]/20", bgFill: "bg-[#84AAA6]", hoverBgFill: "hover:bg-[#6B8E8A]", buttonText: "text-white", borderBase: "border-gray-200", borderHover: "hover:border-[#84AAA6]", badgeClass: "", featuredBadgeClass: "" };
  const headerBg = featured === "gold" ? "#F8F2E8" : featured === "silver" ? "#F8FAFC" : featured === "teal" ? "#EDF4F3" : "#F0F6F5";
  /* Az értékelés üres csillagai a színes fejlécű kiemelt kártyákon fehérek;
     az ezüst fejléc szinte fehér, ott szürkék maradnak. */
  const emptyStar = featured && featured !== "silver" ? "fill-white text-white" : "fill-gray-200 text-gray-200";
  return { ...tc, headerBg, emptyStar };
}
