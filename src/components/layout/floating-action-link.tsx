import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * Átlátszó, úszó "design" gomb a képernyő alján középen — a háttérzene
 * vezérlőjével egy sorban. Kontextusfüggő műveletre mutat (kategóriák,
 * ajánlatkérés, szolgáltató chat).
 */
export function FloatingActionLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm px-4 py-2.5 text-sm font-semibold text-[#84AAA6] opacity-80 hover:opacity-100 hover:text-[#6B8E8A] transition-opacity"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      {label}
    </Link>
  );
}
