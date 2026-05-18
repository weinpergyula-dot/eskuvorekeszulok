const TEXT =
  "Az oldal fejlesztési fázisban van – a szolgáltatók regisztrációja aktívan zajlik, ezért egyes kategóriákban még kevés ajánlatot találsz. Hamarosan teljes kínálattal várunk! Kövesd az oldalt és nézz vissza hamarosan.";

const SEP = "   ·   ";

const BLOCK = Array.from({ length: 4 }, () => TEXT).join(SEP) + SEP;

export function AnnouncementBanner() {
  return (
    <div className="w-full overflow-hidden bg-[#FEF9C3] border-b border-yellow-200 py-1.5">
      <div
        className="flex whitespace-nowrap marquee-track"
        style={{ width: "max-content" }}
      >
        <span className="text-sm text-gray-900 shrink-0">{BLOCK}</span>
        <span className="text-sm text-gray-900 shrink-0" aria-hidden="true">{BLOCK}</span>
      </div>
    </div>
  );
}
