export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Kapcsolat</h1>
      <div className="w-12 h-0.5 bg-[#2a9d8f] mb-8" />
      <p className="text-gray-900 mb-6">
        Ha kérdésed van az oldallal kapcsolatban, vagy szeretnél szolgáltatóként
        regisztrálni, keresd fel az alábbi elérhetőségeken:
      </p>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
        <p className="text-sm text-gray-900">
          <span className="font-medium">Email:</span>{" "}
          <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#2a9d8f] hover:underline">
            info@eskuvorekeszulok.hu
          </a>
        </p>
        <p className="text-sm text-gray-900">
          <span className="font-medium">Weboldal:</span>{" "}
          <span className="text-gray-900">www.eskuvorekeszulok.hu</span>
        </p>
      </div>
    </div>
  );
}
