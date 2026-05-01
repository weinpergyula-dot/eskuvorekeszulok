import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CheckCircle } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <div>
      <PageHeader title="Regisztráció" />
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center border border-gray-200 rounded-[15px] shadow-sm p-10">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sikeres regisztráció!
          </h1>
          <p className="text-gray-900 mb-8 text-lg">
            Szolgáltatói profilod az adminisztrátori jóváhagyás után jelenik meg a
            nyilvános oldalon.
          </p>
          <Link href="/">
            <Button>Vissza a főoldalra</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
