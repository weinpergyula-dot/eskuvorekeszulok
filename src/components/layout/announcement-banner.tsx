const TEXT =
  "Az oldal fejlesztési fázisban van – a szolgáltatók regisztrációja aktívan zajlik, ezért egyes kategóriákban még kevés ajánlatot találsz. Hamarosan teljes kínálattal várunk!";

export function AnnouncementBanner() {
  return (
    <div className="w-full bg-[#FEF9C3] border-b border-yellow-200 py-2 px-4">
      <p className="text-sm text-gray-900 text-center flex items-start justify-center gap-1.5">
        <span className="shrink-0 font-black text-black leading-snug">!</span>
        <span>{TEXT}</span>
      </p>
    </div>
  );
}
