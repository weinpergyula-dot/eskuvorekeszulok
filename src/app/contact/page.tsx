import { PageHeader } from "@/components/layout/page-header";

export default function ContactPage() {
  return (
    <div>
      <PageHeader title="Kapcsolat" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-900 mb-6">
          Ha kérdésed van az oldallal kapcsolatban, vagy szeretnél szolgáltatóként
          regisztrálni, keresd fel az alábbi elérhetőségeken:
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <p className="text-lg text-gray-900">
            <span className="font-medium">Email:</span>{" "}
            <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] hover:underline">
              info@eskuvorekeszulok.hu
            </a>
          </p>
          <p className="text-lg text-gray-900">
            <span className="font-medium">Weboldal:</span>{" "}
            <span className="text-gray-900">www.eskuvorekeszulok.hu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
