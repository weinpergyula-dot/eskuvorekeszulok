const TEXT =
  "Az oldal fejlesztési fázisban van – a szolgáltatók regisztrációja aktívan zajlik, ezért egyes kategóriákban még kevés ajánlatot találsz. Hamarosan teljes kínálattal várunk! Kövesd az oldalt és nézz vissza hamarosan.";

const SEP = "   ·   ";

const BLOCK = Array.from({ length: 4 }, () => TEXT).join(SEP) + SEP;

const ANIMATION = "marquee-scroll 40s linear infinite";

export function AnnouncementBanner() {
  return (
    <div className="w-full overflow-hidden bg-[#FEF9C3] border-b border-yellow-200 py-1.5">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: ANIMATION, willChange: "transform" }}
      >
        <span className="text-sm text-gray-900 shrink-0" style={{ minWidth: "max-content" }}>{BLOCK}</span>
        <span className="text-sm text-gray-900 shrink-0" style={{ minWidth: "max-content" }} aria-hidden="true">{BLOCK}</span>
      </div>
    </div>
  );
}
