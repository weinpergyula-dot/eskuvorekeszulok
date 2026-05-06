// Source: docs/legal/aszf.md

import { LegalPageLayout, LegalSection, LegalSubSection, LegalP, LegalUl, LegalTable, LegalNote } from "@/components/layout/legal-page-layout";
import Link from "next/link";

export const metadata = { title: "Általános Szerződési Feltételek – Esküvőre Készülök" };

export default function TermsPage() {
  return (
    <LegalPageLayout title="Általános Szerződési Feltételek (ÁSZF)" lastUpdated="2026. május 5.">

      <LegalSection title="1. Bevezető rendelkezések">
        <LegalSubSection title="1.1 A jelen ÁSZF tárgya">
          <LegalP>A jelen Általános Szerződési Feltételek (a továbbiakban: „ÁSZF") a{" "}
            <a href="https://eskuvorekeszulok.hu" className="text-[#84AAA6] underline">https://eskuvorekeszulok.hu</a>{" "}
            weboldalon elérhető szolgáltatás igénybevételének feltételeit szabályozza.
          </LegalP>
        </LegalSubSection>

        <LegalSubSection title="1.2 A szolgáltató adatai">
          <LegalTable
            headers={["Adat", "Érték"]}
            rows={[
              ["Üzemeltető neve", "[ÜZEMELTETŐ NEVE]"],
              ["Levelezési cím", "[ÜZEMELTETŐ LEVELEZÉSI CÍME]"],
              ["Email", "info@eskuvorekeszulok.hu"],
              ["Weboldal", "https://eskuvorekeszulok.hu"],
            ]}
          />
          <LegalNote>Az Üzemeltető jelenleg magánszemélyként, <strong>nem üzletszerű, ingyenes szolgáltatás</strong> keretében üzemelteti a Weboldalt. Gazdasági tevékenységet jelenleg nem végez.</LegalNote>
        </LegalSubSection>

        <LegalSubSection title="1.3 A Szolgáltatás célja">
          <LegalP>A Weboldal egy online platform, amely lehetővé teszi:</LegalP>
          <LegalUl>
            <li><strong>Esküvőre készülő párok és egyének (Látogatók)</strong> számára, hogy esküvős szolgáltatókat keressenek, megismerjenek, értékeljenek, és velük kapcsolatba lépjenek.</li>
            <li><strong>Esküvős szolgáltatók (Hirdetők)</strong> számára, hogy bemutassák szolgáltatásaikat a célközönségnek.</li>
          </LegalUl>
        </LegalSubSection>

        <LegalSubSection title="1.4 Az ÁSZF elfogadása">
          <LegalP>A Weboldalon történő regisztrációval a Felhasználó kifejezetten kijelenti, hogy a jelen ÁSZF tartalmát megismerte, megértette és magára nézve kötelezőnek elfogadja, valamint elfogadja az{" "}
            <Link href="/privacy" className="text-[#84AAA6] underline">Adatvédelmi tájékoztatót</Link> is.
          </LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="2. Fogalmak">
        <LegalUl>
          <li><strong>Üzemeltető:</strong> a Weboldal működtetője (1.2 pontban megjelölt személy)</li>
          <li><strong>Felhasználó:</strong> a Weboldalon regisztráló bármely természetes vagy jogi személy</li>
          <li><strong>Látogató:</strong> olyan Felhasználó, aki esküvőre készülőként, magánszemélyként regisztrál</li>
          <li><strong>Hirdető:</strong> olyan Felhasználó, aki esküvős szolgáltatóként regisztrál és hirdetést tesz közzé</li>
          <li><strong>Hirdetés:</strong> a Hirdető által a Weboldalon közzétett bemutatkozó anyag, leírás és képek</li>
          <li><strong>Tartalom:</strong> minden olyan szöveges, kép, vagy egyéb információ, amelyet a Felhasználók a Weboldalra feltöltenek</li>
        </LegalUl>
      </LegalSection>

      <LegalSection title="3. Regisztráció">
        <LegalSubSection title="3.1 A regisztráció feltételei">
          <LegalP>Regisztrálni kizárólag az a természetes vagy jogi személy jogosult, aki:</LegalP>
          <LegalUl>
            <li>Természetes személy esetén betöltötte a <strong>16. életévét</strong> (összhangban a GDPR előírásaival)</li>
            <li>Cselekvőképes (vagy törvényes képviselője hozzájárulásával rendelkezik)</li>
            <li>Elfogadja a jelen ÁSZF-et és az Adatvédelmi tájékoztatót</li>
            <li>Érvényes email címmel rendelkezik</li>
          </LegalUl>
        </LegalSubSection>

        <LegalSubSection title="3.2 A regisztráció folyamata">
          <LegalUl>
            <li>Érvényes email cím megadása</li>
            <li>Jelszó létrehozása</li>
            <li>A regisztrációs típus kiválasztása (Látogató vagy Hirdető)</li>
            <li>Az ÁSZF és Adatvédelmi tájékoztató kifejezett, <strong>opt-in</strong> elfogadása</li>
            <li>A megadott email címre küldött <strong>megerősítő linkre</strong> kattintás</li>
          </LegalUl>
        </LegalSubSection>

        <LegalSubSection title="3.3 A felhasználói fiók biztonsága">
          <LegalP>A Felhasználó köteles jelszavát biztonságosan kezelni, harmadik személlyel nem megosztani, és kompromittálódás esetén azonnal megváltoztatni. A fiókkal történő minden tevékenységért a Felhasználó felelős.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="4. A Szolgáltatás használata">
        <LegalSubSection title="4.1 Általános szabályok">
          <LegalP>A Felhasználó a Szolgáltatás használata során köteles a jogszabályokat és a jelen ÁSZF-et betartani, más Felhasználók jogait tiszteletben tartani, és tartózkodni minden olyan magatartástól, amely a Szolgáltatás működését zavarná.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="4.2 Tilos magatartás">
          <LegalP>A Weboldalon <strong>TILOS:</strong></LegalP>
          <LegalUl>
            <li>Jogszabályba ütköző, sértő, fenyegető, rasszista, szexuálisan kifogásolható tartalom közzététele</li>
            <li>Más Felhasználók zaklatása, nyomon követése</li>
            <li>Hamis, megtévesztő tartalmak közzététele</li>
            <li>Spam, kéretlen reklám küldése</li>
            <li>Mások személyes adatainak engedély nélküli közzététele</li>
            <li>A Weboldal működésének zavarása (DDoS, scraping, automatizált eszközök)</li>
            <li>Más felhasználói fiók használata, megszemélyesítés</li>
            <li>Szerzői jogot sértő tartalom közzététele</li>
            <li>A Weboldal szoftverének visszafejtése, módosítása</li>
          </LegalUl>
          <LegalP>A fenti szabályok megsértése esetén az Üzemeltető jogosult a Felhasználó fiókját <strong>figyelmeztetés nélkül felfüggeszteni vagy törölni</strong>.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="5. Hirdetők (Szolgáltatók) speciális szabályai">
        <LegalSubSection title="5.1 Hirdetési kategóriák">
          <LegalP>A jelenlegi kategóriák: Fotósok · Videósok · Élőzene · DJ · Vőfély · Torta · Sütemény · Menyasszonyi ruha · Öltöny · Szmoking · Dekor · Kellék · Smink · Fodrász · Borbély · Körmös · Köszöntő · Ajándék · Pedikűr · Manikűr · Kozmetika · Ékszer · Meghívó · Autó · Hintó · Táncoktatás · Catering · Helyszín · Virág</LegalP>
          <LegalP>Az Üzemeltető fenntartja a jogot a kategóriák módosítására.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="5.2 Hirdetés tartalma">
          <LegalP>A Hirdető köteles valós, ellenőrzött adatokat megadni, csak olyan szolgáltatást hirdetni, amelyre jogosult, és naprakészen tartani elérhetőségeit.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="5.3 Feltöltött képek">
          <LegalP>A Hirdető szavatolja, hogy a feltöltött képek saját tulajdonát képezik vagy közzétételre jogosultsággal rendelkezik, a képeken szereplő személyek hozzájárulásával rendelkezik, és a képek nem sértik harmadik fél jogait.</LegalP>
          <LegalP>A Hirdető vállalja, hogy a képekkel kapcsolatos minden jogvita esetén közvetlenül helytáll, és az Üzemeltetőt kármentesíti.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="5.4 Notice-and-takedown eljárás">
          <LegalP>Amennyiben bárki bejelenti az <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] underline">info@eskuvorekeszulok.hu</a> címen, hogy egy feltöltött kép sérti a jogait, az Üzemeltető 5 munkanapon belül felülvizsgálja, és indokolt esetben leveszi a kifogásolt tartalmat.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="5.5 Hirdetés jóváhagyása">
          <LegalP>Az Üzemeltető a Hirdetők regisztrációját és minden módosítását manuálisan moderálja. A jóváhagyás várható ideje: legfeljebb 5 munkanap. Az Üzemeltető fenntartja a jogot, hogy indoklás nélkül elutasítson bármely hirdetést.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="6. Értékelések">
        <LegalP>A regisztrált Látogatók értékelhetik a Hirdetőket valós, saját tapasztalaton alapuló értékeléssel. Az értékelés nem tartalmazhat rágalmazó, sértő, jogellenes kijelentéseket, sem hamis vagy manipulatív tartalmat. Az Üzemeltető jogosult törölni a szabályokat sértő értékeléseket.</LegalP>
      </LegalSection>

      <LegalSection title="7. Üzenetküldés">
        <LegalP>A regisztrált Felhasználók a Weboldalon belüli üzenetfunkción keresztül léphetnek kapcsolatba egymással. Az üzeneteket alapvetően kizárólag a beszélgetésben résztvevő két fél látja. Az adminisztrátor nem olvassa rendszeresen az üzeneteket; kizárólag visszaélés bejelentése, jogszabályi kötelezettség vagy biztonsági incidens esetén tekint beléjük.</LegalP>
      </LegalSection>

      <LegalSection title="8. Felelősség">
        <LegalSubSection title="8.1 Az Üzemeltető felelősségének korlátozása">
          <LegalP>Az Üzemeltető a Weboldalt a „best effort" elv alapján, az elérhetőség és a tartalom hibátlanságára való garanciavállalás nélkül üzemelteti. Az Üzemeltető nem felel a Weboldal elérhetetlenségéből, adatvesztésből, a Felhasználók közötti közvetlen ügyletekből, a feltöltött tartalmak valóságtartalmából, vagy harmadik fél (Supabase, Vercel) kieséséből eredő károkért.</LegalP>
        </LegalSubSection>

        <LegalSubSection title="8.2 Felhasználók felelőssége">
          <LegalP>Minden Felhasználó közvetlenül felel az általa feltöltött vagy közzétett tartalom jogszerűségéért. A Felhasználók tudomásul veszik, hogy az Üzemeltető nem közvetítője a Hirdetők és Látogatók közötti szolgáltatásnyújtásnak.</LegalP>
        </LegalSubSection>
      </LegalSection>

      <LegalSection title="9. A Szolgáltatás díjazása">
        <LegalP>A Szolgáltatás jelenleg <strong>mind a Látogatók, mind a Hirdetők számára teljes mértékben ingyenes</strong>. Az Üzemeltető fenntartja a jogot, hogy a jövőben fizetős opciókat vezessen be, melyről előzetesen tájékoztatja a Felhasználókat.</LegalP>
      </LegalSection>

      <LegalSection title="10. Felmondás, fiók megszüntetése">
        <LegalP>A Felhasználó bármikor megszüntetheti a fiókját a profil beállításaiban vagy az <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] underline">info@eskuvorekeszulok.hu</a> emailen. A fiók törlését követő 30 napon belül minden személyes adatot véglegesen törlünk.</LegalP>
        <LegalP>Az Üzemeltető a fiókot azonnali hatállyal felfüggesztheti, amennyiben a Felhasználó az ÁSZF-et megsérti, jogszabálysértő magatartást tanúsít, vagy más Felhasználók biztonságát veszélyezteti.</LegalP>
      </LegalSection>

      <LegalSection title="11. Szellemi tulajdon">
        <LegalP>A Weboldal arculata, logója, kódja és az Üzemeltető által létrehozott tartalmak az Üzemeltető szellemi tulajdonát képezik. A Felhasználók által feltöltött tartalmak tulajdonjoga a Felhasználóknál marad; a feltöltéssel nem kizárólagos, díjmentes felhasználási jogot biztosítanak az Üzemeltetőnek a Weboldal működtetésére.</LegalP>
      </LegalSection>

      <LegalSection title="12. Vitarendezés">
        <LegalP>Vitás esetekben elsősorban a békés megegyezésre törekszünk. Kérjük, írj az <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] underline">info@eskuvorekeszulok.hu</a> címre. Adatvédelmi panasz esetén a NAIH-hoz fordulhatsz. Egyéb vitás kérdésekben a magyar bíróságok joghatósága az irányadó. A jelen ÁSZF-re a <strong>magyar jog</strong> vonatkozik.</LegalP>
      </LegalSection>

      <LegalSection title="13. Az ÁSZF módosítása">
        <LegalP>Az Üzemeltető fenntartja a jogot, hogy a jelen ÁSZF-et egyoldalúan módosítsa. A módosításról legalább <strong>15 nappal</strong> a hatálybalépés előtt tájékoztatja a Felhasználókat.</LegalP>
        <LegalP>Az ÁSZF és az <Link href="/privacy" className="text-[#84AAA6] underline">Adatvédelmi tájékoztató</Link> együttesen szabályozza a Weboldal használatát.</LegalP>
      </LegalSection>

    </LegalPageLayout>
  );
}
