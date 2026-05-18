const TEXT =
  "Az oldal fejlesztési fázisban jár – a szolgáltatók regisztrációja zajlik, ami hosszabb időt vehet igénybe.";

const SEPARATOR = "   ·   ";

export function AnnouncementBanner() {
  const repeated = Array.from({ length: 6 }, () => TEXT).join(SEPARATOR);
  const full = repeated + SEPARATOR;

  return (
    <div className="w-full overflow-hidden bg-[#FEF9C3] border-b border-yellow-200 py-1.5">
      <div className="flex whitespace-nowrap marquee-track">
        {/* Duplicate for seamless loop */}
        <span className="text-sm text-gray-900 shrink-0 pr-8">{full}</span>
        <span className="text-sm text-gray-900 shrink-0 pr-8" aria-hidden="true">{full}</span>
      </div>
    </div>
  );
}
