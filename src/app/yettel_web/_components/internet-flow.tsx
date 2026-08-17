"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type ElementType,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Check,
  Clock,
  Home,
  FileText,
  Download,
  Phone,
  MessageCircle,
  CreditCard,
  Car,
  BookOpen,
  Loader2,
  ArrowRight,
  MonitorPlay,
  ShoppingCart,
  User,
  Wifi,
} from "lucide-react";
import { OFFERS, formatFt, type Offer, type OfferCategory } from "../_data/offers";
import { OfferCard } from "./offer-card";
import { TvQuotas } from "./quota-bars";
import { EKomfortCard } from "./ekomfort-info";

// ── Teljes oldalas, hash-vezérelt igénylési folyamat (a /yettel_light_asis
//    mintájára). Ugyanaz a folyamat szolgálja ki az otthoni internetet és a
//    Yettel TV-t – csak a konfiguráció (ajánlatok, extrák, feliratok) tér el. ──

type Step =
  | "address"
  | "checking"
  | "offers"
  | "extras"
  | "personal"
  | "personalCheck"
  | "address2"
  | "address2Check"
  | "consent"
  | "appointment"
  | "summary"
  | "success";

type FlowExtra = {
  key: string;
  title: string;
  icon: ElementType;
  price: number;
  priceLabel: string;
  desc: string;
  details: string[];
};

type ExtraSection = { title?: string; items: FlowExtra[] };

type FlowConfig = {
  service: Extract<OfferCategory, "net" | "tv">;
  hashBase: string;
  brand: string;
  orderLabel: string; // a fejlécben: "mit rendel" (pl. "Internet megrendelés")
  closeHash: string; // ide tér vissza kilépéskor (a főoldali kategória)
  addressTitle: string;
  addressSub: string;
  availTitle: string;
  offersLabel: string;
  extraSections: ExtraSection[];
  extrasTitle: string;
  extrasSub: string;
  /** e-Komfort tájékoztató megjelenítése a folyamatban (pl. internetnél). */
  eKomfort?: boolean;
};

const NET_CONFIG: FlowConfig = {
  service: "net",
  hashBase: "otthoni-internet",
  brand: "Otthoni internet",
  orderLabel: "Internet megrendelés",
  closeHash: "internet",
  addressTitle: "Hova szeretnél otthoni internetet?",
  addressSub:
    "Add meg a címed, és mutatjuk az elérhető ajánlatokat! Ha nem találod, amit keresel, gépelj tovább a pontosabb találatokért.",
  availTitle: "Elérhetőség ellenőrzése…",
  offersLabel: "Internet",
  extrasTitle: "Extrák választása",
  extrasSub: "Válaszd ki, milyen kiegészítőket szeretnél a szolgáltatásod mellé.",
  eKomfort: true,
  extraSections: [
    {
      title: "Internetvédelem",
      items: [
        {
          key: "child",
          title: "Gyermekvédelmi tartalomszűrő",
          icon: ShieldCheck,
          price: 0,
          priceLabel: "Díjmentes",
          desc: "A kiskorú internetezők védelmében blokkolja a hatósági lista szerinti, felnőtt tartalmakat kínáló weboldalakat.",
          details: [
            "Hatósági lista alapján blokkolja a felnőtt tartalmú oldalakat",
            "Automatikusan frissülő szűrőlista, karbantartás nélkül",
            "Hálózati szintű védelem – minden otthoni eszközre vonatkozik",
            "Bármikor be- és kikapcsolható a MyYettel alkalmazásban",
            "Díjmentes, kötöttség és hűségidő nélkül",
          ],
        },
        {
          key: "netpajzs",
          title: "NetPajzs",
          icon: ShieldAlert,
          price: 490,
          priceLabel: "490 Ft / hó",
          desc: "Beépített védelem a káros és csaló weboldalak, vírusok és adathalász támadások ellen, a hálózat szintjén.",
          details: [
            "Valós idejű védelem vírusok, adathalászat és csaló oldalak ellen",
            "Hálózati szintű szűrés – nem kell külön alkalmazás az eszközökre",
            "Automatikusan frissülő fenyegetés-adatbázis",
            "Havi jelentés a blokkolt fenyegetésekről",
            "490 Ft / hó, bármikor lemondható",
          ],
        },
      ],
    },
    {
      title: "Otthoni WiFi",
      items: [
        {
          key: "mesh",
          title: "Mesh WiFi rendszer",
          icon: Wifi,
          price: 1290,
          priceLabel: "1 290 Ft / hó",
          desc: "Erős, egyenletes WiFi lefedettség a lakás minden pontján, akár több szinten is.",
          details: [
            "Egységes WiFi hálózat az egész otthonban",
            "Nincs holttér – zökkenőmentes váltás a helyiségek között",
            "Akár 2 mesh egység, igény szerint bővíthető",
            "Bérleti díjban, díjmentes telepítéssel",
          ],
        },
      ],
    },
  ],
};

