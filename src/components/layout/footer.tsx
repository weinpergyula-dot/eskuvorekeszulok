import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

export async function Footer() {
  let counts: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("providers").select("categories").eq("approval_status", "approved").or("active.is.null,active.eq.true");
    for (const p of data ?? []) {
      for (const cat of (p.categories ?? []) as string[]) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
  } catch { /* non-critical */ }

  const footerCategories = (Object.keys(CATEGORY_LABELS) as ServiceCategory[])
    .filter((key) => (counts[key] ?? 0) > 0)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, 5)
    .map((key) => ({ href: `/?category=${key}#szolgaltatok`, key, label: CATEGORY_LABELS[key] }));
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 footer-inner">

        {/* Full 3-column grid — hidden in mobile chat mode */}
        <div className="footer-full-content grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo.png" alt="Esküvőre Készülök" width={290} height={72} quality={100} className="h-9 w-auto" />
            </div>
            <p className="text-base text-gray-900">
              Találj meg mindent egy helyen a nagy napodra!
            </p>
          </div>

          <div className="hidden md:block">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Kategóriák</h3>
            <ul className="space-y-2">
              {footerCategories.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base text-gray-900 px-2 py-0.5 rounded-md hover:bg-[#F0F6F5] transition-colors">
                    {item.label}{counts[item.key] != null && (
                      <span className="ml-1 text-gray-400 font-normal">({counts[item.key]})</span>
                    )}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#szolgaltatok" className="text-base text-[#84AAA6] px-2 py-0.5 rounded-md hover:bg-[#F0F6F5] transition-colors">
                  Még több...
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Hasznos linkek</h3>
            <ul className="space-y-2">
              {[
                { href: "/auth/login", label: "Bejelentkezés" },
                { href: "/auth/register", label: "Regisztráció" },
                { href: "/informaciok", label: "Információk" },
                { href: "/#szolgaltatok", label: "Szolgáltatók" },
                { href: "/kapcsolat", label: "Kapcsolat" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base text-gray-900 px-2 py-0.5 rounded-md hover:bg-[#F0F6F5] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chat mode: compact logo (centered) — hidden normally, shown in mobile chat mode */}
        <div className="footer-chat-logo hidden mb-6 justify-center">
          <Image src="/logo.png" alt="Esküvőre Készülök" width={290} height={72} quality={100} className="h-8 w-auto" />
        </div>

        {/* Copyright — always visible */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-base text-gray-900">
            © {new Date().getFullYear()} Esküvőre Készülök. Minden jog fenntartva.
          </p>
          <div className="flex flex-wrap gap-4 text-base text-gray-500">
            <Link href="/privacy" className="hover:text-[#84AAA6] transition-colors">Adatvédelmi tájékoztató</Link>
            <Link href="/terms" className="hover:text-[#84AAA6] transition-colors">ÁSZF</Link>
            <Link href="/cookies" className="hover:text-[#84AAA6] transition-colors">Cookie szabályzat</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
