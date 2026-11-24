import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CheckCircle, UserRound } from "lucide-react";

export default function VerifiedPage() {
  return (
    <div>
      <PageHeader title="E-mail megerősítve" icon={UserRound} />
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center border border-gray-200 rounded-[15px] shadow-sm p-10">
          <CheckCircle className="h-14 w-14 text-[#84AAA6] mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            E-mail-cím sikeresen megerősítve!
          </h1>
          <p className="text-gray-900 mb-4 text-lg leading-relaxed">
            Fiókod aktiválva lett, jelentkezz be az oldalra.
          </p>
          <p className="text-gray-500 mb-8 text-base leading-relaxed">
            Ha szolgáltatóként regisztráltál, profilod adminisztrátori jóváhagyásra kerül – erről e-mailben értesítünk.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Bejelentkezés</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
