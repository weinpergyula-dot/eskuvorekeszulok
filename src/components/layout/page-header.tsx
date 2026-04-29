interface PageHeaderProps {
  title: string;
  breadcrumb?: { label: string; href: string }[];
}

export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  return (
    <div className="w-full bg-gradient-to-br from-[#2a9d8f]/20 to-[#2a9d8f]/5 border-b border-[#2a9d8f]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="text-base text-[#2a9d8f]/80 mb-2">
            {breadcrumb.map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                <a href={item.href} className="hover:text-[#2a9d8f]">
                  {item.label}
                </a>
              </span>
            ))}
            <span className="mx-1">/</span>
            <span className="text-[#1e7268] font-medium">{title}</span>
          </nav>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-[#1e7268]">{title}</h1>
      </div>
    </div>
  );
}