const TV_CONFIG: FlowConfig = {
  service: "tv",
  hashBase: "yettel-tv",
  brand: "Yettel TV",
  orderLabel: "TV megrendelés",
  closeHash: "tv",
  addressTitle: "Hova szeretnél Yettel TV-t?",
  addressSub:
    "Add meg a címed, és mutatjuk az elérhető TV-csomagokat! Ha nem találod, amit keresel, gépelj tovább a pontosabb találatokért.",
  availTitle: "Elérhetőség ellenőrzése…",
  offersLabel: "TV-csomagok",
  extrasTitle: "Streaming szolgáltatások",
  extrasSub: "Válaszd ki, mely streaming szolgáltatásokat szeretnéd a TV mellé – akár többet is.",
  extraSections: [
    {
      items: [
    {
      key: "rtlplus",
      title: "RTL+",
      icon: MonitorPlay,
      price: 1590,
      priceLabel: "1 590 Ft / hó",
      desc: "Az RTL+ teljes kínálata: filmek, sorozatok és exkluzív műsorok.",
      details: [
        "RTL csatornák műsorai és exkluzív tartalmak",
        "Több ezer óra film és sorozat",
        "Reklámmentes lejátszás",
        "Bármikor lemondható",
      ],
    },
    {
      key: "hbomax",
      title: "HBO Max",
      icon: MonitorPlay,
      price: 2990,
      priceLabel: "2 990 Ft / hó",
      desc: "Prémium sorozatok, filmek és exkluzív HBO tartalmak egy helyen.",
      details: [
        "A HBO Max teljes kínálata",
        "Exkluzív sorozatok és sikerfilmek",
        "Akár 4K minőségben",
        "Bármikor lemondható",
      ],
    },
    {
      key: "netflix",
      title: "Netflix",
      icon: MonitorPlay,
      price: 3490,
      priceLabel: "3 490 Ft / hó",
      desc: "A Netflix filmek, sorozatok és saját gyártású tartalmak.",
      details: [
        "A Netflix teljes kínálata",
        "Filmek, sorozatok és saját gyártású tartalmak",
        "Több eszközön elérhető",
        "Bármikor lemondható",
      ],
    },
      ],
    },
  ],
};

const SLOTS = ["08:00 – 12:00", "12:00 – 16:00", "16:00 – 20:00"];
const MONTHS_HU = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];
const DOW = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

