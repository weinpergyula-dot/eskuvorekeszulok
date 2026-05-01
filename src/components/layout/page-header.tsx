interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
}

export function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <div className="w-full border-b border-white/20" style={{ backgroundColor: "#84AAA6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="text-lg text-white/70 mb-2">
            {breadcrumb.map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2">/</span>}
                <a href={item.href} className="hover:underline hover:text-white">
                  {item.label}
                </a>
              </span>
            ))}
            <span className="mx-2">/</span>
            <span className="text-white">{title}</span>
          </nav>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        {description && (
          <>
            <hr className="border-white/30 mt-5 mb-4" />
            <p className="text-base text-white leading-relaxed">{description}</p>
          </>
        )}
      </div>
    </div>
  );
}
