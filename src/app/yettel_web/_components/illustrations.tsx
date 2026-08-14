// Beépített SVG illusztrációk (nincs külső kép-függőség).
// Yettel lime (#B4FF00) + navy (#002340) színvilág.

/** Nagy telefon-illusztráció a készülék-kártyákhoz. */
export function PhoneArt({
  screen = "#B4FF00",
  className = "",
}: {
  screen?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label="Telefon">
      <ellipse cx="100" cy="285" rx="70" ry="10" fill="#002340" opacity="0.08" />
      {/* váz */}
      <rect x="46" y="12" width="108" height="276" rx="26" fill="#002340" />
      <rect x="46" y="12" width="108" height="276" rx="26" fill="none" stroke="#001D36" strokeWidth="2" />
      {/* képernyő */}
      <rect x="54" y="24" width="92" height="252" rx="18" fill="#FFFFFF" />
      {/* fülke */}
      <rect x="86" y="30" width="28" height="6" rx="3" fill="#002340" />
      {/* fejléc sáv */}
      <rect x="62" y="46" width="76" height="30" rx="10" fill={screen} />
      <circle cx="76" cy="61" r="7" fill="#002340" />
      <rect x="90" y="55" width="40" height="5" rx="2.5" fill="#002340" opacity="0.85" />
      <rect x="90" y="64" width="26" height="4" rx="2" fill="#002340" opacity="0.5" />
      {/* tartalom kártyák */}
      <rect x="62" y="88" width="76" height="34" rx="10" fill="#E4F2F7" />
      <rect x="70" y="96" width="34" height="5" rx="2.5" fill="#002340" opacity="0.7" />
      <rect x="70" y="106" width="52" height="6" rx="3" fill="#002340" />
      <rect x="62" y="130" width="36" height="46" rx="10" fill="#E4F2F7" />
      <rect x="102" y="130" width="36" height="46" rx="10" fill="#E4F2F7" />
      <circle cx="80" cy="146" r="8" fill={screen} />
      <circle cx="120" cy="146" r="8" fill={screen} />
      <rect x="70" y="160" width="20" height="4" rx="2" fill="#002340" opacity="0.6" />
      <rect x="110" y="160" width="20" height="4" rx="2" fill="#002340" opacity="0.6" />
      {/* CTA gomb */}
      <rect x="62" y="186" width="76" height="26" rx="13" fill="#002340" />
      <rect x="82" y="196" width="36" height="6" rx="3" fill={screen} />
      {/* alsó navigáció */}
      <rect x="62" y="224" width="76" height="4" rx="2" fill="#CDE0EA" />
      <circle cx="78" cy="244" r="4" fill={screen} />
      <circle cx="100" cy="244" r="4" fill="#BBD3E4" />
      <circle cx="122" cy="244" r="4" fill="#BBD3E4" />
    </svg>
  );
}

/** Hero illusztráció: app-telefon + lebegő szolgáltatás-csempék + jelerősség. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 380" className={className} role="img" aria-label="Yettel app és szolgáltatások">
      {/* háttér kör */}
      <circle cx="250" cy="190" r="165" fill="#FFFFFF" opacity="0.35" />
      {/* jel-ívek */}
      <g fill="none" stroke="#002340" strokeWidth="4" strokeLinecap="round" opacity="0.45">
        <path d="M356 96 a34 34 0 0 1 34 34" />
        <path d="M356 78 a52 52 0 0 1 52 52" />
        <path d="M356 60 a70 70 0 0 1 70 70" />
      </g>

      {/* telefon */}
      <g>
        <rect x="168" y="60" width="150" height="288" rx="30" fill="#002340" />
        <rect x="176" y="72" width="134" height="264" rx="22" fill="#FFFFFF" />
        <rect x="222" y="80" width="42" height="8" rx="4" fill="#002340" />
        {/* app fejléc */}
        <rect x="186" y="98" width="114" height="52" rx="14" fill="#B4FF00" />
        <rect x="196" y="110" width="52" height="7" rx="3.5" fill="#002340" />
        <rect x="196" y="123" width="74" height="10" rx="5" fill="#002340" />
        {/* egyenleg / adat kör */}
        <rect x="186" y="160" width="114" height="60" rx="14" fill="#E4F2F7" />
        <circle cx="214" cy="190" r="20" fill="none" stroke="#B4FF00" strokeWidth="7" />
        <circle cx="214" cy="190" r="20" fill="none" stroke="#002340" strokeWidth="7" strokeDasharray="70 200" strokeLinecap="round" transform="rotate(-90 214 190)" />
        <rect x="246" y="178" width="42" height="7" rx="3.5" fill="#002340" opacity="0.65" />
        <rect x="246" y="192" width="30" height="8" rx="4" fill="#002340" />
        {/* lista sorok */}
        <rect x="186" y="230" width="114" height="30" rx="10" fill="#E4F2F7" />
        <circle cx="202" cy="245" r="8" fill="#B4FF00" />
        <rect x="216" y="242" width="66" height="6" rx="3" fill="#002340" opacity="0.55" />
        <rect x="186" y="268" width="114" height="30" rx="10" fill="#E4F2F7" />
        <circle cx="202" cy="283" r="8" fill="#B4FF00" />
        <rect x="216" y="280" width="54" height="6" rx="3" fill="#002340" opacity="0.55" />
      </g>

      {/* lebegő csempék */}
      <g>
        <rect x="60" y="120" width="104" height="46" rx="14" fill="#FFFFFF" />
        <rect x="72" y="132" width="22" height="22" rx="7" fill="#B4FF00" />
        <rect x="102" y="135" width="50" height="6" rx="3" fill="#002340" />
        <rect x="102" y="146" width="34" height="5" rx="2.5" fill="#002340" opacity="0.5" />

        <rect x="44" y="196" width="118" height="46" rx="14" fill="#FFFFFF" />
        <rect x="56" y="208" width="22" height="22" rx="7" fill="#002340" />
        <rect x="86" y="211" width="60" height="6" rx="3" fill="#002340" />
        <rect x="86" y="222" width="40" height="5" rx="2.5" fill="#002340" opacity="0.5" />

        <rect x="300" y="250" width="112" height="46" rx="14" fill="#FFFFFF" />
        <rect x="312" y="262" width="22" height="22" rx="7" fill="#B4FF00" />
        <rect x="342" y="265" width="56" height="6" rx="3" fill="#002340" />
        <rect x="342" y="276" width="36" height="5" rx="2.5" fill="#002340" opacity="0.5" />
      </g>
    </svg>
  );
}
