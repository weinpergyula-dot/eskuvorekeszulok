"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { UserRole } from "@/lib/types";

interface TourStep {
  selector: string;
  mobileSelector?: string; // targets an item in the navbar user-dropdown on mobile
  side: "bottom" | "right";
  title: string;
  description: string;
}

const VISITOR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="nav-categories"]',
    // mobile: LayoutGrid icon in navbar also carries this attr, picked by visible-element scan
    side: "bottom",
    title: "Kategóriák",
    description: "Böngészd az esküvői szolgáltatókat kategóriánként – fotósok, virágkötők, zenészek és sok más. Szűrj megye szerint, és nézd meg az értékeléseket.",
  },
  {
    selector: '[data-tour="sidebar-quotes"]',
    mobileSelector: '[data-tour="dropdown-quotes"]',
    side: "right",
    title: "Ajánlatkérés",
    description: "Küldj egyéni vagy csoportos ajánlatkérést egyszerre több szolgáltatónak – egy kattintással, ingyenesen.",
  },
  {
    selector: '[data-tour="sidebar-favorites"]',
    mobileSelector: '[data-tour="dropdown-favorites"]',
    side: "right",
    title: "Kedvencek",
    description: "Mentsd el a neked tetsző szolgáltatókat, hogy később könnyen megtalálhasd őket.",
  },
  {
    selector: '[data-tour="sidebar-chat"]',
    mobileSelector: '[data-tour="dropdown-chat"]',
    side: "right",
    title: "Chat",
    description: "A szolgáltatókkal folytatott beszélgetéseket ebben a menüpontban találhatod.",
  },
];

const PROVIDER_STEPS: TourStep[] = [
  {
    selector: '[data-tour="sidebar-provider"]',
    mobileSelector: '[data-tour="dropdown-provider"]',
    side: "right",
    title: "Szolgáltatói profil",
    description: "Töltsd ki és tartsd naprakészen a profilodat – ez jelenik meg az érdeklődő pároknak. Az adminisztrátor jóváhagyása után lesz látható.",
  },
  {
    selector: '[data-tour="sidebar-dashboard"]',
    mobileSelector: '[data-tour="dropdown-dashboard"]',
    side: "right",
    title: "Dashboard",
    description: "Kövesd nyomon a megtekintéseidet, értékeléseidet és profil státuszodat.",
  },
  {
    selector: '[data-tour="sidebar-chat"]',
    mobileSelector: '[data-tour="dropdown-chat"]',
    side: "right",
    title: "Chat",
    description: "Itt érnek el a párok üzenetei és az ajánlatkérések – válaszolj közvetlenül innen.",
  },
];

const STORAGE_KEY = (id: string) => `onboarding_done_${id}`;
const GAP = 14;
const PAD = 6;
const TOOLTIP_W = 300;

interface Rect { top: number; left: number; width: number; height: number }

