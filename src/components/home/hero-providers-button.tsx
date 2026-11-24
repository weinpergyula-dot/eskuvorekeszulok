"use client";

import { Button } from "@/components/ui/button";

/**
 * Hero banner gomb: nem navigál, hanem simán legördít a főoldali
 * szolgáltatói szekcióhoz (#szolgaltatok).
 */
export function HeroProvidersButton({ className }: { className?: string }) {
  const scrollToProviders = () => {
    document.getElementById("szolgaltatok")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      onClick={scrollToProviders}
      size="lg"
      className={className ?? "text-[15px] sm:text-[18px] px-5 bg-transparent text-[#E8336A] border border-[#E8336A] hover:bg-[#E8336A]/10 hover:text-[#E8336A] cursor-pointer"}
    >
      Mutasd az elérhető szolgáltatókat
    </Button>
  );
}
