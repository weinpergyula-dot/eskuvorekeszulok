import { ArrowLeft, type LucideIcon } from "lucide-react";
import { BackLink } from "./back-link";
import { StickyCta } from "./sticky-cta";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  /** A Vissza gomb célja, ha a listázás nem küldött `from` paramétert. */
  backFallbackHref?: string;
  icon?: LucideIcon;
  bgColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Lefelé kerekedő átmenet a sáv alján. Kikapcsolható ott, ahol a
      CTA-sorral együtt nem mutat jól. */
  roundedBottom?: boolean;
  /** Az átmenet színe – a sáv alatt következő szekció háttere
      (alapértelmezés: fehér). */
  bottomBg?: string;
  /** @deprecated use backHref instead */
  breadcrumb?: { label: string; href: string }[];
}

export function PageHeader({ title, description, backHref, backFallbackHref, icon: Icon, ctaLabel, ctaHref }: PageHeaderProps) {
  /* Új dizájn: nincs színes sáv – a cím közvetlenül az alkonyati háttéren
     ül, mellette rózsaszín ikon-kapszula; a Vissza gomb üveg kapszula. */
  return (
    <>
      <div className="page-header w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1 sm:pt-8 sm:pb-2">
          {(backHref || backFallbackHref) && (
            <div className="mb-4">
              {backFallbackHref ? (
                <BackLink fallbackHref={backFallbackHref} />
              ) : (
                <a href={backHref} className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14px] font-semibold text-[#1F1A2E]">
                  <ArrowLeft className="h-4 w-4" />
                  Vissza
                </a>
              )}
            </div>
          )}
          <h1 className="font-heading font-extrabold tracking-tight text-[#1F1A2E] text-[28px] md:text-[40px] leading-tight flex items-center gap-3">
            {Icon && (
              <span className="rose-cta flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl">
                <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} />
              </span>
            )}
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-3xl text-[16px] md:text-[17px] text-[#6B6480] leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {ctaLabel && ctaHref && <StickyCta label={ctaLabel} href={ctaHref} bgColor="#E8336A" />}
    </>
  );
}