export function OnboardingTour({ userId, role }: { userId: string; role: UserRole }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const steps = role === "provider" ? PROVIDER_STEPS : VISITOR_STEPS;
  const current = steps[stepIdx];

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(STORAGE_KEY(userId))) return;
    const t = setTimeout(() => setShouldShow(true), 700);
    return () => clearTimeout(t);
  }, [userId]);

  // Desktop only: all provider sidebar elements live on /profil
  useEffect(() => {
    if (!shouldShow) return;
    const isMobileView = window.innerWidth < 640;
    if (!isMobileView && role === "provider" && pathname !== "/profil") {
      router.push("/profil");
      return; // re-fires when pathname becomes /profil
    }
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, [shouldShow, role, pathname, router]);

  // Open / close the mobile navbar user-dropdown for steps that need it
  useEffect(() => {
    if (!visible || !current) return;
    const isMobileView = window.innerWidth < 640;
    if (!isMobileView) return;
    if (current.mobileSelector) {
      window.dispatchEvent(new CustomEvent("tour-open-mobile-dropdown"));
    } else {
      window.dispatchEvent(new CustomEvent("tour-close-mobile-dropdown"));
    }
  }, [visible, current]);

  // Pick the first matching element that is actually painted (non-zero rect)
  const measureEl = useCallback(() => {
    if (!current) return;
    const isMobileView = window.innerWidth < 640;
    const selector =
      isMobileView && current.mobileSelector
        ? current.mobileSelector
        : current.selector;

    const candidates = document.querySelectorAll(selector);
    let el: Element | null = null;
    for (const candidate of candidates) {
      const r = candidate.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) { el = candidate; break; }
    }
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [current]);

  // Re-measure after step/page changes; 80 ms lets the dropdown render first
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(measureEl, 80);
    window.addEventListener("resize", measureEl);
    return () => { clearTimeout(t); window.removeEventListener("resize", measureEl); };
  }, [visible, measureEl, pathname]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY(userId), "1");
    setVisible(false);
    window.dispatchEvent(new CustomEvent("tour-close-mobile-dropdown"));
  };

  const next = () => {
    setRect(null); // clear spotlight during transition
    if (stepIdx < steps.length - 1) setStepIdx(i => i + 1);
    else finish();
  };

  if (!mounted || !visible || !current) return null;

  const isMobile = window.innerWidth < 640;
  const isLast = stepIdx === steps.length - 1;

  const tooltipStyle = (): React.CSSProperties => {
    // Centered fallback (no element found)
    if (!rect) return {
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)", width: "min(340px,90vw)",
    };

    if (isMobile) {
      // For dropdown steps: position tooltip below the entire dropdown panel
      let top = rect.top + rect.height + PAD + GAP;
      if (current.mobileSelector) {
        const panel = document.querySelector('[data-tour="dropdown-panel"]');
        if (panel) top = panel.getBoundingClientRect().bottom + GAP;
      }
      return {
        position: "fixed",
        top,
        left: 12,
        right: 12,
        // translate3d forces GPU compositing — fixes iOS touch-event hit-area misalignment
        transform: "translate3d(0,0,0)",
      };
    }

    if (current.side === "bottom") return {
      position: "fixed",
      top: rect.top + rect.height + PAD + GAP,
      left: Math.max(12, Math.min(
        rect.left + rect.width / 2 - TOOLTIP_W / 2,
        window.innerWidth - TOOLTIP_W - 12,
      )),
      width: TOOLTIP_W,
      transform: "translate3d(0,0,0)",
    };

    // right (desktop sidebar)
    return {
      position: "fixed",
      top: Math.max(12, rect.top + rect.height / 2 - 100),
      left: rect.left + rect.width + PAD + GAP,
      width: TOOLTIP_W,
      transform: "translate3d(0,0,0)",
    };
  };

  return createPortal(
    <>
      {/* Spotlight overlay */}
      {rect ? (
        <div style={{
          position: "fixed",
          top: rect.top - PAD, left: rect.left - PAD,
          width: rect.width + PAD * 2, height: rect.height + PAD * 2,
          borderRadius: 10,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
          zIndex: 9997,
          pointerEvents: "none",
          outline: "2px solid rgba(255,255,255,0.25)",
        }} />
      ) : (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", zIndex: 9997 }} />
      )}

      {/* Tooltip card */}
      <div style={{ ...tooltipStyle(), zIndex: 9999 }}
        className="bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-bold text-gray-900 flex-1 text-center">Hasznos menüpontok</h2>
          <button onClick={finish} className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 ml-2 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <hr className="border-gray-200 mb-3" />
        <span className="text-[11px] font-semibold uppercase tracking-wider block mb-3" style={{ color: "#84AAA6" }}>
          {stepIdx + 1} / {steps.length}
        </span>
        <h3 className="text-base font-bold text-gray-900 mb-2">{current.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">{current.description}</p>
        <button
          onClick={next}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer"
          style={{ backgroundColor: "#84AAA6" }}
        >
          {isLast ? "Kezdjük el! 🎉" : "Tovább →"}
        </button>
      </div>
    </>,
    document.body
  );
}
