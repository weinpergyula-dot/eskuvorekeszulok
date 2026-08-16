"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode, type ElementType } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Router,
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
} from "lucide-react";
import { formatFt } from "../_data/offers";

// ── A /yettel_light_asis otthoni internet folyamata, teljes oldalas webes
//    dizájnnal. Minden lépés saját URL-hash-t kap (#otthoni-internet/<lépés>),
//    hogy később analitika épülhessen rá. ──────────────────────────────────

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

const HASH_BASE = "otthoni-internet";
const STEP_HASH: Record<Step, string> = {
  address: `${HASH_BASE}/cim`,
  checking: `${HASH_BASE}/elerhetoseg`,
  offers: `${HASH_BASE}/ajanlatok`,
  extras: `${HASH_BASE}/extrak`,
  personal: `${HASH_BASE}/szemelyes-adatok`,
  personalCheck: `${HASH_BASE}/szemelyes-adatok-ellenorzes`,
  address2: `${HASH_BASE}/lakcim`,
  address2Check: `${HASH_BASE}/lakcim-ellenorzes`,
  consent: `${HASH_BASE}/hozzajarulasok`,
  appointment: `${HASH_BASE}/idopont`,
  summary: `${HASH_BASE}/osszefoglalo`,
  success: `${HASH_BASE}/kesz`,
};
const HASH_TO_STEP: Record<string, Step> = Object.fromEntries(
  Object.entries(STEP_HASH).map(([k, v]) => [v, k as Step])
) as Record<string, Step>;

type Pkg = { name: string; bw: string; price: number; note: string };

const PACKAGES: Pkg[] = [
  { name: "HiperNet L", bw: "1000 Mbit/s", price: 7990, note: "e-Komfort, 12 hó hűséggel" },
  { name: "HiperNet M", bw: "500 Mbit/s", price: 6990, note: "e-Komfort, 12 hó hűséggel" },
];

const SLOTS = ["08:00 – 12:00", "12:00 – 16:00", "16:00 – 20:00"];
const MONTHS_HU = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];
const DOW = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

// A stepper 6 fő lépése (az extráktól az összefoglalóig).
const STEPPER: { key: Step; label: string }[] = [
  { key: "extras", label: "Extrák" },
  { key: "personal", label: "Személyes adatok" },
  { key: "address2", label: "Lakcím" },
  { key: "consent", label: "Hozzájárulások" },
  { key: "appointment", label: "Időpont" },
  { key: "summary", label: "Összefoglaló" },
];
const STEP_TO_STEPPER: Partial<Record<Step, number>> = {
  extras: 0,
  personal: 1,
  personalCheck: 1,
  address2: 2,
  address2Check: 2,
  consent: 3,
  appointment: 4,
  summary: 5,
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatDateHu(d: Date) {
  return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`;
}

export function InternetFlow() {
  const [step, setStep] = useState<Step | null>(null);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [childFilter, setChildFilter] = useState(true);
  const [netPajzs, setNetPajzs] = useState(false);
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
      if (!h.startsWith(HASH_BASE)) {
        setStep(null);
        return;
      }
      setStep(HASH_TO_STEP[h] ?? "address");
    };
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, []);

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
  }, []);
  // Töltő képernyők után lecseréljük a hash-t (a Vissza kihagyja a töltőt).
  const goReplace = useCallback((s: Step) => {
    window.history.replaceState(null, "", `#${STEP_HASH[s]}`);
    setStep(s);
  }, []);
  const closeFlow = useCallback(() => {
    window.location.hash = "internet";
  }, []);
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
  const total = (pkg?.price ?? 0) + (netPajzs ? 490 : 0);
  const apptWhen = apptDate && apptSlot ? `${formatDateHu(apptDate)} · ${apptSlot}` : "—";

  if (step === null) return null;

  const stepperIdx = STEP_TO_STEPPER[step];
  const isLoader = step === "checking" || step === "personalCheck" || step === "address2Check";
  const wide = step === "offers" || step === "appointment" || step === "summary";

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
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#E4F2F7]">
      {/* Felső sáv: vissza · márka · bezárás */}
      <header className="sticky top-0 z-10 border-b border-[#CDE0EA] bg-white/95 backdrop-blur">
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
          <span className="flex items-end gap-1" aria-label="Yettel – Otthoni internet igénylése">
            <span className="text-lg font-extrabold tracking-tight text-[#002340]">Yettel</span>
            <span aria-hidden className="mb-0.5 inline-block h-2 w-2 rounded-full bg-[#B4FF00]" />
            <span className="ml-2 hidden text-sm font-semibold text-[#2D466C] sm:inline">Otthoni internet</span>
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
        {stepperIdx !== undefined && <Stepper current={stepperIdx} />}
      </header>

      <main className={["mx-auto px-4 py-8 sm:px-6 sm:py-10", wide ? "max-w-4xl" : "max-w-2xl"].join(" ")}>
        {step === "address" && <AddressStep onNext={() => go("checking")} />}
        {isLoader && (
          <Loader
            title={step === "checking" ? "Elérhetőség ellenőrzése…" : "Adatok ellenőrzése folyamatban…"}
            sub={
              step === "checking"
                ? "Megnézzük, elérhető-e a szolgáltatás a megadott címen. Érdemes egy picit várni."
                : "Ez néha hosszabb időt is igénybe vehet — érdemes egy picit várni. Kérjük, ne zárd be az ablakot."
            }
          />
        )}
        {step === "offers" && (
          <OffersStep
            onSelect={(p) => {
              setPkg(p);
              go("extras");
            }}
          />
        )}
        {step === "extras" && (
          <ExtrasStep
            childFilter={childFilter}
            netPajzs={netPajzs}
            setChildFilter={setChildFilter}
            setNetPajzs={setNetPajzs}
            onNext={() => go("personal")}
          />
        )}
        {step === "personal" && <PersonalStep onNext={() => go("personalCheck")} />}
        {step === "address2" && <AddressDataStep onNext={() => go("address2Check")} />}
        {step === "consent" && (
          <ConsentStep consents={consents} setConsents={setConsents} onNext={() => go("appointment")} requiredOk={requiredOk} />
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
            childFilter={childFilter}
            netPajzs={netPajzs}
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
      </main>
    </div>
  );
}

