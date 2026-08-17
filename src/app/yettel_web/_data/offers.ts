// Kiemelt ajánlatok adatai a Yettel bemutató főoldalhoz.
// Az árak tájékoztató jellegűek, egy letisztult bemutató (redesign) koncepcióhoz.

export type OfferCategory = "havidijas" | "net" | "tv" | "csomag" | "feltolto";

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
  /** Bővebb tulajdonságok a "Részletek" felugró ablakhoz (opcionális). */
  details?: string[];
  // ── Havidíjas mobil tarifákhoz (a mobil kártyához + szűréshez) ──
  /** Mobilnet keret felirata, pl. "60 GB" vagy "Korlátlan". */
  dataLabel?: string;
  /** Beszélgetés felirata, pl. "100 perc" vagy "Korlátlan". */
  voiceLabel?: string;
  /** Szűréshez: korlátlan mobilnet. */
  unlimitedNet?: boolean;
  /** Szűréshez: korlátlan beszélgetés. */
  unlimitedCall?: boolean;
  /** Kiemelt "legjobb választás" kártya. */
  best?: boolean;
  /** A kategória legdrágább, prémium csomagja – teljes lime kiemeléssel. */
  premium?: boolean;
  /** Rövid, a fejlécen megjelenő címke. */
  badge?: string;
  cta: string;
};

export const OFFER_TABS: { id: OfferCategory; label: string; hint: string; soon?: boolean }[] = [
  { id: "havidijas", label: "Havidíjas mobil", hint: "Korlátlan hívás, 5G net" },
  { id: "net", label: "Otthoni internet", hint: "Optikai & 5G, Wi‑Fi 6" },
  { id: "tv", label: "Yettel TV", hint: "Élő adás & felvétel" },
  { id: "feltolto", label: "Feltöltőkártya", hint: "Kötöttség nélkül" },
  { id: "csomag", label: "Internet + TV", hint: "Csomagban, egy számlán", soon: true },
];

// A tarifakártyák feletti dinamikus cím + rövid marketing szöveg kategóriánként.
export const CATEGORY_META: Record<OfferCategory, { title: string; blurb: string }> = {
  havidijas: {
    title: "Havidíjas mobil",
    blurb:
      "Korlátlan beszélgetés és villámgyors 5G net – kötöttség nélkül, kisbetűs meglepetések nélkül. Válaszd ki, mennyi adat kell, a többit bízd ránk.",
  },
  net: {
    title: "Otthoni internet",
    blurb:
      "Stabil, villámgyors optikai internet az egész családnak – ajándék WiFi 7 routerrel és díjmentes telepítéssel. Ellenőrizd pár kattintással, elérhető-e a címeden.",
  },
  tv: {
    title: "Yettel TV",
    blurb:
      "Kedvenc csatornáid élőben és visszanézve, akár 4K-ban, bármelyik eszközödön. Sport, film, sorozat – mind egy helyen, felvétellel.",
  },
  feltolto: {
    title: "Feltöltőkártya",
    blurb:
      "Kötöttség és havidíj nélkül – csak akkor fizetsz, amikor feltöltesz. Rugalmas opciók net-tel és korlátlan hívással, bármikor válthatsz.",
  },
  csomag: {
    title: "Internet + TV",
    blurb: "A net és a TV egy csomagban, egy számlán, a legjobb áron. Hamarosan elérhető.",
  },
};

