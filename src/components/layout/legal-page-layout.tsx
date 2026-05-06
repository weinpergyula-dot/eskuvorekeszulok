import Link from "next/link";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-base text-gray-500 mb-10">Utolsó frissítés: {lastUpdated}</p>
      <div className="prose-legal">{children}</div>
      <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-base text-gray-500">
        <Link href="/privacy" className="hover:text-[#84AAA6]">Adatvédelmi tájékoztató</Link>
        <Link href="/terms" className="hover:text-[#84AAA6]">ÁSZF</Link>
        <Link href="/cookies" className="hover:text-[#84AAA6]">Cookie szabályzat</Link>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function LegalSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      {children}
    </div>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-gray-700 leading-relaxed mb-3">{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-inside space-y-1 text-base text-gray-700 mb-3 pl-2">{children}</ul>;
}

export function LegalTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-base text-left border border-gray-200 rounded-xl overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 font-semibold text-gray-900 border-b border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-gray-700 border-b border-gray-100">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#84AAA6]/10 border border-[#84AAA6]/30 rounded-xl px-4 py-3 mb-4 text-base text-gray-700">
      {children}
    </div>
  );
}