// A folyamatábra 8 lépése – a címellenőrzéstől az összefoglalóig.
const STEPPER: { key: Step; label: string }[] = [
  { key: "address", label: "Címellenőrzés" },
  { key: "offers", label: "Ajánlatok" },
  { key: "extras", label: "Extrák" },
  { key: "personal", label: "Személyes adatok" },
  { key: "address2", label: "Lakcím" },
  { key: "consent", label: "Hozzájárulások" },
  { key: "appointment", label: "Időpont" },
  { key: "summary", label: "Összefoglaló" },
];
const STEP_TO_STEPPER: Partial<Record<Step, number>> = {
  address: 0,
  checking: 0,
  offers: 1,
  extras: 2,
  personal: 3,
  personalCheck: 3,
  address2: 4,
  address2Check: 4,
  consent: 5,
  appointment: 6,
  summary: 7,
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatDateHu(d: Date) {
  return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`;
}
function buildStepHash(base: string): Record<Step, string> {
  return {
    address: `${base}/cim`,
    checking: `${base}/elerhetoseg`,
    offers: `${base}/ajanlatok`,
    extras: `${base}/extrak`,
    personal: `${base}/szemelyes-adatok`,
    personalCheck: `${base}/szemelyes-adatok-ellenorzes`,
    address2: `${base}/lakcim`,
    address2Check: `${base}/lakcim-ellenorzes`,
    consent: `${base}/hozzajarulasok`,
    appointment: `${base}/idopont`,
    summary: `${base}/osszefoglalo`,
    success: `${base}/kesz`,
  };
}

// Vékony wrapperek a két szolgáltatáshoz.
export function InternetFlow() {
  return <ServiceFlow config={NET_CONFIG} />;
}
export function TvFlow() {
  return <ServiceFlow config={TV_CONFIG} />;
}

function ServiceFlow({ config }: { config: FlowConfig }) {
  const STEP_HASH = useMemo(() => buildStepHash(config.hashBase), [config.hashBase]);
  const HASH_TO_STEP = useMemo(() => {
    const m: Record<string, Step> = {};
    (Object.entries(STEP_HASH) as [Step, string][]).forEach(([k, v]) => {
      m[v] = k;
    });
    return m;
  }, [STEP_HASH]);

  const allExtras = useMemo(() => config.extraSections.flatMap((s) => s.items), [config.extraSections]);

  const [step, setStep] = useState<Step | null>(null);
  const [pkg, setPkg] = useState<Offer | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [apptDate, setApptDate] = useState<Date | null>(null);
  const [apptSlot, setApptSlot] = useState<string | null>(null);
  const [contactName, setContactName] = useState("Weinper Gyula");
  const [contactPhone, setContactPhone] = useState("");
  const [contactNote, setContactNote] = useState("");

  // A lépést mindig a URL-hash vezérli (előre/vissza gomb, közvetlen link).
  useEffect(() => {
    const parse = () => {
      const h = window.location.hash.slice(1);
      if (!h.startsWith(config.hashBase)) {
        setStep(null);
        return;
      }
      setStep(HASH_TO_STEP[h] ?? "address");
    };
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, [config.hashBase, HASH_TO_STEP]);

  // Háttérgörgetés zárolása, amíg a folyamat aktív.
  useEffect(() => {
    if (step === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [step]);

  const go = useCallback((s: Step) => {
    window.location.hash = STEP_HASH[s];
  }, [STEP_HASH]);
  const goReplace = useCallback((s: Step) => {
    window.history.replaceState(null, "", `#${STEP_HASH[s]}`);
    setStep(s);
  }, [STEP_HASH]);
  const closeFlow = useCallback(() => {
    window.location.hash = config.closeHash;
  }, [config.closeHash]);
  const goHome = useCallback(() => {
    window.location.hash = "top";
  }, []);

  // Töltő képernyők automatikus továbblépése.
  useEffect(() => {
    if (step !== "checking" && step !== "personalCheck" && step !== "address2Check") return;
    const next: Step = step === "checking" ? "offers" : step === "personalCheck" ? "address2" : "consent";
    const t = setTimeout(() => goReplace(next), 1900);
    return () => clearTimeout(t);
  }, [step, goReplace]);

  const requiredOk = !!consents.aszf && !!consents.egyedi && !!consents.adat;
  const chosenExtras = allExtras.filter((e) => selectedExtras.includes(e.key));
  const total = (pkg?.price ?? 0) + chosenExtras.reduce((s, e) => s + e.price, 0);
  const apptWhen = apptDate && apptSlot ? `${formatDateHu(apptDate)} · ${apptSlot}` : "—";

  if (step === null) return null;

  const stepperIdx = STEP_TO_STEPPER[step];
  const isLoader = step === "checking" || step === "personalCheck" || step === "address2Check";
  // A lebegő kosár-összegző: amint van kiválasztott csomag, az összefoglalóig.
  const showCart =
    pkg !== null &&
    ["extras", "personal", "personalCheck", "address2", "address2Check", "consent", "appointment"].includes(step);

  const back: Partial<Record<Step, Step>> = {
    offers: "address",
    extras: "offers",
    personal: "extras",
    address2: "personal",
    consent: "address2",
    appointment: "consent",
    summary: "appointment",
  };
  const backTarget = back[step];

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#E4F2F7] sm:bg-white">
      <header className="sticky top-0 z-10">
        {/* Felső sáv (fehér): vissza · márka · bezárás */}
        <div className="border-b border-[#CDE0EA] bg-white">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => (backTarget ? go(backTarget) : closeFlow())}
              className={[
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold text-[#2D466C] transition-colors hover:bg-[#E4F2F7]",
                step === "success" ? "invisible" : "",
              ].join(" ")}
            >
              <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Vissza</span>
            </button>
            {/* A Yettel logó helyett: mit rendel a felhasználó */}
            <span className="text-sm font-extrabold uppercase tracking-[0.04em] text-[#002340] sm:text-base">
              {config.orderLabel}
            </span>
            <button
              type="button"
              onClick={closeFlow}
              className="grid h-9 w-9 place-items-center rounded-lg text-[#2D466C] transition-colors hover:bg-[#E4F2F7]"
              aria-label="Kilépés"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Folyamatábra sáv: teljes hosszban sötétkék, a tartalom a kerettel egy szélességben */}
        {stepperIdx !== undefined && (
          <div className="bg-[#002340]">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <Stepper current={stepperIdx} />
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Lekerekített, világoskék keret desktopon; mobilon keret nélkül,
            minden a világoskék háttéren fut. */}
        <div className="rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-[32px] sm:border sm:border-[#CDE0EA] sm:bg-[#E4F2F7] sm:p-10 sm:shadow-[0_30px_80px_-40px_rgba(0,35,64,0.45)] lg:p-12">
          {step === "address" && (
            <AddressStep
              config={config}
              onNext={() => go("checking")}
              onLogin={() => {
                window.location.hash = "belepes";
              }}
            />
          )}
          {isLoader && (
            <Loader
              title={step === "checking" ? config.availTitle : "Adatok ellenőrzése folyamatban…"}
              sub={
                step === "checking"
                  ? "Megnézzük, elérhető-e a szolgáltatás a megadott címen. Érdemes egy picit várni."
                  : "Ez néha hosszabb időt is igénybe vehet — érdemes egy picit várni. Kérjük, ne zárd be az ablakot."
              }
            />
          )}
          {step === "offers" && (
            <OffersStep
              config={config}
              onSelect={(o) => {
                setPkg(o);
                go("extras");
              }}
            />
          )}
          {step === "extras" && (
            <ExtrasStep
              sections={config.extraSections}
              title={config.extrasTitle}
              sub={config.extrasSub}
              selected={selectedExtras}
              setSelected={setSelectedExtras}
              onNext={() => go("personal")}
            />
          )}
          {step === "personal" && <PersonalStep onNext={() => go("personalCheck")} />}
          {step === "address2" && <AddressDataStep onNext={() => go("address2Check")} />}
          {step === "consent" && (
            <ConsentStep
              consents={consents}
              setConsents={setConsents}
              onNext={() => go("appointment")}
              requiredOk={requiredOk}
              eKomfort={!!config.eKomfort}
            />
          )}
          {step === "appointment" && (
            <AppointmentStep
              apptDate={apptDate}
              apptSlot={apptSlot}
              setApptDate={setApptDate}
              setApptSlot={setApptSlot}
              contactName={contactName}
              setContactName={setContactName}
              contactPhone={contactPhone}
              setContactPhone={setContactPhone}
              contactNote={contactNote}
              setContactNote={setContactNote}
              onNext={() => go("summary")}
            />
          )}
          {step === "summary" && (
            <SummaryStep
              pkg={pkg}
              extras={chosenExtras}
              total={total}
              apptWhen={apptWhen}
              contactName={contactName}
              contactPhone={contactPhone}
              contactNote={contactNote}
              onEditAppt={() => go("appointment")}
              onFinish={() => go("success")}
            />
          )}
          {step === "success" && <SuccessStep apptWhen={apptWhen} onHome={goHome} />}
        </div>
      </main>

      {/* Hely a mobil, alul ragadó kosársávnak, hogy ne takarja a gombokat */}
      {showCart && pkg && <div aria-hidden className="h-24 sm:hidden" />}
      {showCart && pkg && <CartSummary pkg={pkg} extras={chosenExtras} total={total} />}
    </div>
  );
}