export const OFFERS: Record<OfferCategory, Offer[]> = {
  // Havidíjas mobil tarifák – a mobil kártya + szűrő + egysoros carousel.
  havidijas: [
    {
      id: "prime-simple-net",
      name: "Yettel Prime Simple Net",
      tagline: "e-Komfort csomaggal, 11 hó hűséggel",
      price: 11989,
      unit: "Ft/hó",
      dataLabel: "60 GB",
      voiceLabel: "100 perc",
      unlimitedNet: false,
      unlimitedCall: false,
      features: ["60 GB mobilnet", "100 perc beszélgetés", "Korlátlan le- és feltöltés belföldön"],
      details: [
        "60 GB belföldi mobilnet",
        "100 perc belföldi beszélgetés",
        "Korlátlan le- és feltöltési sebesség belföldön",
        "60 GB EU/1. díjzóna adatroaming a belföldi keretből",
        "5G hálózat",
      ],
      cta: "Kosárba rakom",
    },
    {
      id: "prime-plus",
      name: "Yettel Prime Plus",
      tagline: "e-Komfort csomaggal, 11 hó hűséggel",
      price: 14599,
      unit: "Ft/hó",
      dataLabel: "Korlátlan",
      voiceLabel: "200 perc",
      unlimitedNet: true,
      unlimitedCall: false,
      features: ["Korlátlan mobilnet", "200 perc beszélgetés", "Korlátlan le- és feltöltés belföldön"],
      details: [
        "Korlátlan belföldi mobilnet",
        "200 perc belföldi beszélgetés",
        "Korlátlan le- és feltöltési sebesség belföldön",
        "69 GB EU/1. díjzóna adatroaming a belföldi keretből",
        "5G hálózat",
      ],
      cta: "Kosárba rakom",
    },
    {
      id: "prime-extra",
      name: "Yettel Prime Extra",
      tagline: "e-Komfort csomaggal, 11 hó hűséggel",
      price: 17729,
      unit: "Ft/hó",
      dataLabel: "Korlátlan",
      voiceLabel: "Korlátlan",
      unlimitedNet: true,
      unlimitedCall: true,
      features: ["Korlátlan mobilnet", "Korlátlan beszélgetés", "Korlátlan le- és feltöltés belföldön"],
      details: [
        "Korlátlan belföldi mobilnet",
        "Korlátlan belföldi beszélgetés",
        "Korlátlan le- és feltöltési sebesség belföldön",
        "83 GB EU/1. díjzóna adatroaming a belföldi keretből",
        "5G hálózat",
      ],
      cta: "Kosárba rakom",
    },
    {
      id: "start",
      name: "Yettel Start",
      tagline: "e-Komfort csomaggal, 11 hó hűséggel",
      price: 4679,
      unit: "Ft/hó",
      dataLabel: "2 GB",
      voiceLabel: "100 perc",
      unlimitedNet: false,
      unlimitedCall: false,
      features: ["2 GB mobilnet", "100 perc beszélgetés", "Korlátlan le- és feltöltés belföldön"],
      details: [
        "2 GB belföldi mobilnet",
        "100 perc belföldi beszélgetés",
        "Korlátlan le- és feltöltési sebesség belföldön",
        "2 GB EU/1. díjzóna adatroaming a belföldi keretből",
        "5G hálózat",
      ],
      cta: "Kosárba rakom",
    },
    {
      id: "prime-max",
      name: "Yettel Prime Max",
      tagline: "e-Komfort csomaggal, 11 hó hűséggel",
      price: 23999,
      unit: "Ft/hó",
      dataLabel: "Korlátlan",
      voiceLabel: "Korlátlan",
      unlimitedNet: true,
      unlimitedCall: true,
      features: ["Korlátlan mobilnet", "Korlátlan beszélgetés", "Korlátlan SMS belföldön és EU-ban"],
      details: [
        "Korlátlan belföldi mobilnet",
        "Korlátlan belföldi beszélgetés",
        "Korlátlan SMS belföldön és EU 1-es díjzónában",
        "Korlátlan le- és feltöltési sebesség belföldön",
        "110 GB EU/1. díjzóna adatroaming a belföldi keretből",
        "5G hálózat",
      ],
      cta: "Kosárba rakom",
    },
    {
      id: "prime",
      name: "Yettel Prime",
      tagline: "e-Komfort csomaggal, 11 hó hűséggel",
      price: 9379,
      unit: "Ft/hó",
      dataLabel: "25 GB",
      voiceLabel: "200 perc",
      unlimitedNet: false,
      unlimitedCall: false,
      features: ["25 GB mobilnet", "200 perc beszélgetés", "Korlátlan le- és feltöltés belföldön"],
      details: [
        "25 GB belföldi mobilnet",
        "200 perc belföldi beszélgetés",
        "Korlátlan le- és feltöltési sebesség belföldön",
        "25 GB EU/1. díjzóna adatroaming a belföldi keretből",
        "5G hálózat",
      ],
      cta: "Kosárba rakom",
    },
  ],
  // A "Címellenőrzés" folyamat után megjelenő ajánlatok (lásd internet-flow.tsx).
  net: [
    {
      id: "hipernet-l",
      name: "HiperNet L",
      tagline: "e-Komfort, 12 hó hűséggel",
      price: 7990,
      unit: "Ft/hó",
      features: ["1000 Mbit/s letöltés", "Optikai internet", "WiFi 7 router ajándékba", "Díjmentes telepítés"],
      details: [
        "Letöltési sebesség akár 1000 Mbit/s",
        "Feltöltési sebesség akár 300 Mbit/s",
        "Ajándék WiFi 7 router, díjmentes bérlettel",
        "Díjmentes kiszállás és szakszerű telepítés",
        "Első 30 nap díjmentes",
        "Hűségidő: 12 hónap, e-Komfort kedvezménnyel",
      ],
      premium: true,
      badge: "30 nap díjmentes",
      cta: "Címkeresés",
    },
    {
      id: "hipernet-m",
      name: "HiperNet M",
      tagline: "e-Komfort, 12 hó hűséggel",
      price: 6990,
      unit: "Ft/hó",
      features: ["500 Mbit/s letöltés", "Optikai internet", "WiFi 7 router ajándékba", "Díjmentes telepítés"],
      details: [
        "Letöltési sebesség akár 500 Mbit/s",
        "Feltöltési sebesség akár 150 Mbit/s",
        "Ajándék WiFi 7 router, díjmentes bérlettel",
        "Díjmentes kiszállás és szakszerű telepítés",
        "Első 30 nap díjmentes",
        "Hűségidő: 12 hónap, e-Komfort kedvezménnyel",
      ],
      best: true,
      badge: "30 nap díjmentes",
      cta: "Címkeresés",
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
      details: [
        "60+ csatorna, köztük 20+ HD minőségben",
        "Egyszerre 4 eszközön nézhető",
        "20 óra felhőalapú felvétel",
        "MyTV alkalmazás iOS és Android eszközökre",
      ],
      cta: "Címkeresés",
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
      details: [
        "120+ csatorna",
        "Sport és prémium film csomag",
        "100 óra felhőalapú felvétel",
        "7 napos visszatekerés (catch-up)",
        "Egyszerre 4 eszközön nézhető",
      ],
      best: true,
      badge: "Ajánljuk",
      cta: "Címkeresés",
    },
    {
      id: "tv-premium",
      name: "TV Prémium",
      tagline: "Minden, 4K-ban",
      price: 6990,
      unit: "Ft/hó",
      features: ["180+ csatorna", "Összes prémium csomag", "4K + 200 óra felvétel", "Egyszerre 6 eszköz"],
      details: [
        "180+ csatorna",
        "Összes prémium és sport csomag",
        "4K minőség a támogatott csatornákon",
        "200 óra felhőalapú felvétel",
        "Egyszerre 6 eszközön nézhető",
      ],
      premium: true,
      badge: "Prémium",
      cta: "Címkeresés",
    },
  ],
  feltolto: [
    {
      id: "feltolto-start",
      name: "Feltöltő Start",
      tagline: "Alkalmi használatra",
      price: 1990,
      unit: "Ft/feltöltés",
      features: [
        "5 GB adat a feltöltéshez",
        "100 perc + 100 SMS",
        "30 napig felhasználható",
        "Nincs havidíj, nincs kötöttség",
      ],
      cta: "Feltöltöm",
    },
    {
      id: "feltolto-plusz",
      name: "Feltöltő Plusz",
      tagline: "Ha többre van szükség",
      price: 3990,
      oldPrice: 4490,
      unit: "Ft/feltöltés",
      features: [
        "20 GB adat a feltöltéshez",
        "Korlátlan hívás Yettelen belül",
        "30 napig felhasználható",
        "Automatikus feltöltés kérhető",
      ],
      best: true,
      badge: "Legnépszerűbb",
      cta: "Feltöltöm",
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
  /** Kép fájlnév a public/yettel/ mappában. */
  img: string;
};

export const DEVICES: Device[] = [
  { id: "iphone-15", name: "iPhone 15 128 GB", monthly: 9990, upfront: "0 Ft előleg", note: "Yettel L mellé", img: "iphone.png" },
  { id: "galaxy-s24", name: "Samsung Galaxy S24", monthly: 7490, upfront: "0 Ft előleg", note: "24 havi részlet", img: "samsung.png" },
  { id: "redmi-note-13", name: "Xiaomi Redmi Note 13", monthly: 2490, upfront: "0 Ft előleg", note: "24 havi részlet", img: "xiaomi.png" },
];

export function formatFt(value: number): string {
  return new Intl.NumberFormat("hu-HU").format(value) + " Ft";
}
