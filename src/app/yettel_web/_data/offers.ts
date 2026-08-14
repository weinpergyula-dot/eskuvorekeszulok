// Kiemelt ajánlatok adatai a Yettel bemutató főoldalhoz.
// Az árak tájékoztató jellegűek, egy letisztult bemutató (redesign) koncepcióhoz.

export type OfferCategory = "havidijas" | "net" | "tv" | "csomag";

export type Offer = {
  id: string;
  name: string;
  tagline: string;
  /** Havi ár Ft-ban (online kedvezménnyel). */
  price: number;
  /** Áthúzott, kedvezmény előtti ár – opcionális. */
  oldPrice?: number;
  unit: string; // pl. "Ft/hó"
  features: string[];
  /** Kiemelt "legjobb választás" kártya. */
  best?: boolean;
  /** Rövid, a fejlécen megjelenő címke. */
  badge?: string;
  cta: string;
};

export const OFFER_TABS: { id: OfferCategory; label: string; hint: string; soon?: boolean }[] = [
  { id: "havidijas", label: "Havidíjas mobil", hint: "Korlátlan hívás, 5G net" },
  { id: "net", label: "Otthoni internet", hint: "Optikai & 5G, Wi‑Fi 6" },
  { id: "tv", label: "Yettel TV", hint: "Élő adás & felvétel" },
  { id: "csomag", label: "Internet + TV", hint: "Csomagban, egy számlán", soon: true },
];

export const OFFERS: Record<OfferCategory, Offer[]> = {
  havidijas: [
    {
      id: "mobil-s",
      name: "Yettel S",
      tagline: "A hétköznapokra",
      price: 2990,
      oldPrice: 3490,
      unit: "Ft/hó",
      features: ["Korlátlan hívás és SMS", "10 GB adat", "5G hálózat", "EU-roaming alap"],
      cta: "Megrendelem",
    },
    {
      id: "mobil-m",
      name: "Yettel M",
      tagline: "A legtöbbek választása",
      price: 4490,
      oldPrice: 4990,
      unit: "Ft/hó",
      features: [
        "Korlátlan hívás és SMS",
        "30 GB adat + éjszakai korlátlan",
        "5G hálózat",
        "EU-roaming benne",
      ],
      best: true,
      badge: "Legnépszerűbb",
      cta: "Megrendelem",
    },
    {
      id: "mobil-l",
      name: "Yettel L",
      tagline: "Ha semmi sem foghat vissza",
      price: 5990,
      unit: "Ft/hó",
      features: [
        "Korlátlan hívás és SMS",
        "Korlátlan adat, sávkorlát nélkül",
        "5G prémium sebesség",
        "EU + Nyugat-Balkán roaming",
      ],
      cta: "Megrendelem",
    },
  ],
  net: [
    {
      id: "net-300",
      name: "Net 300",
      tagline: "Otthoni alap",
      price: 5990,
      unit: "Ft/hó",
      features: ["300 Mbit/s letöltés", "Adatkorlát nélkül", "Wi‑Fi 6 router ajándékba", "Optikai vagy 5G"],
      cta: "Igénylem",
    },
    {
      id: "net-500",
      name: "Net 500",
      tagline: "Család & home office",
      price: 6990,
      oldPrice: 7990,
      unit: "Ft/hó",
      features: [
        "500 Mbit/s letöltés",
        "Adatkorlát nélkül",
        "Wi‑Fi 6 router + jelerősítő",
        "Ingyenes bekötés",
      ],
      best: true,
      badge: "Legjobb ár‑érték",
      cta: "Igénylem",
    },
    {
      id: "net-1000",
      name: "Net 1000",
      tagline: "Gamer & streamer",
      price: 8990,
      unit: "Ft/hó",
      features: ["1000 Mbit/s letöltés", "Alacsony késleltetés", "Wi‑Fi 6 mesh csomag", "Kiemelt támogatás"],
      cta: "Igénylem",
    },
  ],
  tv: [
    {
      id: "tv-alap",
      name: "TV Alap",
      tagline: "A kedvencek",
      price: 3490,
      unit: "Ft/hó",
      features: ["60+ csatorna", "4 eszközön nézhető", "20 óra felhőfelvétel", "MyTV app"],
      cta: "Előfizetek",
    },
    {
      id: "tv-extra",
      name: "TV Extra",
      tagline: "Sport, film, sorozat",
      price: 4990,
      oldPrice: 5490,
      unit: "Ft/hó",
      features: [
        "120+ csatorna",
        "Sport & prémium film csomag",
        "100 óra felvétel",
        "Visszatekerés 7 napra",
      ],
      best: true,
      badge: "Ajánljuk",
      cta: "Előfizetek",
    },
    {
      id: "tv-premium",
      name: "TV Prémium",
      tagline: "Minden, 4K-ban",
      price: 6990,
      unit: "Ft/hó",
      features: ["180+ csatorna", "Összes prémium csomag", "4K + 200 óra felvétel", "Egyszerre 6 eszköz"],
      cta: "Előfizetek",
    },
  ],
  csomag: [
    {
      id: "csomag-otthon",
      name: "Otthon csomag",
      tagline: "Net + TV egy számlán",
      price: 10990,
      oldPrice: 11980,
      unit: "Ft/hó",
      features: ["Net 500", "TV Extra", "Egy közös számla", "Havi 990 Ft megtakarítás"],
      cta: "Összeállítom",
    },
    {
      id: "csomag-teljes",
      name: "Teljes csomag",
      tagline: "Net + TV + mobil",
      price: 14990,
      oldPrice: 17470,
      unit: "Ft/hó",
      features: [
        "Net 500 + TV Extra + Yettel M",
        "Havi ~2 480 Ft megtakarítás",
        "Egy számla, egy ügyfélszolgálat",
        "Hűségidő 12 hónap",
      ],
      best: true,
      badge: "Legtöbbet spórolsz",
      cta: "Összeállítom",
    },
    {
      id: "csomag-mobil-plusz",
      name: "Mobil + eszköz",
      tagline: "Új telefon részletre",
      price: 12480,
      unit: "Ft/hó",
      features: ["Yettel L előfizetés", "Telefon 0 Ft előleggel", "24 havi részlet", "Bármikor bővíthető"],
      cta: "Összeállítom",
    },
  ],
};

export type Device = {
  id: string;
  name: string;
  monthly: number;
  upfront: string;
  note: string;
};

export const DEVICES: Device[] = [
  { id: "iphone-15", name: "iPhone 15 128 GB", monthly: 9990, upfront: "0 Ft előleg", note: "Yettel L mellé" },
  { id: "galaxy-s24", name: "Samsung Galaxy S24", monthly: 7490, upfront: "0 Ft előleg", note: "24 havi részlet" },
  { id: "redmi-note-13", name: "Xiaomi Redmi Note 13", monthly: 2490, upfront: "0 Ft előleg", note: "24 havi részlet" },
];

export function formatFt(value: number): string {
  return new Intl.NumberFormat("hu-HU").format(value) + " Ft";
}
