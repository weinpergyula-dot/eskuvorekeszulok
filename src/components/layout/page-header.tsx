import { ArrowLeft, type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  icon?: LucideIcon;
  bgColor?: string;
  /** @deprecated use backHref instead */
  breadcrumb?: { label: string; href: string }[];
}

export function PageHeader({ title, description, backHref, icon: Icon, bgColor = "#84AAA6" }: PageHeaderProps) {
  return (
    <>
      <div className="w-full border-b border-white/20" style={{ backgroundColor: bgColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>

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
