"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "cookieConsent";

function updateGtagConsent(granted: boolean) {
  if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    } else if (stored === "accepted") {
      updateGtagConsent(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    updateGtagConsent(true);
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop — elsötétíti az oldalt és blokkolja az interakciókat */}
      <div className="fixed inset-0 z-[9997] bg-[#2a1030]/30 backdrop-blur-[2px]" />

      {/* Cookie popup — a backdrop fölött */}
      <div className="fixed bottom-0 left-0 right-0 z-[9998] px-4 pb-4 sm:px-6">
      <div className="max-w-3xl mx-auto glass-strong rounded-[26px] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 leading-relaxed">
            Az oldal alapvető cookie-kat használ a bejelentkezési munkamenethez, és – hozzájárulás esetén – Google Analytics sütiket a névtelen forgalomméréshez. A beállítás bármikor módosítható. Részletek a{" "}
            <Link href="/cookies" className="text-[#E8336A] underline hover:text-[#CC2257]">
              Cookie szabályzatban
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white/80 text-[#4A4360] ring-1 ring-black/5 hover:bg-white transition-colors"
          >
            Elutasítom
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-full text-sm font-medium rose-cta transition"
          >
            Elfogadom
          </button>
          <button
            onClick={decline}
            aria-label="Bezárás"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
