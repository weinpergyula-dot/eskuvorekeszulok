// Source: docs/legal/cookie-szabalyzat.md

import { LegalPageLayout, LegalSection, LegalSubSection, LegalP, LegalUl, LegalTable } from "@/components/layout/legal-page-layout";
import Link from "next/link";

export const metadata = { title: "Cookie szabályzat – Esküvőre Készülök" };

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie szabályzat" lastUpdated="2026. május 5.">

      <LegalSection title="1. Mi a cookie (süti)?">
        <LegalP>A cookie (magyarul: „süti") egy kis adatcsomag, amelyet a weboldal a böngésződ tárhelyén helyez el, amikor meglátogatod az oldalt. A cookie-k segítségével a weboldal felismeri a böngésződet, megjegyzi a beállításaidat és biztosítja a működéshez szükséges funkciókat.</LegalP>
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
          <LegalP>A Weboldal <strong>jelenleg NEM használ analitikai cookie-kat</strong> (pl. Google Analytics).</LegalP>
          <LegalP>A jövőben tervezzük az analitikai szolgáltatás bevezetését. Ekkor cookie banner jelenik meg, és az analitikai cookie-k <strong>csak a kifejezett, opt-in hozzájárulás után</strong> indulnak el.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="2.3 Marketing / hirdetési cookie-k">
          <LegalP>A Weboldal <strong>NEM használ marketing vagy hirdetési cookie-kat</strong>.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="3. Milyen adatokat gyűjtenek a cookie-k?">
        <LegalP>A jelenleg használt feltétlenül szükséges cookie-k kizárólag a bejelentkezési munkamenet azonosítóját tárolják.</LegalP>
        <LegalP>Ezek a cookie-k <strong>NEM tárolnak</strong> személyes adatokat nyers szöveges formában, jelszót, böngészési előzményeket vagy személyiségprofil adatokat.</LegalP>
      </LegalSection>

      <LegalSection title="4. Hogyan tudod kezelni a cookie-kat?">
        <LegalSubSection title="4.1 Böngésző beállítások">
          <LegalUl>
            <li><strong>Chrome:</strong> Beállítások → Adatvédelem és biztonság → Cookie-k</li>
            <li><strong>Firefox:</strong> Beállítások → Adatvédelem és biztonság</li>
            <li><strong>Safari:</strong> Beállítások → Adatvédelem</li>
            <li><strong>Edge:</strong> Beállítások → Cookie-k és webhelyengedélyek</li>
          </LegalUl>
        </LegalSubSection>

        <LegalSubSection title="4.2 Letiltás következményei">
          <LegalP>Amennyiben a böngésződben letiltod a cookie-kat, a Weboldal nem fog megfelelően működni: nem tudsz bejelentkezni, munkameneted minden oldalváltáskor megszűnik, és egyes funkciók elérhetetlenek lesznek.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="5. Harmadik fél cookie-k">
        <LegalP>A Weboldal jelenleg <strong>nem ágyaz be</strong> olyan harmadik fél tartalmakat (pl. YouTube videó, Facebook beágyazás, Google térkép), amelyek saját cookie-kat helyeznének el. Amennyiben ez változik, a jelen tájékoztatót frissítjük.</LegalP>
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
