import { ArrowRight, Check, Plus } from "lucide-react";
import { LivePhonePreview } from "./phone-preview";
import { MeghivoQuoteCta } from "./quote-cta";

/**
 * Egy csomag a kollázsban. Két elrendezés van: a "square" a két négyzetes
 * csempéhez (BASIC, SILVER), a "wide" a széles PREMIUM blokkhoz. Mindkettő
 * teljesen a csomag színébe öltözik – a telefon-előnézet, a jellemzők és a
 * választható extrák ugyanazon a színes felületen ülnek.
 */

export type Package = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  /** Korábbi ár – áthúzva, kisebben jelenik meg az aktuális ár mellett. */
  oldPrice?: string;
  priceNote?: string;
  /** A csempe színvilága: világos → alap → sötét. */
  from: string;
  accent: string;
  to: string;
  /** A szöveg színe a fehér felületeken (jelvény, gomb). */
  ink: string;
  sampleHref: string;
  features: readonly string[];
  /** Felárért kérhető kiegészítők: a felár a sor jobb szélén jelenik meg. */
  extras: readonly { label: string; price: string }[];
};

function Head({ pkg }: { pkg: Package }) {
  return (
    <div>
      <span
        className="inline-flex items-center rounded-full bg-white/95 px-4 py-1.5 text-[13px] font-extrabold uppercase tracking-[0.22em] shadow-sm"
        style={{ color: pkg.ink }}
      >
        {pkg.name}
      </span>
      <p className="mt-3 text-lg font-semibold leading-snug text-white sm:text-xl">
        {pkg.tagline}
      </p>
    </div>
  );
}

function Features({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2 text-[15px] leading-snug text-white/95">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          {f}
        </li>
      ))}
    </ul>
  );
}

function Extras({ items }: { items: Package["extras"] }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
        Választható extrák
      </p>
      <ul className="mt-2.5 grid gap-2">
        {items.map((x) => (
          <li
            key={x.label}
            className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/12 px-3 py-2 text-[13px] leading-tight text-white/95 backdrop-blur-sm"
          >
            <Plus className="h-3.5 w-3.5 shrink-0 text-white/70" strokeWidth={2.5} />
            <span className="min-w-0 flex-1">{x.label}</span>
            <span className="shrink-0 whitespace-nowrap font-bold text-white/80">{x.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Price({ pkg }: { pkg: Package }) {
  return (
    <div>
      <p className="flex items-baseline gap-2 leading-none">
        {pkg.oldPrice && (
          <span className="text-base font-semibold text-white/60 line-through">
            {pkg.oldPrice}
          </span>
        )}
        <span className="text-[28px] font-bold text-white">{pkg.price}</span>
      </p>
      {pkg.priceNote && <p className="mt-1.5 text-xs text-white/70">{pkg.priceNote}</p>}
    </div>
  );
}

function Cta({ pkg }: { pkg: Package }) {
  return (
    <MeghivoQuoteCta
      href={`/profil?tab=quotes&form=meghivo&csomag=${pkg.name}`}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-bold shadow-md transition-transform hover:scale-[1.03]"
      style={{ color: pkg.ink }}
    >
      Ajánlatot kérek
      <ArrowRight className="h-4 w-4" />
    </MeghivoQuoteCta>
  );
}

/** A színes felület: alapgradiens, fénypont felül, mélyebb sarok alul. */
function Surface({ pkg }: { pkg: Package }) {
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(150deg, ${pkg.from} 0%, ${pkg.accent} 46%, ${pkg.to} 100%)`,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 18% 0%, rgba(255,255,255,0.30), rgba(255,255,255,0) 62%), radial-gradient(60% 50% at 100% 100%, rgba(0,0,0,0.22), rgba(0,0,0,0) 65%)",
        }}
      />
      {/* apró, halvány fehér fényjáték – lassan úszik a felületen */}
      <span aria-hidden className="pkg-glints absolute inset-0" />
    </>
  );
}

/** A telefon halvány fényudvaron ül, enyhén megdöntve. */
function PhoneSlot({ pkg }: { pkg: Package }) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute -inset-6 rounded-full opacity-60 blur-2xl"
        style={{ background: `radial-gradient(circle, ${pkg.from}, transparent 68%)` }}
      />
      <div className="relative">
        <LivePhonePreview href={pkg.sampleHref} label={pkg.name} />
      </div>
      <p className="relative mt-3 text-center text-[11px] text-white/70">
        Kattints a telefonra a mintáért
      </p>
    </div>
  );
}

export function PackageTile({ pkg, variant }: { pkg: Package; variant: "square" | "wide" }) {
  const shell =
    "relative isolate flex flex-col overflow-hidden rounded-[28px] p-6 text-white shadow-[0_30px_70px_-30px_rgba(20,45,42,0.6)] ring-1 ring-white/25 sm:p-8";

  /* Mobilon a sorrend: fejléc → telefon → jellemzők → extrák, hogy a látvány
     előbb jöjjön, mint a hosszú felsorolások. Nagyobb kijelzőn rácsba
     rendeződik, a telefon jobbra kerül. */
  if (variant === "wide") {
    return (
      <article id={pkg.id} className={`${shell} lg:col-span-2`}>
        <Surface pkg={pkg} />

        <div className="relative flex flex-1 flex-col gap-7 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch lg:gap-10">
          <div className="lg:flex lg:flex-col lg:gap-7">
            <Head pkg={pkg} />
            <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:mt-0">
              <Features items={pkg.features} />
              <Extras items={pkg.extras} />
            </div>
            <div className="mt-auto hidden flex-wrap items-end justify-between gap-4 border-t border-white/25 pt-6 lg:flex">
              <Price pkg={pkg} />
              <Cta pkg={pkg} />
            </div>
          </div>

          <div className="mx-auto lg:mx-0 lg:self-center">
            <PhoneSlot pkg={pkg} />
          </div>
        </div>

        {/* Kisebb kijelzőn az ár és a gomb a csempe aljára kerül */}
        <div className="relative mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/25 pt-6 lg:hidden">
          <Price pkg={pkg} />
          <Cta pkg={pkg} />
        </div>
      </article>
    );
  }

  return (
    <article id={pkg.id} className={shell}>
      <Surface pkg={pkg} />

      <div className="relative flex flex-1 flex-col gap-6 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-7">
        <div className="sm:col-start-1 sm:row-start-1">
          <Head pkg={pkg} />
        </div>

        <div className="mx-auto sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mx-0 sm:self-center">
          <PhoneSlot pkg={pkg} />
        </div>

        <div className="flex flex-col gap-6 sm:col-start-1 sm:row-start-2">
          <Features items={pkg.features} />
          <Extras items={pkg.extras} />
        </div>
      </div>

      <div className="relative mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/25 pt-6">
        <Price pkg={pkg} />
        <Cta pkg={pkg} />
      </div>
    </article>
  );
}
