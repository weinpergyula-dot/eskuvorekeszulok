// Source: docs/legal/cookie-szabalyzat.md

import { LegalPageLayout, LegalSection, LegalSubSection, LegalP, LegalUl, LegalTable } from "@/components/layout/legal-page-layout";
import Link from "next/link";

export const metadata = { title: "Cookie szabályzat – Esküvőre Készülök" };

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie szabályzat" lastUpdated="2026. május 19.">

      <LegalSection title="1. Mi a cookie (süti)?">
        <LegalP>A cookie (magyarul: „süti&rdquo;) egy kis adatcsomag, amelyet a weboldal a böngésződ tárhelyén helyez el, amikor meglátogatod az oldalt. A cookie-k segítségével a weboldal felismeri a böngésződet, megjegyzi a beállításaidat és biztosítja a működéshez szükséges funkciókat.</LegalP>
      </LegalSection>

      <LegalSection title="2. A jelen Weboldalon használt cookie-k">
        <LegalSubSection title="2.1 Feltétlenül szükséges (essential) cookie-k">
          <LegalP>Ezek a cookie-k a Weboldal alapvető működéséhez <strong>elengedhetetlenek</strong> és <strong>nem igényelnek külön hozzájárulást</strong> az Európai Unió ePrivacy irányelve alapján.</LegalP>
          <LegalTable
            headers={["Cookie", "Szolgáltató", "Cél", "Megőrzési idő"]}
            rows={[
              ["sb-access-token", "Supabase", "Bejelentkezési munkamenet kezelése", "Munkamenet vagy 1 hét"],
              ["sb-refresh-token", "Supabase", "Bejelentkezés meghosszabbítása", "1 hét"],
            ]}
          />
          <LegalP><strong>Jogalap:</strong> GDPR 6. cikk (1) f) – jogos érdek (a Weboldal működtetése).</LegalP>
        </LegalSubSection>

        <LegalSubSection title="2.2 Analitikai cookie-k">
          <LegalP>A Weboldal a <strong>Google Analytics 4</strong> (Google LLC) szolgáltatást használja névtelen forgalmi adatok gyűjtésére – <strong>kizárólag a látogató előzetes, kifejezett hozzájárulása esetén</strong> (opt-in). Hozzájárulás hiányában egyetlen analitikai cookie sem kerül elhelyezésre.</LegalP>
          <LegalTable
            headers={["Cookie", "Szolgáltató", "Cél", "Megőrzési idő"]}
            rows={[
              ["_ga", "Google LLC", "Egyedi látogatói azonosító (anonimizált)", "2 év"],
              ["_ga_F3ZQFXKGET", "Google LLC", "Munkamenet-állapot tárolása", "2 év"],
            ]}
          />
          <LegalP>A Google Analytics kizárólag <strong>anonimizált adatokat</strong> gyűjt: oldalmegtekintések, munkamenet hossza, forgalmi forrás. Az IP-cím anonimizálva van, személyes azonosítás nem lehetséges.</LegalP>
          <LegalP><strong>Jogalap:</strong> GDPR 6. cikk (1) a) – érintett hozzájárulása.</LegalP>
          <LegalP>
            A Google adatkezelési elveiről bővebben:{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline hover:text-[#6B8E8A]">
              https://policies.google.com/privacy
            </a>
          </LegalP>
        </LegalSubSection>

        <LegalSubSection title="2.3 Marketing / hirdetési cookie-k">
          <LegalP>A Weboldal <strong>NEM használ marketing vagy hirdetési cookie-kat</strong>.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="3. Milyen adatokat gyűjtenek a cookie-k?">
        <LegalP>A feltétlenül szükséges cookie-k kizárólag a bejelentkezési munkamenet azonosítóját tárolják.</LegalP>
        <LegalP>Az analitikai cookie-k (kizárólag hozzájárulás esetén) anonimizált látogatási adatokat rögzítenek: megtekintett oldalak, munkamenet időtartama, forgalom forrása. Személyes adatot nyers szöveges formában egyik cookie sem tárol.</LegalP>
      </LegalSection>

      <LegalSection title="4. Hogyan tudod kezelni a cookie-kat?">
        <LegalSubSection title="4.1 Cookie-hozzájárulás módosítása">
          <LegalP>Az analitikai cookie-khoz adott hozzájárulásod bármikor visszavonhatod: töröld a böngésző <strong>helyi tárhelyéből</strong> (localStorage) a <code>cookieConsent</code> kulcsot, majd frissítsd az oldalt – a cookie banner újra megjelenik.</LegalP>
          <LegalP>Google Analytics opt-out böngésző bővítménnyel is elérhető: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline hover:text-[#6B8E8A]">tools.google.com/dlpage/gaoptout</a></LegalP>
        </LegalSubSection>

        <LegalSubSection title="4.2 Böngésző beállítások">
          <LegalUl>
            <li><strong>Chrome:</strong> Beállítások → Adatvédelem és biztonság → Cookie-k</li>
            <li><strong>Firefox:</strong> Beállítások → Adatvédelem és biztonság</li>
            <li><strong>Safari:</strong> Beállítások → Adatvédelem</li>
            <li><strong>Edge:</strong> Beállítások → Cookie-k és webhelyengedélyek</li>
          </LegalUl>
        </LegalSubSection>

        <LegalSubSection title="4.3 Letiltás következményei">
          <LegalP>Amennyiben a böngésződben letiltod az összes cookie-t, a Weboldal nem fog megfelelően működni: nem tudsz bejelentkezni, munkameneted minden oldalváltáskor megszűnik, és egyes funkciók elérhetetlenek lesznek.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="5. Harmadik fél cookie-k">
        <LegalP>A Weboldal hozzájárulás esetén a <strong>Google Analytics 4</strong> (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) szolgáltatást veszi igénybe anonimizált forgalomelemzéshez. A Google adatkezelési elvei elérhetők: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline hover:text-[#6B8E8A]">policies.google.com/privacy</a>.</LegalP>
        <LegalP>Egyéb harmadik fél tartalmak (YouTube, Facebook, Google Maps) jelenleg <strong>nem kerülnek beágyazásra</strong>. Amennyiben ez változik, a jelen tájékoztatót frissítjük.</LegalP>
      </LegalSection>

      <LegalSection title="6. A jelen tájékoztató módosítása">
        <LegalP>Az Üzemeltető fenntartja a jogot, hogy a jelen Cookie szabályzatot egyoldalúan módosítsa, különösen új cookie-k bevezetésekor vagy jogszabályváltozás esetén.</LegalP>
        <LegalP>Ha kérdésed van, írj az <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] underline">info@eskuvorekeszulok.hu</a> címre.</LegalP>
        <LegalP>
          További információk:{" "}
          <Link href="/privacy" className="text-[#84AAA6] underline">Adatvédelmi tájékoztató</Link>
          {" · "}
          <Link href="/terms" className="text-[#84AAA6] underline">Általános Szerződési Feltételek</Link>
        </LegalP>
      </LegalSection>

    </LegalPageLayout>
  );
}
