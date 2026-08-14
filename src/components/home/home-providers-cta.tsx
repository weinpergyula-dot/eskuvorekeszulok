"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Úszó gomb a főoldalon (a zenelejátszó / akadálymentesítés gombokhoz hasonló
 * stílusban, de középen), ami legördít a szolgáltatói szekcióhoz. Amint a
 * #szolgaltatok szekció láthatóvá válik (scrollozással vagy a gombbal), eltűnik.
 */
export function HomeProvidersCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("szolgaltatok");
    if (!target) return;
    // Hide the button once any part of the providers section is in view.
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  const scrollToProviders = () => {
    document.getElementById("szolgaltatok")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToProviders}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm px-5 py-2.5 text-sm font-semibold text-[#84AAA6] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
    >
      Megnézem a kínálatot
      <ChevronDown className="h-4 w-4 shrink-0" />
    </button>
  );
}
