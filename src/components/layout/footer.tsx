import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS } from "@/lib/types";
import { displayCount, HOUSE_CATEGORY, orderedCategories } from "@/lib/categories";

export async function Footer() {
  const counts: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("providers").select("categories").eq("approval_status", "approved").or("active.is.null,active.eq.true");
    for (const p of data ?? []) {
      for (const cat of (p.categories ?? []) as string[]) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
  } catch { /* non-critical */ }

  const footerCategories = orderedCategories(counts)
    .filter((key) => key === HOUSE_CATEGORY || displayCount(key, counts) > 0)
    .slice(0, 5)
    .map((key) => ({ href: `/?category=${key}#szolgaltatok`, key, label: CATEGORY_LABELS[key] }));
  return (
    <footer className="mt-auto px-3 pb-4 sm:px-5 sm:pb-6">
      <div className="glass max-w-7xl mx-auto rounded-[30px] px-5 sm:px-8 py-8 footer-inner">

        {/* Full 3-column grid — hidden in mobile chat mode */}
        <div className="footer-full-content grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BrandLogo />
            </div>
            <p className="text-base text-[#6B6480]">
              Találj meg mindent egy helyen a nagy napodra!
            </p>
          </div>

          <div className="hidden md:block">
            <h3 className="text-base font-semibold text-[#1F1A2E] mb-3">Kategóriák</h3>
            <ul className="space-y-2">
              {footerCategories.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base text-[#1F1A2E] px-2 py-0.5 rounded-md hover:bg-white/70 transition-colors">
                    {item.label}{counts[item.key] != null && (
                      <span className="ml-1 text-gray-400 font-normal">({counts[item.key]})</span>
                    )}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#szolgaltatok" className="text-base text-[#E8336A] px-2 py-0.5 rounded-md hover:bg-white/70 transition-colors">
                  Még több...
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#1F1A2E] mb-3">Hasznos linkek</h3>
            <ul className="space-y-2">
              {[
                { href: "/auth/login", label: "Bejelentkezés" },
                { href: "/auth/register", label: "Regisztráció" },
                { href: "/informaciok", label: "Információk" },
                { href: "/#szolgaltatok", label: "Szolgáltatók" },
                { href: "/kapcsolat", label: "Kapcsolat" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base text-[#1F1A2E] px-2 py-0.5 rounded-md hover:bg-white/70 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chat mode: compact logo (centered) — hidden normally, shown in mobile chat mode */}
        <div className="footer-chat-logo hidden mb-6 justify-center">
          <BrandLogo compact />
        </div>

        {/* Copyright — always visible */}
        <div className="border-t border-[#1F1A2E]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#6B6480]">
            © {new Date().getFullYear()} Esküvőre Készülök. Minden jog fenntartva.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-[#6B6480]">
            <Link href="/privacy" className="hover:text-[#E8336A] transition-colors">Adatvédelmi tájékoztató</Link>
            <Link href="/terms" className="hover:text-[#E8336A] transition-colors">ÁSZF</Link>
            <Link href="/cookies" className="hover:text-[#E8336A] transition-colors">Cookie szabályzat</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