// ── Kosár-összegző: mobilon alul ragadó sáv, weben lebegő kártya ─────────
function CartLines({ pkg, extras, total }: { pkg: Offer; extras: FlowExtra[]; total: number }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-[#CDE0EA] pb-2.5">
        <div>
          <p className="text-sm font-bold text-[#002340]">{pkg.name}</p>
          <p className="text-xs text-[#7E93B0]">{pkg.features[0]}</p>
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-[#002340]">{formatFt(pkg.price)}</span>
      </div>
      {extras.map((e) => (
        <div key={e.key} className="flex items-center justify-between gap-3 border-b border-[#CDE0EA] py-2.5">
          <p className="text-sm text-[#002340]">{e.title}</p>
          <span className={["whitespace-nowrap text-sm", e.price === 0 ? "font-semibold text-[#2D466C]" : "font-bold text-[#002340]"].join(" ")}>
            {e.price === 0 ? "Díjmentes" : formatFt(e.price)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 pt-3">
        <span className="text-sm font-extrabold uppercase tracking-[0.04em] text-[#2D466C]">Összesen</span>
        <span className="text-lg font-extrabold tracking-tight text-[#002340]">
          {formatFt(total)}
          <span className="text-xs font-semibold text-[#2D466C]"> / hó</span>
        </span>
      </div>
    </>
  );
}

function CartSummary({ pkg, extras, total }: { pkg: Offer; extras: FlowExtra[]; total: number }) {
  // A két nézetnek külön nyitott-állapota van: mobilon alapból csak az összeg
  // látszik (hogy ne takarja a tartalmat), weben a teljes kártya nyitva marad.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Mobil: a képernyő aljára ragadó összesítő sáv */}
      <div className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
        {mobileOpen && (
          <div className="max-h-[45vh] overflow-y-auto border-t border-[#CDE0EA] bg-white px-4 py-3 shadow-[0_-18px_40px_-24px_rgba(0,35,64,0.45)]">
            <CartLines pkg={pkg} extras={extras} total={total} />
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between gap-3 bg-[#002340] px-4 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] text-white shadow-[0_-14px_34px_-20px_rgba(0,35,64,0.7)]"
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <ShoppingCart className="h-4 w-4 text-[#B4FF00]" /> A kosarad
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight">
              {formatFt(total)}
              <span className="text-xs font-semibold text-[#BBD3E4]"> / hó</span>
            </span>
            {mobileOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </span>
        </button>
      </div>

      {/* Web: lebegő kártya jobb alul */}
      <div className="fixed bottom-6 right-6 z-40 hidden w-full max-w-xs sm:block">
        {open ? (
          <div className="overflow-hidden rounded-2xl border border-[#CDE0EA] bg-white shadow-[0_24px_60px_-20px_rgba(0,35,64,0.45)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between gap-2 bg-[#002340] px-4 py-3 text-white"
            >
              <span className="inline-flex items-center gap-2 text-sm font-bold">
                <ShoppingCart className="h-4 w-4 text-[#B4FF00]" /> A kosarad
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="max-h-[45vh] overflow-y-auto p-4">
              <CartLines pkg={pkg} extras={extras} total={total} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-full bg-[#002340] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_-16px_rgba(0,35,64,0.6)]"
          >
            <ShoppingCart className="h-4 w-4 text-[#B4FF00]" />
            <span>{formatFt(total)} / hó</span>
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}

// ── Folyamatábra a sötétkék sávon (webes: 8 lépés felirattal, mobil: sáv) ──
function Stepper({ current }: { current: number }) {
  return (
    <div className="py-3 sm:py-4">
      <ol className="hidden items-start sm:flex">
        {STEPPER.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={[
                    "h-0.5 flex-1 rounded",
                    i === 0 ? "opacity-0" : i <= current ? "bg-[#B4FF00]" : "bg-white/20",
                  ].join(" ")}
                />
                <span
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                    done ? "bg-[#B4FF00] text-[#002340]" : active ? "bg-white text-[#002340]" : "bg-white/15 text-white/70",
                  ].join(" ")}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={[
                    "h-0.5 flex-1 rounded",
                    i === STEPPER.length - 1 ? "opacity-0" : i < current ? "bg-[#B4FF00]" : "bg-white/20",
                  ].join(" ")}
                />
              </div>
              <span
                className={[
                  "mt-1.5 px-1 text-center text-[11px] font-bold leading-tight",
                  active ? "text-white" : done ? "text-white/90" : "text-white/50",
                ].join(" ")}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="sm:hidden">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold text-white">{STEPPER[current].label}</span>
          <span className="text-xs font-semibold text-white/60">
            {current + 1} / {STEPPER.length}. lépés
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPPER.map((s, i) => (
            <span
              key={s.key}
              className={[
                "h-1.5 flex-1 rounded-full",
                i < current ? "bg-[#B4FF00]" : i === current ? "bg-white" : "bg-white/20",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Közös építőelemek ──────────────────────────────────────
function StepHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-base text-[#2D466C]">{sub}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[20px] border border-[#CDE0EA] bg-white p-5 shadow-[0_10px_30px_-20px_rgba(0,35,64,0.35)] sm:p-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  placeholder,
  defaultValue,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#002340]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-xl border border-[#CDE0EA] bg-white px-4 py-3 text-sm text-[#002340] outline-none transition-colors placeholder:text-[#7E93B0] focus:border-[#002340]"
      />
    </label>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#002340] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#001D36] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[220px]"
    >
      {children}
    </button>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex justify-end">{children}</div>;
}

function Loader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-[#002340]" strokeWidth={2.2} />
      <p className="mt-6 text-xl font-extrabold text-[#002340]">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-[#2D466C]">{sub}</p>
    </div>
  );
}

// ── 1. Címellenőrzés (+ meglévő ügyfél bejelentkezés) ──────
function AddressStep({ config, onNext, onLogin }: { config: FlowConfig; onNext: () => void; onLogin: () => void }) {
  return (
    <div>
      <StepHead title={config.addressTitle} sub={config.addressSub} />

      {/* Meglévő ügyfeleknek: bejelentkezési felhívás */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#B4FF00] bg-white p-4 shadow-[0_10px_30px_-20px_rgba(0,35,64,0.3)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
            <User className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold text-[#002340]">Már Yettel-ügyfél vagy?</p>
            <p className="mt-0.5 text-sm text-[#2D466C]">
              Jelentkezz be, és az adataidat automatikusan kitöltjük – így sokkal gyorsabban végzel.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogin}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#B4FF00] px-5 py-3 text-sm font-bold text-[#002340] transition-colors hover:bg-[#9BE000]"
        >
          <User className="h-4 w-4" /> Bejelentkezés
        </button>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Település vagy irányítószám" placeholder="1097" />
          </div>
          <Field label="Közterület" placeholder="Deák Ferenc utca" />
          <Field label="Házszám" placeholder="6" />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#CDE0EA] bg-[#E4F2F7] px-4 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#B4FF00] text-[#002340]">
            <MessageCircle className="h-4 w-4" />
          </span>
          <p className="flex-1 text-sm text-[#2D466C]">Nem találod a címed? Jelezd nekünk, hogy segíthessünk!</p>
          <ChevronRight className="h-4 w-4 text-[#7E93B0]" />
        </div>
      </Card>
      <Footer>
        <PrimaryButton onClick={onNext}>
          Elérhetőség ellenőrzése <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </Footer>
    </div>
  );
}

// ── 3. Ajánlatok a címeden – ugyanazok a kártyák, mint a főoldalon ─────────
function OffersStep({ config, onSelect }: { config: FlowConfig; onSelect: (o: Offer) => void }) {
  return (
    <div>
      <StepHead title="Ajánlatok a címeden" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-[#CDE0EA]">
        <p className="text-sm font-semibold text-[#002340]">1144 Budapest XIV. ker., Ond vezér útja 13-15. 1. em. 12.</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#B4FF00]/25 px-3 py-1 text-xs font-bold text-[#002340]">
          <CheckCircle2 className="h-3.5 w-3.5" /> Elérhető a címeden
        </span>
      </div>
      <p className="mb-7 text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">{config.offersLabel}</p>
      {/* Ugyanaz az OfferCard, mint a főoldali szekcióban; csak a gomb szövege más. */}
      <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pt-3 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pt-0 sm:pb-0 lg:grid-cols-3">
        {[...OFFERS[config.service]]
          .sort((a, b) => b.price - a.price)
          .map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              ctaLabel="Megrendelem"
              onOrder={() => onSelect(o)}
              body={config.service === "tv" ? <TvQuotas offer={o} /> : undefined}
              className="min-w-[82%] shrink-0 snap-start sm:min-w-0 sm:shrink"
            />
          ))}
      </div>
      <div className="mt-8">
        <p className="mb-2 text-sm font-semibold text-[#2D466C]">Elakadtál? Kérj segítséget:</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] bg-white px-3 py-2.5 text-sm font-bold text-[#002340]">
            <MessageCircle className="h-4 w-4" /> Chat
          </span>
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] bg-white px-3 py-2.5 text-sm font-bold text-[#002340]">
            <Phone className="h-4 w-4" /> Visszahívást kérek
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 4. Extrák ──────────────────────────────────────────────
// Rádiógombos választás: kéri vagy nem kéri az adott extrát.
function RadioChoice({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const opts: { v: boolean; label: string }[] = [
    { v: true, label: "Kérem" },
    { v: false, label: "Nem kérem" },
  ];
  return (
    <div className="flex gap-5">
      {opts.map((o) => {
        const selected = value === o.v;
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={selected}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#002340]"
          >
            <span
              className={[
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                selected ? "border-[#002340]" : "border-[#CDE0EA]",
              ].join(" ")}
            >
              {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#002340]" />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ExtrasStep({
  sections,
  title,
  sub,
  selected,
  setSelected,
  onNext,
}: {
  sections: ExtraSection[];
  title: string;
  sub: string;
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  onNext: () => void;
}) {
  const [details, setDetails] = useState<FlowExtra | null>(null);
  // Minden extra függetlenül kérhető / nem kérhető.
  const toggle = (key: string, v: boolean) =>
    setSelected((prev) => (v ? [...prev.filter((k) => k !== key), key] : prev.filter((k) => k !== key)));
  return (
    <div>
      <StepHead title={title} sub={sub} />
      <div className="space-y-8">
        {sections.map((sec, si) => (
          <div key={si}>
            {sec.title && (
              <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">{sec.title}</p>
            )}
            <div className="space-y-4">
              {sec.items.map((x) => {
                const on = selected.includes(x.key);
                return (
                  <Card key={x.key} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
                      <x.icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-[#002340]">{x.title}</p>
                        <span className="rounded-full bg-[#E4F2F7] px-3 py-1 text-xs font-bold text-[#002340]">{x.priceLabel}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#2D466C]">{x.desc}</p>
                      <button
                        type="button"
                        onClick={() => setDetails(x)}
                        className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-[#002340] hover:underline"
                      >
                        Részletek <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="w-full shrink-0 sm:w-[210px]">
                      <RadioChoice value={on} onChange={(v) => toggle(x.key, v)} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <Footer>
        <PrimaryButton onClick={onNext}>
          Tovább <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </Footer>

      {details && <ExtraDetailsModal extra={details} onClose={() => setDetails(null)} />}
    </div>
  );
}

function ExtraDetailsModal({ extra, onClose }: { extra: FlowExtra; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#002340]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${extra.title} részletei`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_30px_80px_rgba(0,35,64,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
              <extra.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-[#002340]">{extra.title}</h3>
              <span className="mt-1 inline-block rounded-full bg-[#E4F2F7] px-3 py-1 text-xs font-bold text-[#002340]">
                {extra.priceLabel}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#2D466C] transition-colors hover:bg-[#E4F2F7]"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-4 space-y-2.5">
          {extra.details.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-[#2D466C]">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#B4FF00]">
                <Check className="h-3 w-3 text-[#002340]" strokeWidth={3} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#002340] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
        >
          Értem
        </button>
      </div>
    </div>
  );
}

// ── 5. Személyes adatok ────────────────────────────────────
function IdTypeChoice() {
  const [sel, setSel] = useState("id");
  const opts = [
    { id: "id", label: "Személyi", icon: CreditCard },
    { id: "dl", label: "Jogosítvány", icon: Car },
    { id: "pp", label: "Útlevél", icon: BookOpen },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setSel(o.id)}
          className={[
            "inline-flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-bold transition-colors",
            sel === o.id ? "border-[#002340] bg-[#002340] text-white" : "border-[#CDE0EA] text-[#002340] hover:border-[#002340]",
          ].join(" ")}
        >
          <o.icon className="h-5 w-5" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

function InfoBox({ icon: Icon, children }: { icon: ElementType; children: ReactNode }) {
  return (
    <div className="mb-5 flex gap-3 rounded-xl border border-[#CDE0EA] bg-[#E4F2F7] px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#B4FF00] text-[#002340]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm text-[#2D466C]">{children}</p>
    </div>
  );
}

function PersonalStep({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <StepHead title="Személyes adatok" />
      <Card>
        <InfoBox icon={ShieldCheck}>
          Az adatok hitelességét ellenőrizzük, ami néha hosszabb időt is igénybe vehet. Kérjük, pontosan úgy töltsd ki, ahogyan a
          hivatalos dokumentumodban szerepel.
        </InfoBox>
        <span className="mb-1.5 block text-sm font-semibold text-[#002340]">Igazolvány típusa</span>
        <IdTypeChoice />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Okmány száma" placeholder="pl. 123456AB" defaultValue="123456AB" />
          <Field label="Név előtag" placeholder="pl. Dr. (nem kötelező)" />
          <Field label="Vezetéknév" placeholder="Ahogy az okmányban szerepel" defaultValue="Weinper" />
          <Field label="Keresztnév" placeholder="Ahogy az okmányban szerepel" defaultValue="Gyula" />
          <Field label="Anyja neve" placeholder="Anyja születési neve" defaultValue="Kovács Mária" />
          <Field label="Születési hely" placeholder="Város" defaultValue="Budapest" />
          <Field label="Születési idő" placeholder="ÉÉÉÉ. HH. NN." defaultValue="1990. 05. 12." />
        </div>
      </Card>
      <Footer>
        <PrimaryButton onClick={onNext}>Adatok ellenőrzése</PrimaryButton>
      </Footer>
    </div>
  );
}

// ── 6. Lakcím adatok ───────────────────────────────────────
function AddressDataStep({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <StepHead title="Lakcím adatok" />
      <Card>
        <InfoBox icon={Home}>
          Az adatok hitelességét ellenőrizzük. Kérjük, pontosan úgy töltsd ki, <b>ahogyan a lakcímkártyádon szerepel</b>.
        </InfoBox>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Irányítószám" placeholder="pl. 1144" defaultValue="1144" />
          <Field label="Település neve" placeholder="pl. Budapest" defaultValue="Budapest" />
          <Field label="Közterület neve" placeholder="pl. Ond vezér" defaultValue="Ond vezér" />
          <Field label="Közterület típusa" placeholder="pl. útja, utca, tér" defaultValue="útja" />
          <Field label="Házszám" placeholder="pl. 13-15." defaultValue="13-15." />
          <Field label="Emelet" placeholder="pl. 1. (nem kötelező)" defaultValue="1." />
          <Field label="Ajtó" placeholder="pl. 12. (nem kötelező)" defaultValue="12." />
        </div>
      </Card>
      <Footer>
        <PrimaryButton onClick={onNext}>Adatok ellenőrzése</PrimaryButton>
      </Footer>
    </div>
  );
}

// ── 7. Hozzájárulások ──────────────────────────────────────
const CONSENTS = [
  { id: "aszf", req: true, t: "Általános Szerződési Feltételek", s: "Elfogadom a lakossági Általános Szerződési Feltételeket és a mindenkori Díjszabást." },
  { id: "egyedi", req: true, t: "Egyedi előfizetői szerződés", s: "Elfogadom az egyedi előfizetői szerződés feltételeit." },
  { id: "adat", req: true, t: "Adatkezelési tájékoztató", s: "Megismertem az Adatkezelési tájékoztatót, és tudomásul veszem személyes adataim kezelését a szerződés teljesítéséhez." },
  { id: "mkt", req: false, t: "Marketing megkeresés", s: "Hozzájárulok, hogy a Yettel elektronikus úton személyre szabott ajánlatokat és hírlevelet küldjön." },
  { id: "partner", req: false, t: "Adatátadás partnereknek", s: "Hozzájárulok adataim marketingcélú átadásához partnervállalatoknak." },
];

function ConsentStep({
  consents,
  setConsents,
  onNext,
  requiredOk,
  eKomfort,
}: {
  consents: Record<string, boolean>;
  setConsents: (v: Record<string, boolean>) => void;
  onNext: () => void;
  requiredOk: boolean;
  eKomfort?: boolean;
}) {
  return (
    <div>
      <StepHead title="Hozzájárulások és nyilatkozatok" sub="A megrendelés véglegesítéséhez fogadd el az alábbi kötelező nyilatkozatokat." />
      {eKomfort && <EKomfortCard />}
      <div className="space-y-3">
        {CONSENTS.map((c) => {
          const on = !!consents[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setConsents({ ...consents, [c.id]: !on })}
              className={[
                "flex w-full gap-3 rounded-xl border bg-white p-4 text-left transition-colors sm:p-5",
                on ? "border-[#002340]" : "border-[#CDE0EA] hover:border-[#002340]",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                  on ? "border-[#002340] bg-[#B4FF00]" : "border-[#CDE0EA] bg-white",
                ].join(" ")}
              >
                {on && <Check className="h-3.5 w-3.5 text-[#002340]" strokeWidth={3} />}
              </span>
              <div>
                <p className="text-sm font-bold text-[#002340]">
                  {c.t}{" "}
                  <span
                    className={[
                      "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      c.req ? "bg-[#002340] text-[#B4FF00]" : "bg-[#E4F2F7] text-[#2D466C]",
                    ].join(" ")}
                  >
                    {c.req ? "Kötelező" : "Opcionális"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#2D466C]">{c.s}</p>
              </div>
            </button>
          );
        })}
      </div>
      <Footer>
        <PrimaryButton onClick={onNext} disabled={!requiredOk}>
          Tovább <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </Footer>
    </div>
  );
}

// ── 8. Időpontválasztás (weben 2 oszlop: naptár | kapcsolattartó) ──────────
function AppointmentStep({
  apptDate,
  apptSlot,
  setApptDate,
  setApptSlot,
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  contactNote,
  setContactNote,
  onNext,
}: {
  apptDate: Date | null;
  apptSlot: string | null;
  setApptDate: (d: Date) => void;
  setApptSlot: (s: string) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  contactNote: string;
  setContactNote: (v: string) => void;
  onNext: () => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));

  const grid = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startDow = (first.getDay() + 6) % 7; // hétfő = 0
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.y, view.m, d));
    return cells;
  }, [view]);

  const canGoPrev = view.y > today.getFullYear() || (view.y === today.getFullYear() && view.m > today.getMonth());
  const complete = apptDate && apptSlot && contactName.trim();

  return (
    <div>
      <StepHead title="Mikor menjen ki a szaktechnikus?" sub="A bekötéshez szaktechnikus érkezik a megadott címre. Válaszd ki a napot és az idősávot." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: v.m === 0 ? 11 : v.m - 1 }))}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#002340] transition-colors hover:bg-[#E4F2F7] disabled:opacity-30"
                aria-label="Előző hónap"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-extrabold text-[#002340]">
                {view.y}. {MONTHS_HU[view.m]}
              </span>
              <button
                type="button"
                onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }))}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#002340] transition-colors hover:bg-[#E4F2F7]"
                aria-label="Következő hónap"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#7E93B0]">
              {DOW.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((d, i) => {
                if (!d) return <span key={i} />;
                const past = d < today;
                const selected = apptDate && d.getTime() === apptDate.getTime();
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={past}
                    onClick={() => {
                      setApptDate(d);
                      setApptSlot("");
                    }}
                    className={[
                      "grid h-10 place-items-center rounded-lg text-sm font-semibold transition-colors",
                      selected ? "bg-[#002340] text-white" : past ? "text-[#CDE0EA]" : "text-[#002340] hover:bg-[#E4F2F7]",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </Card>

          {apptDate && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-[#002340]">Szabad idősávok</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setApptSlot(s)}
                    className={[
                      "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                      apptSlot === s ? "border-[#002340] bg-[#002340] text-white" : "border-[#CDE0EA] bg-white text-[#002340] hover:border-[#002340]",
                    ].join(" ")}
                  >
                    <Clock className="h-4 w-4" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Card>
          <div className="space-y-4">
            <Field label="Kapcsolattartó neve" placeholder="Add meg a nevet" value={contactName} onChange={setContactName} />
            <Field label="Telefonszám" placeholder="+36 20 000 0000" type="tel" value={contactPhone} onChange={setContactPhone} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#002340]">
                Megjegyzés a szaktechnikusnak <span className="font-medium text-[#7E93B0]">(opcionális)</span>
              </span>
              <textarea
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="Pl. kapucsengő nem működik, hívjon telefonon"
                rows={4}
                className="w-full rounded-xl border border-[#CDE0EA] bg-white px-4 py-3 text-sm text-[#002340] outline-none transition-colors placeholder:text-[#7E93B0] focus:border-[#002340]"
              />
            </label>
          </div>
        </Card>
      </div>
      <Footer>
        <PrimaryButton onClick={onNext} disabled={!complete}>
          Tovább <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </Footer>
    </div>
  );
}

// ── 9. Összefoglaló (weben 2 oszlop: tételek | összesítő) ──────────────────
function KRow({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm text-[#2D466C]">{k}</span>
      <span className={["max-w-[62%] text-right text-sm", strong ? "font-bold text-[#002340]" : "text-[#002340]"].join(" ")}>{v}</span>
    </div>
  );
}

function SummaryStep({
  pkg,
  extras,
  total,
  apptWhen,
  contactName,
  contactPhone,
  contactNote,
  onEditAppt,
  onFinish,
}: {
  pkg: Offer | null;
  extras: FlowExtra[];
  total: number;
  apptWhen: string;
  contactName: string;
  contactPhone: string;
  contactNote: string;
  onEditAppt: () => void;
  onFinish: () => void;
}) {
  return (
    <div>
      <StepHead title="Rendelés áttekintése" />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">Megrendelt szolgáltatások</p>
          <Card className="!p-4 sm:!p-5">
            {pkg && (
              <div
                className={[
                  "flex items-center justify-between gap-3 py-2.5",
                  extras.length > 0 ? "border-b border-[#CDE0EA]" : "",
                ].join(" ")}
              >
                <div>
                  <p className="text-sm font-bold text-[#002340]">{pkg.name}</p>
                  <p className="text-xs text-[#2D466C]">{pkg.features[0]}</p>
                </div>
                <span className="text-sm font-bold text-[#002340]">{formatFt(pkg.price)}</span>
              </div>
            )}
            {extras.map((extra, i) => (
              <div
                key={extra.key}
                className={[
                  "flex items-center justify-between gap-3 py-2.5",
                  i < extras.length - 1 ? "border-b border-[#CDE0EA]" : "",
                ].join(" ")}
              >
                <p className="text-sm text-[#002340]">{extra.title}</p>
                <span className={["text-sm", extra.price === 0 ? "font-semibold text-[#2D466C]" : "font-bold text-[#002340]"].join(" ")}>
                  {extra.price === 0 ? "Díjmentes" : formatFt(extra.price)}
                </span>
              </div>
            ))}
          </Card>

          <div className="mb-2 mt-5 flex items-center justify-between">
            <p className="text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">Kiszállási információk</p>
            <button type="button" onClick={onEditAppt} className="text-sm font-bold text-[#002340] hover:underline">
              Módosítom
            </button>
          </div>
          <Card className="!px-4 !py-1 sm:!px-5">
            <KRow k="Cím" v="1144 Budapest, Ond vezér útja 13-15." />
            <KRow k="Időpont" v={apptWhen} strong />
            <KRow k="Kapcsolattartó" v={contactName || "Nincs megadva"} />
            <KRow k="Telefonszám" v={contactPhone || "Nincs megadva"} />
            <KRow k="Megjegyzés" v={contactNote || "Nincs megadva"} />
          </Card>

          <p className="mb-2 mt-5 text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">Dokumentumok</p>
          <div className="flex items-center gap-3 rounded-[20px] border border-[#CDE0EA] bg-white px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#B4FF00] text-[#002340]">
              <FileText className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#002340]">Előszerződés</p>
              <p className="text-xs text-[#7E93B0]">PDF · elkészült</p>
            </div>
            <Download className="h-4 w-4 text-[#7E93B0]" />
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-[20px] bg-[#002340] p-5 text-white sm:p-6">
            <p className="text-sm text-[#BBD3E4]">Fizetendő havidíj</p>
            <p className="mt-0.5 text-3xl font-extrabold tracking-tight">
              {formatFt(total)}
              <span className="text-sm font-semibold text-[#BBD3E4]"> / hó</span>
            </p>
            <p className="mt-2 text-xs text-[#BBD3E4]">Az első számla a bekötés után érkezik. A telepítés díjmentes.</p>
            <button
              type="button"
              onClick={onFinish}
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#B4FF00] px-5 py-3.5 text-sm font-bold text-[#002340] transition-colors hover:bg-[#9BE000]"
            >
              Megrendelés véglegesítése
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 10. Siker ──────────────────────────────────────────────
function SuccessStep({ apptWhen, onHome }: { apptWhen: string; onHome: () => void }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-[#B4FF00] text-[#002340]">
        <Check className="h-10 w-10" strokeWidth={3} />
      </span>
      <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">Köszönjük a megrendelését!</h2>
      <p className="mt-3 max-w-md text-base text-[#2D466C]">
        A szaktechnikus a megadott időpontban — <b className="text-[#002340]">{apptWhen}</b> — érkezik a bekötéshez a megadott
        címre. A részleteket e-mailben is elküldtük.
      </p>
      <button
        type="button"
        onClick={onHome}
        className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#002340] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
      >
        Vissza a főoldalra
      </button>
    </div>
  );
}
