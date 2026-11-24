"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Home, Heart, MessageCircle, CircleUser, Briefcase, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/* Mobilos, lebegő üveg navigációs sáv a képernyő alján, középen kiemelt
   rózsaszín gombbal (Ajánlatkérés) – a videós referencia tab barja.
   A szolgáltatói profil oldalán nem jelenik meg: ott a saját, alsó
   ajánlatkérő sáv ül ugyanezen a helyen. */
const HIDDEN_PREFIXES = ["/providers/", "/auth", "/admin"];

interface Props {
  signedIn: boolean;
  isProvider: boolean;
  unread: number;
  avatarUrl: string | null;
}

export function MobileTabBar(props: Props) {
  return (
    <Suspense fallback={null}>
      <TabBarInner {...props} />
    </Suspense>
  );
}

function TabBarInner({ signedIn, isProvider, unread, avatarUrl }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    document.body.classList.toggle("has-tabbar", !hidden);
    return () => document.body.classList.remove("has-tabbar");
  }, [hidden]);

  if (hidden) return null;

  const tab = pathname === "/profil" ? params.get("tab") : null;
  const gate = (href: string) => (signedIn ? href : `/auth/login?next=${encodeURIComponent(href)}`);

  const items = [
    { key: "home", label: "Főoldal", href: "/", Icon: Home, active: pathname === "/" },
    isProvider
      ? { key: "provider", label: "Profilom", href: "/profil?tab=provider", Icon: Briefcase, active: tab === "provider" }
      : { key: "favorites", label: "Kedvencek", href: gate("/profil?tab=favorites"), Icon: Heart, active: tab === "favorites" },
    null,
    { key: "chat", label: "Üzenetek", href: gate("/profil?tab=chat"), Icon: MessageCircle, active: tab === "chat", badge: unread },
    { key: "account", label: "Fiók", href: gate("/profil?tab=account"), Icon: CircleUser, active: tab === "account", avatar: avatarUrl },
  ];

  return (
    <nav
      aria-label="Fő navigáció"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <div className="glass-strong relative mx-auto flex h-[68px] max-w-md items-center justify-around rounded-[30px] px-2">
        {items.map((it) =>
          it === null ? (
            <Link
              key="fab"
              href={gate("/profil?tab=quotes")}
              aria-label="Ajánlatkérés"
              className="rose-cta -mt-9 flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full ring-[5px] ring-white/80"
            >
              <Send className="h-6 w-6 -translate-x-px translate-y-px" strokeWidth={2.2} />
            </Link>
          ) : (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "relative flex w-16 flex-col items-center gap-0.5 text-[11px] font-medium transition-colors",
                it.active ? "text-[#E8336A]" : "text-[#6B6480]"
              )}
            >
              {"avatar" in it && it.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.avatar} alt="" className={cn("h-6 w-6 rounded-full object-cover", it.active && "ring-2 ring-[#E8336A]")} />
              ) : (
                <it.Icon className={cn("h-6 w-6", it.active && "fill-[#E8336A]/15")} strokeWidth={it.active ? 2.2 : 1.8} />
              )}
              {it.label}
              {"badge" in it && (it.badge ?? 0) > 0 && (
                <span className="absolute -top-1 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E8336A] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {it.badge! > 99 ? "99+" : it.badge}
                </span>
              )}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
