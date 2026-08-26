import { ArrowLeft, type LucideIcon } from "lucide-react";
import { StickyCta } from "./sticky-cta";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
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

export function PageHeader({ title, description, backHref, icon: Icon, bgColor = "#84AAA6", ctaLabel, ctaHref, roundedBottom = true, bottomBg = "#ffffff" }: PageHeaderProps) {
  return (
    <>
      <div
        className={`w-full -mt-6 ${bgColor === "#84AAA6" ? "teal-shift-bg" : ""}`}
        style={bgColor === "#84AAA6" ? undefined : { backgroundColor: bgColor }}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${ctaLabel && ctaHref ? "pt-14 pb-6" : "pt-14 pb-8"}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            {Icon && <Icon className="h-7 w-7 text-white/80 shrink-0" strokeWidth={1.5} />}
            {title}
          </h1>
          {description && (
            <>
              <hr className="border-white/30 mt-5 mb-4" />
              <p className="text-base text-white leading-relaxed">{description}</p>
            </>
          )}
        </div>
        {/* CTA nélkül a sáv alja: fehér, felül lekerekített sapka – a teal
            így a sarkoknál lefelé kerekedik */}
        {roundedBottom && !(ctaLabel && ctaHref) && (
          <div className="h-6 rounded-t-3xl" style={{ backgroundColor: bottomBg }} aria-hidden />
        )}
      </div>

      {/* CTA sora — a navbar alá tapad scrollozáskor (sticky); a gomb feletti és
          alatti hely közel azonos, a fölötte lévő elválasztó nélkül. Scrollozáskor
          a háttere minimálisan áttetszővé válik, mint a header. */}
      {ctaLabel && ctaHref && (
        <>
          <StickyCta label={ctaLabel} href={ctaHref} bgColor={bgColor} />
          {/* A CTA-sor alatti, lefelé kerekedő átmenet (nem sticky) */}
          {roundedBottom && (
            <div
              className={bgColor === "#84AAA6" ? "teal-shift-bg" : ""}
              style={bgColor === "#84AAA6" ? undefined : { backgroundColor: bgColor }}
              aria-hidden
            >
              <div className="h-6 rounded-t-3xl" style={{ backgroundColor: bottomBg }} />
            </div>
          )}
        </>
      )}

      {backHref && (
        <div className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <a
              href={backHref}
              className="inline-flex items-center gap-1.5 text-[15px] font-medium transition-colors"
              style={{ color: "#84AAA6" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Vissza
            </a>
          </div>
        </div>
      )}
    </>
  );
}
