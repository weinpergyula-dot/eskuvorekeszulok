import Link from "next/link";
import Image from "next/image";
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
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 footer-inner">

        {/* Felső rész középre zárva: logó, szlogen, desktopon a kategóriák egy
            sorban — mobil chat módban rejtett */}
        <div className="footer-full-content mb-5 flex flex-col items-center gap-2 text-center">
          <Image src="/logo.png" alt="Esküvőre Készülök" width={290} height={72} quality={100} className="h-9 w-auto" />
          <p className="text-base leading-snug text-gray-900">
            Találj meg mindent egy helyen a nagy napodra!
          </p>
          <ul className="mt-1 hidden md:flex flex-wrap justify-center gap-x-1 gap-y-0.5">
            {footerCategories.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[15px] leading-snug text-gray-900 px-2 py-0.5 rounded-md hover:bg-[#F0F6F5] transition-colors">
                  {item.label}{counts[item.key] != null && (
                    <span className="ml-1 text-gray-400 font-normal">({counts[item.key]})</span>
                  )}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#szolgaltatok" className="text-[15px] leading-snug text-[#84AAA6] px-2 py-0.5 rounded-md hover:bg-[#F0F6F5] transition-colors">
                Még több...
              </Link>
            </li>
          </ul>
        </div>

        {/* Chat mode: compact logo (centered) — hidden normally, shown in mobile chat mode */}
        <div className="footer-chat-logo hidden mb-4 justify-center">
          <Image src="/logo.png" alt="Esküvőre Készülök" width={290} height={72} quality={100} className="h-8 w-auto" />
        </div>

        {/* Copyright — always visible, középre zárva, szűk sortávval */}
        <div className="border-t border-gray-200 pt-4 flex flex-col items-center gap-1 text-center">
          <p className="text-sm leading-snug text-gray-900">
            © {new Date().getFullYear()} Esküvőre Készülök. Minden jog fenntartva.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-sm leading-snug text-gray-500">
            <Link href="/privacy" className="hover:text-[#84AAA6] transition-colors">Adatvédelmi tájékoztató</Link>
            <Link href="/terms" className="hover:text-[#84AAA6] transition-colors">ÁSZF</Link>
            <Link href="/cookies" className="hover:text-[#84AAA6] transition-colors">Cookie szabályzat</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
