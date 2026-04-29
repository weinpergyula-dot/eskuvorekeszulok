import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#C04C9B] text-white font-bold text-xs">
                EK
              </span>
              <span className="font-semibold text-gray-800">Esküvőre Készülök</span>
            </div>
            <p className="text-base text-gray-500">
              Találj meg mindent egy helyen a nagy napodra!
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Szolgáltatások</h3>
            <ul className="space-y-2">
              {[
                { href: "/services/fotosok-videosok", label: "Fotósok, Videósok" },
                { href: "/services/elo-zene-dj", label: "Élőzene, DJ" },
                { href: "/services/smink", label: "Smink" },
                { href: "/services/helyszin", label: "Helyszín" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base text-gray-500 hover:text-[#5a8480] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Hasznos linkek</h3>
            <ul className="space-y-2">
              {[
                { href: "/auth/register", label: "Regisztráció" },
                { href: "/auth/login", label: "Belépés" },
                { href: "/contact", label: "Kapcsolat" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base text-gray-500 hover:text-[#5a8480] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-base text-gray-400">
            © {new Date().getFullYear()} Esküvőre Készülök. Minden jog fenntartva.
          </p>
        </div>
      </div>
    </footer>
  );
}
