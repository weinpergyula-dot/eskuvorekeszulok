"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Lock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── Bejelentkezési állapot ──────────────────────────────────────────────
   Egy listában sok kártya kérdezi ugyanazt, ezért egyetlen közös
   feliratkozás tartja nyilván (a session a böngészőben van, nincs hálózati
   kérés). Amíg nem tudjuk, addig a takart nézet látszik. */
let authState: boolean | null = null;
const listeners = new Set<() => void>();
let subscribed = false;

function setAuth(v: boolean) {
  authState = v;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!subscribed) {
    subscribed = true;
    const supabase = createClient();
    if (!supabase) setAuth(false);
    else {
      supabase.auth.getSession().then(({ data: { session } }) => setAuth(!!session));
      supabase.auth.onAuthStateChange((_e, session) => setAuth(!!session));
    }
  }
  return () => { listeners.delete(listener); };
}

export function useIsLoggedIn(): boolean | null {
  return useSyncExternalStore(subscribe, () => authState, () => null);
}

/* ── Takart elérhetőség ─────────────────────────────────────────────────
   Kijelentkezett látogatónak az érték első fele látszik (`fullyHidden`
   esetén semmi), a takart rész helyén elmosott kitöltés áll (a valódi karakterek nem kerülnek a
   DOM-ba), mögötte a „Mutat” gomb a tájékoztató ablakot nyitja. */
export function MaskedContact({
  value,
  className = "text-base text-gray-900 break-all",
  linkColor = "text-[#84AAA6]",
  fullyHidden = false,
  children,
}: {
  value: string;
  className?: string;
  linkColor?: string;
  /** Igaz esetén semmi sem látszik az értékből, az egész el van mosva. */
  fullyHidden?: boolean;
  /** Bejelentkezve ez jelenik meg (pl. kattintható link). */
  children: React.ReactNode;
}) {
  const loggedIn = useIsLoggedIn();
  const [open, setOpen] = useState(false);

  if (loggedIn) return <>{children}</>;

  const half = fullyHidden ? 0 : Math.ceil(value.length / 2);
  const visible = value.slice(0, half);
  const hiddenLen = value.length - half;

  return (
    <>
      <span className={className}>
        {visible}
        <span aria-hidden className="select-none blur-[4px]">
          {"x".repeat(Math.max(hiddenLen, 3))}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setOpen(true);
          }}
          className={`ml-2 text-sm font-semibold ${linkColor} hover:underline cursor-pointer`}
        >
          Mutat
        </button>
      </span>
      {open && <LoginRequiredDialog onClose={() => setOpen(false)} />}
    </>
  );
}

/* ── Chat indítása ──────────────────────────────────────────────────────
   Bejelentkezve sima link a profil Chat menüpontjára; kijelentkezve a
   kattintás nem navigál, hanem a tájékoztató ablakot nyitja. */
export function ChatLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <LoginGateLink
      message="A chat csak regisztrált felhasználók számára érhető el."
      {...props}
    />
  );
}

/** Link, ami kijelentkezett látogatónak navigálás helyett a tájékoztató
    ablakot nyitja (`message` az ablak első mondata). */
export function LoginGateLink({
  onClick,
  message,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { message: string }) {
  const loggedIn = useIsLoggedIn();
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        {...props}
        onClick={(e) => {
          if (loggedIn === false) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
            return;
          }
          onClick?.(e);
        }}
      />
      {open && (
        <LoginRequiredDialog
          message={message}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function LoginRequiredDialog({
  onClose,
  message = "A szolgáltatók teljes elérhetőségét csak regisztrált felhasználók láthatják.",
  footer,
}: {
  onClose: () => void;
  message?: string;
  /** A gombok alatt megjelenő kiegészítés (pl. telefonos elérhetőség). */
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      // A portálon belüli kattintás a React-fában a kártyáig buborékolna.
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Bezár"
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <LoginRequiredContent message={message} />
        {footer}
      </div>
    </div>,
    document.body,
  );
}

/**
 * A „csak regisztrált felhasználóknak" tájékoztató tartalma (ikon, cím,
 * szöveg, Belépés / Regisztráció gomb) – a LoginRequiredDialog és a
 * csoportos ajánlatkérés felugró ablaka is ezt mutatja.
 */
export function LoginRequiredContent({ message }: { message: string }) {
  const next = typeof window !== "undefined"
    ? encodeURIComponent(window.location.pathname + window.location.search)
    : "";

  return (
    <>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#84AAA6]/15">
        <Lock className="h-6 w-6 text-[#84AAA6]" />
      </div>
      <h2 id="login-required-title" className="text-lg font-semibold text-gray-900 mb-2">
        Csak regisztrált felhasználóknak
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {message} Ha már regisztráltál, lépj be, ha még nem, regisztrálj látogatóként –
        1 perc alatt megvan.
      </p>
      <div className="flex flex-col gap-2">
        <a
          href={`/auth/login${next ? `?next=${next}` : ""}`}
          className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A] text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          Belépés
        </a>
        <a
          href="/auth/register?type=visitor"
          className="w-full border border-[#B5677D] text-[#B5677D] hover:bg-[#B5677D]/10 font-semibold py-2.5 rounded-lg transition-colors"
        >
          Regisztrálok látogatóként
        </a>
      </div>
    </>
  );
}
