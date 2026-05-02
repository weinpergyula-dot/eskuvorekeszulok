import { PageHeader } from "@/components/layout/page-header";
import { Info } from "lucide-react";

export const metadata = {
  title: "Információk – Esküvőre Készülök",
};

export default function InformaciokPage() {
  return (
    <div>
      <PageHeader icon={Info} title="Információk" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-900 text-lg">Ez az oldal hamarosan elkészül.</p>
      </div>
    </div>
  );
}
