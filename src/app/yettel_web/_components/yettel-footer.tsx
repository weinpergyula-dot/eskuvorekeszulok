const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Termékek", links: ["Havidíjas mobil", "Feltöltőkártya", "Otthoni internet", "Yettel TV", "Készülékek"] },
  { title: "Ügyintézés", links: ["Belépés a fiókba", "Egyenlegfeltöltés", "Számlabefizetés", "SIM aktiválás", "Üzletkereső"] },
  { title: "Segítség", links: ["Ügyfélszolgálat", "Gyakori kérdések", "Lefedettségtérkép", "Hibabejelentés", "Kapcsolat"] },
  { title: "A Yettelről", links: ["Rólunk", "Karrier", "Fenntarthatóság", "Sajtószoba", "Yettel Zóna"] },
];

export function YettelFooter() {
  return (
    <footer className="border-t border-[#E6EAF2] bg-[#14245E]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-bold text-white">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#C4D1E1] transition-colors hover:text-[#C6F24E]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-extrabold tracking-tight text-white">Yettel</span>
            <span
              aria-hidden
              className="inline-block h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-[#C6F24E]"
            />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8DA0C9]">
            <a href="#" className="hover:text-white">Adatkezelés</a>
            <a href="#" className="hover:text-white">ÁSZF</a>
            <a href="#" className="hover:text-white">Cookie-beállítások</a>
            <a href="#" className="hover:text-white">Akadálymentesség</a>
            <span>© {new Date().getFullYear()} Yettel · Bemutató koncepció</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
