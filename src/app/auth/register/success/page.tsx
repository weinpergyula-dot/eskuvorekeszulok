import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <span className="text-6xl mb-6 block">🎉</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Sikeres regisztráció!
        </h1>
        <p className="text-gray-500 mb-2">
          Köszönjük a regisztrációt! Ellenőrizd az email postaládádat és
          erősítsd meg a fiókod.
        </p>
        <p className="text-gray-500 mb-8 text-sm">
          Szolgáltatói profilod az adminisztrátori jóváhagyás után jelenik meg a
          nyilvános oldalon.
        </p>
        <Link href="/">
          <Button>Vissza a főoldalra</Button>
        </Link>
      </div>
    </div>
  );
}
