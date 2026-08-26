"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Standalone paths get NO site chrome (navbar/footer/announcement/cookie) —
// they render bare. The wedding site keeps its full layout everywhere else.
const BARE_PREFIXES = ["/trade", "/yettel_web", "/zso-es-szili", "/meghivo-silver"];

export function ConditionalChrome({
  announcement,
  navbar,
  footer,
  cookie,
  extras,
  children,
}: {
  announcement: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  cookie: ReactNode;
  extras?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const bare = BARE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (bare) return <>{children}</>;

  return (
    <>
      {announcement}
      {navbar}
      <main className="flex-1">{children}</main>
      {footer}
      {cookie}
      {extras}
    </>
  );
}
