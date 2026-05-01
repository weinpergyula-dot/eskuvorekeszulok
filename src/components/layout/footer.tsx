import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo2.png" alt="Esküvőre Készülök" width={290} height={72} quality={100} className="h-9 w-auto" />
              <span className="font-semibold text-gray-900">Esküvőre Készülök</span>
            </div>
            <p className="text-base text-gray-900">
              Találj meg mindent egy helyen a nagy napodra!
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Szolgáltatások</h3>
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
                    className="text-base text-gray-900 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Hasznos linkek</h3>
            <ul className="space-y-2">
              {[
                { href: "/auth/register", label: "Regisztráció" },
                { href: "/auth/login", label: "Bejelentkezés" },
                { href: "/contact", label: "Kapcsolat" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base text-gray-900 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-base text-gray-900">
            © {new Date().getFullYear()} Esküvőre Készülök. Minden jog fenntartva.
          </p>
        </div>
      </div>
    </footer>
  );
}
