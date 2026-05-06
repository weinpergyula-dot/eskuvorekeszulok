// Source: docs/legal/adatvedelmi-tajekoztato.md

import { LegalPageLayout, LegalSection, LegalSubSection, LegalP, LegalUl, LegalTable, LegalNote } from "@/components/layout/legal-page-layout";
import Link from "next/link";

export const metadata = { title: "Adatvédelmi tájékoztató – Esküvőre Készülök" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Adatvédelmi tájékoztató" lastUpdated="2026. május 5.">

      <LegalSection title="1. Bevezetés">
        <LegalP>
          Üdvözlünk az <strong>Esküvőre Készülök</strong> weboldalon (a továbbiakban: „Weboldal", „Szolgáltatás"), amely a{" "}
          <a href="https://eskuvorekeszulok.hu" className="text-[#84AAA6] underline">https://eskuvorekeszulok.hu</a> címen érhető el.
        </LegalP>
        <LegalP>
          Az adatvédelem és személyes adataid biztonsága fontos számunkra. Ez a tájékoztató részletesen ismerteti, hogyan kezeljük a Weboldal használata során a tudomásunkra jutó személyes adatokat, az Európai Unió Általános Adatvédelmi Rendelete (GDPR – 2016/679/EU rendelet) és a magyar Infotörvény (2011. évi CXII. törvény) rendelkezéseinek megfelelően.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Az adatkezelő adatai">
        <LegalTable
          headers={["Adat", "Érték"]}
          rows={[
            ["Adatkezelő neve", "[ÜZEMELTETŐ NEVE]"],
            ["Levelezési cím", "[ÜZEMELTETŐ LEVELEZÉSI CÍME]"],
            ["Email", "info@eskuvorekeszulok.hu"],
            ["Weboldal", "https://eskuvorekeszulok.hu"],
          ]}
        />
        <LegalNote>
          Jelenleg a Weboldal magánszemélyként üzemeltetett, <strong>non-profit, ingyenes</strong> szolgáltatás. Gazdasági tevékenységet nem folytat. Amennyiben ez változik, ezt a tájékoztatót frissítjük.
        </LegalNote>
      </LegalSection>

      <LegalSection title="3. Milyen adatokat gyűjtünk és miért?">
        <LegalSubSection title="3.1 Regisztráció és felhasználói fiók">
          <LegalP>Két típusú felhasználó regisztrálhat a Weboldalra:</LegalP>
          <LegalP><strong>Látogatók (esküvőre készülők):</strong></LegalP>
          <LegalUl>
            <li>Email cím</li>
            <li>Jelszó (titkosítva tárolva)</li>
            <li>Megjelenítendő név</li>
            <li>Profilkép (opcionális)</li>
          </LegalUl>
          <LegalP><strong>Szolgáltatók (esküvős szolgáltatást nyújtók):</strong></LegalP>
          <LegalUl>
            <li>Email cím</li>
            <li>Jelszó (titkosítva)</li>
            <li>Cégnév vagy egyéni vállalkozó neve / kapcsolattartó neve</li>
            <li>Telefonszám (opcionális)</li>
            <li>Szolgáltatás kategóriája és leírása</li>
            <li>Helyszín / működési terület</li>
            <li>Feltöltött bemutatkozó képek</li>
          </LegalUl>
          <LegalP>A regisztráció kizárólag <strong>érvényes email cím megerősítését követően</strong> válik aktívvá.</LegalP>
          <LegalP><strong>Az adatkezelés célja:</strong> felhasználói fiók létrehozása, a Szolgáltatás működtetése, a felhasználók közötti kapcsolattartás biztosítása.</LegalP>
          <LegalP><strong>Jogalap:</strong> GDPR 6. cikk (1) bekezdés b) pont – szerződés teljesítése (Általános Szerződési Feltételek).</LegalP>
          <LegalP><strong>Megőrzési idő:</strong> a fiók törléséig, illetve legfeljebb 30 napig a törlést követően (technikai backup-okban).</LegalP>
        </LegalSubSection>

        <LegalSubSection title="3.2 Értékelések, vélemények">
          <LegalP>A regisztrált, megerősített email című Látogatók értékelhetik a Szolgáltatókat. Az értékelés tartalmazza:</LegalP>
          <LegalUl>
            <li>Pontszám</li>
            <li>Szöveges vélemény (opcionális)</li>
            <li>Az értékelő felhasználói neve</li>
            <li>Az értékelés időpontja</li>
          </LegalUl>
          <LegalP>Az értékelt Szolgáltató <strong>nem tud</strong> válaszolni az értékelésre a Weboldalon belül. Az értékelés a Weboldal többi látogatója számára nyilvános.</LegalP>
          <LegalP>Az adminisztrátor jogosult törölni azokat az értékeléseket, amelyek sértőek, jogellenesek, vagy egyéb módon visszaélésnek minősülnek.</LegalP>
          <LegalP><strong>Jogalap:</strong> szerződés teljesítése. <strong>Megőrzési idő:</strong> a fiók törléséig.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="3.3 Üzenetküldés">
          <LegalP>A Weboldalon belül a regisztrált felhasználók (Látogatók és Szolgáltatók) üzenhetnek egymásnak.</LegalP>
          <LegalP><strong>Az üzenetekhez elsődlegesen kizárólag a beszélgetésben résztvevő két fél fér hozzá.</strong></LegalP>
          <LegalP>Az üzemeltető (adminisztrátor) tájékoztatja a Felhasználókat, hogy technikailag az üzenetekhez hozzáférhet az adatbázison keresztül. Az adminisztrátor <strong>nem olvassa rendszeresen</strong> az üzeneteket, és kizárólag a következő esetekben tekint beléjük:</LegalP>
          <LegalUl>
            <li>Visszaélés bejelentése esetén (pl. zaklatás, fenyegetés, csalás)</li>
            <li>Jogszabályi kötelezettség alapján (pl. hatósági megkeresés)</li>
            <li>A Weboldal biztonságát fenyegető incidens kivizsgálásakor</li>
          </LegalUl>
          <LegalP><strong>Jogalap:</strong> szerződés teljesítése (üzenetküldés funkció), és jogos érdek (visszaélés-megelőzés). <strong>Megőrzési idő:</strong> a fiók törléséig.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="3.4 Email kommunikáció">
          <LegalP>A regisztrációhoz, jelszó visszaállításhoz, email cím megerősítéshez és értesítésekhez emaileket küldünk a felhasználói email címre. Ehhez a <a href="https://resend.com" className="text-[#84AAA6] underline">Resend</a> szolgáltatást használjuk.</LegalP>
          <LegalP><strong>Jogalap:</strong> szerződés teljesítése.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="3.5 Technikai adatok és cookie-k">
          <LegalP>A Weboldal használatakor automatikusan rögzítjük:</LegalP>
          <LegalUl>
            <li>IP cím</li>
            <li>Böngésző típusa és verziója</li>
            <li>Operációs rendszer</li>
            <li>Látogatás időpontja</li>
            <li>Megnyitott oldalak</li>
          </LegalUl>
          <LegalP>A Weboldal jelenleg <strong>csak a működéshez feltétlenül szükséges (essential) cookie-kat</strong> használja. A részleteket a{" "}
            <Link href="/cookies" className="text-[#84AAA6] underline">Cookie szabályzat</Link> tartalmazza.
          </LegalP>
          <LegalP><strong>Jogalap:</strong> GDPR 6. cikk (1) f) pont – jogos érdek. <strong>Megőrzési idő:</strong> legfeljebb 12 hónap.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="4. Adatfeldolgozók">
        <LegalTable
          headers={["Adatfeldolgozó", "Mire használjuk", "Adattovábbítás helye"]}
          rows={[
            ["Supabase", "adatbázis, autentikáció, fájltárolás", "Európai Unió"],
            ["Resend", "email kézbesítés", "Európai Unió, USA"],
            ["Vercel", "hosting (weboldal kiszolgálása)", "Európai Unió, USA"],
            ["GitHub", "forráskód-tárolás", "USA"],
          ]}
        />
        <LegalP>A felsorolt szolgáltatók a vonatkozó GDPR-megfelelőségi keretrendszerek (Standard Contractual Clauses, EU-US Data Privacy Framework) szerint működnek.</LegalP>
      </LegalSection>

      <LegalSection title="5. Adatbiztonság">
        <LegalUl>
          <li><strong>Jelszavak titkosítása:</strong> a jelszavakat kizárólag titkosított (hash-elt) formában tároljuk.</li>
          <li><strong>HTTPS titkosítás:</strong> minden adatforgalom titkosított csatornán zajlik.</li>
          <li><strong>Hozzáférés-korlátozás:</strong> a Supabase Row Level Security (RLS) biztosítja, hogy minden Felhasználó csak a saját adataihoz férjen hozzá.</li>
          <li><strong>Rendszeres biztonsági mentések:</strong> az adatbázis biztonsági mentései rendszeresen készülnek.</li>
          <li><strong>Email cím megerősítés:</strong> a regisztráció csak megerősített email címmel válik teljes értékűvé.</li>
        </LegalUl>
        <LegalP>Adatvédelmi incidens esetén 72 órán belül értesítjük a NAIH-ot, és szükség esetén az érintett Felhasználókat is.</LegalP>
      </LegalSection>

      <LegalSection title="6. Korhatár">
        <LegalP>A Weboldalra <strong>kizárólag a 16. életévüket betöltött, cselekvőképes természetes személyek</strong> regisztrálhatnak, összhangban a GDPR előírásaival.</LegalP>
      </LegalSection>

      <LegalSection title="7. Jogaid">
        <LegalUl>
          <li><strong>Hozzáférési jog:</strong> tájékoztatást kérhetsz arról, hogy milyen adatokat kezelünk rólad.</li>
          <li><strong>Helyesbítéshez való jog:</strong> kérheted a pontatlan adatok javítását.</li>
          <li><strong>Törléshez való jog („elfeledtetéshez való jog"):</strong> kérheted az adataid törlését.</li>
          <li><strong>Adatkezelés korlátozásához való jog.</strong></li>
          <li><strong>Adathordozhatósághoz való jog:</strong> kérheted az adataid másik szolgáltatóhoz való átvitelét.</li>
          <li><strong>Tiltakozási jog:</strong> tiltakozhatsz az adataid kezelése ellen.</li>
        </LegalUl>
        <LegalP><strong>Saját kezűleg a Weboldalon:</strong> a profil beállításaidban a „Fiók törlése" gombbal teljes adattörlést kezdeményezhetsz.</LegalP>
        <LegalP><strong>Email útján:</strong> küldd el a kérésedet az{" "}
          <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] underline">info@eskuvorekeszulok.hu</a> címre.
          A GDPR előírásainak megfelelően 30 napon belül válaszolunk.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Panasz benyújtása">
        <LegalP><strong>Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</strong></LegalP>
        <LegalUl>
          <li>Cím: 1055 Budapest, Falk Miksa utca 9-11.</li>
          <li>Telefon: +36 (1) 391-1400</li>
          <li>Email: ugyfelszolgalat@naih.hu</li>
          <li>Weboldal: <a href="https://www.naih.hu" className="text-[#84AAA6] underline">naih.hu</a></li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="9. A tájékoztató módosítása">
        <LegalP>Fenntartjuk a jogot, hogy a jelen tájékoztatót egyoldalúan módosítsuk jogszabályváltozás, új funkciók bevezetése vagy új adatfeldolgozók igénybevétele esetén. A módosításról a Weboldalon és/vagy email értesítésben tájékoztatjuk a Felhasználókat.</LegalP>
        <LegalP>Ha bármilyen kérdésed van, írj az{" "}
          <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] underline">info@eskuvorekeszulok.hu</a> címre.
        </LegalP>
      </LegalSection>

    </LegalPageLayout>
  );
}
