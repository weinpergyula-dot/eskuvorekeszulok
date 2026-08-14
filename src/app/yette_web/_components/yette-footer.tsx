const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Termékek", links: ["Havidíjas mobil", "Feltöltőkártya", "Otthoni internet", "Yette TV", "Készülékek"] },
  { title: "Ügyintézés", links: ["Belépés a fiókba", "Egyenlegfeltöltés", "Számlabefizetés", "SIM aktiválás", "Üzletkereső"] },
  { title: "Segítség", links: ["Ügyfélszolgálat", "Gyakori kérdések", "Lefedettségtérkép", "Hibabejelentés", "Kapcsolat"] },
  { title: "A Yette-ről", links: ["Rólunk", "Karrier", "Fenntarthatóság", "Sajtószoba", "Yette Zóna"] },
];

export function YetteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-bold text-gray-900">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 transition-colors hover:text-[#00875a]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#00a868] text-xs font-black text-white">
              y
            </span>
            <span className="text-sm font-extrabold tracking-tight text-gray-900">yette</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Adatkezelés</a>
            <a href="#" className="hover:text-gray-600">ÁSZF</a>
            <a href="#" className="hover:text-gray-600">Cookie-beállítások</a>
            <a href="#" className="hover:text-gray-600">Akadálymentesség</a>
            <span>© {new Date().getFullYear()} Yette · Bemutató koncepció</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
