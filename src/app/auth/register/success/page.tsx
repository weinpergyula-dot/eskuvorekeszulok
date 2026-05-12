"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CheckCircle, UserRound } from "lucide-react";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const isVisitor = searchParams.get("visitor") === "true";

  return (
    <div>
      <PageHeader title="Regisztráció" icon={UserRound} />
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center border border-gray-200 rounded-[15px] shadow-sm p-10">
          <CheckCircle className="h-14 w-14 text-[#84AAA6] mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Köszönjük a regisztrációt!
          </h1>
          <p className="text-gray-900 mb-4 text-lg leading-relaxed">
            Elküldtük a megerősítő levelet a regisztráció során megadott e-mail-címre. Kérjük, nyisd meg, és kattints a levélben található linkre a fiókod aktiválásához.
          </p>
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm mb-4 text-center">
            Ha nem találod a levelet a beérkező üzenetek között, <strong>ellenőrizd a SPAM / Levélszemét mappát</strong> is.
          </p>
          {isVisitor ? (
            <p className="text-gray-500 mb-8 text-base leading-relaxed">
              Az e-mail-cím igazolása után bejelentkezhetsz, és elkezdheted böngészni a szolgáltatókat, kedvenceket menteni, és ajánlatkéréseket küldeni egyszerre több szakembernek.
            </p>
          ) : (
            <p className="text-gray-500 mb-8 text-base leading-relaxed">
              Az e-mail-cím igazolása után szolgáltatói profilod adminisztrátori jóváhagyásra kerül, és jóváhagyást követően jelenik meg a nyilvános oldalon.
            </p>
          )}
          <Link href={isVisitor ? "/auth/login" : "/"}>
            <Button>{isVisitor ? "Bejelentkezés" : "Vissza a főoldalra"}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense>
      <RegisterSuccessContent />
    </Suspense>
  );
}