// ── Stepper (webes: számozott + felirat, mobil: sáv + "X / 6") ─────────────
function Stepper({ current }: { current: number }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-3 pt-1 sm:px-6">
      {/* Desktop: számozott lépések felirattal */}
      <ol className="hidden items-center gap-1 sm:flex">
        {STEPPER.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={[
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                  done ? "bg-[#B4FF00] text-[#002340]" : active ? "bg-[#002340] text-white" : "bg-[#CDE0EA] text-[#2D466C]",
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={[
                  "whitespace-nowrap text-xs font-bold",
                  active ? "text-[#002340]" : "text-[#2D466C]",
                ].join(" ")}
              >
                {s.label}
              </span>
              {i < STEPPER.length - 1 && (
                <span className={["mx-1 h-0.5 flex-1 rounded", done ? "bg-[#B4FF00]" : "bg-[#CDE0EA]"].join(" ")} />
              )}
            </li>
          );
        })}
      </ol>
      {/* Mobil: sáv + aktuális lépés */}
      <div className="sm:hidden">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold text-[#002340]">{STEPPER[current].label}</span>
          <span className="text-xs font-semibold text-[#7E93B0]">
            {current + 1} / {STEPPER.length}. lépés
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPPER.map((s, i) => (
            <span
              key={s.key}
              className={[
                "h-1.5 flex-1 rounded-full",
                i < current ? "bg-[#B4FF00]" : i === current ? "bg-[#002340]" : "bg-[#CDE0EA]",
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
  return <div className={["rounded-[20px] border border-[#CDE0EA] bg-white p-5 sm:p-6", className].join(" ")}>{children}</div>;
}

function Field({
  label,
  placeholder,
  defaultValue,
  value,
  onChange,
  type = "text",
  optional,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#002340]">
        {label} {optional && <span className="font-medium text-[#7E93B0]">(opcionális)</span>}
      </span>
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

// ── 1. Címed ────────────────────────────────────────────────
function AddressStep({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <StepHead
        title="Hova szeretnél otthoni internetet?"
        sub="Add meg a címed, és mutatjuk az elérhető ajánlatokat! Ha nem találod, amit keresel, gépelj tovább a pontosabb találatokért."
      />
      <Card>
        <div className="space-y-4">
          <Field label="Település vagy irányítószám" placeholder="1097" />
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

// ── 3. Ajánlatok a címeden (weben 2 oszlop) ────────────────
function OffersStep({ onSelect }: { onSelect: (p: Pkg) => void }) {
  return (
    <div>
      <StepHead title="Ajánlatok a címeden" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-[#CDE0EA]">
        <p className="text-sm font-semibold text-[#002340]">1144 Budapest XIV. ker., Ond vezér útja 13-15. 1. em. 12.</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#B4FF00]/25 px-3 py-1 text-xs font-bold text-[#002340]">
          <CheckCircle2 className="h-3.5 w-3.5" /> Elérhető a címeden
        </span>
      </div>
      <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">Internet</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {PACKAGES.map((p) => (
          <div key={p.name} className="relative flex flex-col rounded-[20px] border border-[#CDE0EA] bg-white p-5 sm:p-6">
            <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-[#B4FF00] px-3 py-1 text-xs font-bold text-[#002340]">
              30 nap díjmentes
            </span>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h3 className="text-xl font-extrabold text-[#002340]">{p.name}</h3>
              <span className="text-xs text-[#7E93B0]">{p.note}</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[#002340]">{p.bw}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#2D466C]">
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#002340]" /> Optikai internet</li>
              <li className="flex items-center gap-2"><Router className="h-4 w-4 text-[#002340]" /> WiFi 7 router</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#002340]" /> Díjmentes telepítés</li>
            </ul>
            <div className="mt-5 flex items-end justify-between gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-[#002340]">
                {formatFt(p.price)}
                <span className="text-sm font-semibold text-[#2D466C]"> / hó</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#002340] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
            >
              Kiválasztom <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] bg-white px-3 py-2.5 text-sm font-bold text-[#002340]">
          <MessageCircle className="h-4 w-4" /> Chat
        </span>
        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] bg-white px-3 py-2.5 text-sm font-bold text-[#002340]">
          <Phone className="h-4 w-4" /> Visszahívást kérek
        </span>
      </div>
    </div>
  );
}

// ── 4. Extrák ──────────────────────────────────────────────
function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={[
          "inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors",
          value ? "border-[#002340] bg-[#002340] text-white" : "border-[#CDE0EA] text-[#002340] hover:border-[#002340]",
        ].join(" ")}
      >
        <Check className="h-4 w-4" /> Kérem
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={[
          "inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors",
          !value ? "border-[#002340] bg-[#002340] text-white" : "border-[#CDE0EA] text-[#002340] hover:border-[#002340]",
        ].join(" ")}
      >
        <X className="h-4 w-4" /> Nem kérem
      </button>
    </div>
  );
}

function ExtrasStep({
  childFilter,
  netPajzs,
  setChildFilter,
  setNetPajzs,
  onNext,
}: {
  childFilter: boolean;
  netPajzs: boolean;
  setChildFilter: (v: boolean) => void;
  setNetPajzs: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHead title="Extrák választása" sub="Válaszd ki, milyen kiegészítőt szeretnél a szolgáltatásod mellé." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold text-[#002340]">Gyermekvédelmi tartalomszűrő</p>
              <span className="mt-1 inline-block rounded-full bg-[#E4F2F7] px-3 py-1 text-xs font-bold text-[#002340]">Díjmentes</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#2D466C]">
            A kiskorú internetezők védelmében blokkolja a hatósági lista szerinti, felnőtt tartalmakat kínáló weboldalakat.
            Később is igényelheted és bármikor lemondhatod.
          </p>
          <YesNo value={childFilter} onChange={setChildFilter} />
        </Card>

        <Card>
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold text-[#002340]">NetPajzs</p>
              <span className="mt-1 inline-block rounded-full bg-[#E4F2F7] px-3 py-1 text-xs font-bold text-[#002340]">490 Ft / hó</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#2D466C]">
            Beépített védelem a káros és csaló weboldalak, vírusok és adathalász támadások ellen — a hálózat szintjén, minden
            otthoni eszközödön.
          </p>
          <YesNo value={netPajzs} onChange={setNetPajzs} />
        </Card>
      </div>
      <Footer>
        <PrimaryButton onClick={onNext}>
          Tovább <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </Footer>
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
}: {
  consents: Record<string, boolean>;
  setConsents: (v: Record<string, boolean>) => void;
  onNext: () => void;
  requiredOk: boolean;
}) {
  return (
    <div>
      <StepHead title="Hozzájárulások és nyilatkozatok" sub="A megrendelés véglegesítéséhez fogadd el az alábbi kötelező nyilatkozatokat." />
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
  childFilter,
  netPajzs,
  total,
  apptWhen,
  contactName,
  contactPhone,
  contactNote,
  onEditAppt,
  onFinish,
}: {
  pkg: Pkg | null;
  childFilter: boolean;
  netPajzs: boolean;
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
        {/* Bal: tételek */}
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.05em] text-[#2D466C]">Megrendelt szolgáltatások</p>
          <Card className="!p-4 sm:!p-5">
            {pkg && (
              <div className="flex items-center justify-between gap-3 border-b border-[#CDE0EA] py-2.5">
                <div>
                  <p className="text-sm font-bold text-[#002340]">{pkg.name}</p>
                  <p className="text-xs text-[#2D466C]">{pkg.bw} · optikai</p>
                </div>
                <span className="text-sm font-bold text-[#002340]">{formatFt(pkg.price)}</span>
              </div>
            )}
            {childFilter && (
              <div className="flex items-center justify-between gap-3 border-b border-[#CDE0EA] py-2.5">
                <p className="text-sm text-[#002340]">Gyermekvédelmi tartalomszűrő</p>
                <span className="text-sm font-semibold text-[#2D466C]">Díjmentes</span>
              </div>
            )}
            {netPajzs && (
              <div className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-sm text-[#002340]">NetPajzs</p>
                <span className="text-sm font-bold text-[#002340]">{formatFt(490)}</span>
              </div>
            )}
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

        {/* Jobb: összesítő + véglegesítés (weben ragadós) */}
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
