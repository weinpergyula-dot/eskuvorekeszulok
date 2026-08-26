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
      className={className ?? "text-[15px] sm:text-[18px] px-5 bg-transparent text-[#84AAA6] border border-[#84AAA6] hover:bg-[#84AAA6]/10 hover:text-[#84AAA6] cursor-pointer"}
    >
      Mutasd az elérhető szolgáltatókat
    </Button>
  );
}
