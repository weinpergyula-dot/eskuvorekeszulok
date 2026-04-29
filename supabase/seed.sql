-- ============================================================
-- Teszt adatok – Esküvőre Készülök
-- Futtasd a Supabase SQL Editorban a schema.sql UTÁN
-- ============================================================

-- Először hozzunk létre auth felhasználókat és profilokat,
-- majd a providers táblába szúrjuk be az adatokat.
-- FONTOS: Ez a seed közvetlen INSERT-et használ, ezért
-- a providers táblába user_id-ként dummy UUID-kat szúrunk.

-- Teszt szolgáltatók beszúrása (approved státusszal)
INSERT INTO public.providers (
  id, user_id, full_name, email, phone, description, category, county,
  website, avatar_url, approval_status, view_count, created_at
) VALUES

-- === FOTÓSOK, VIDEÓSOK ===
(gen_random_uuid(), gen_random_uuid(), 'Nagy Albert Gábor', 'nagy.albert@gmail.com', '+36707888787',
 'Vállalok fotózást esküvőkre! 30 éves szaktudással rendelkezem, rugalmasan dolgozom. Riport és beállított képek egyaránt.',
 'fotosok-videosok', 'Budapest', 'https://www.nagyalbertfoto.hu', null, 'approved', 36, now() - interval '30 days'),

(gen_random_uuid(), gen_random_uuid(), 'Kovács Péter Fotográfia', 'kovacs.peter.foto@gmail.com', '+36301234567',
 'Esküvői fotós és videós vagyok, modern stílusban dolgozom. Drón felvételekkel is tudok szolgálni. Egész napos jelenlét vállalható.',
 'fotosok-videosok', 'Pest', 'https://kovacsfilm.hu', null, 'approved', 89, now() - interval '45 days'),

(gen_random_uuid(), gen_random_uuid(), 'Szabó Réka Wedding Photography', 'reka.szabo.foto@gmail.com', '+36209876543',
 'Intim, életközeli képek a ti nagy napotokról. Riportstílusú fotózás, természetes pillanatok megörökítése a szívügyem.',
 'fotosok-videosok', 'Győr-Moson-Sopron', null, null, 'approved', 54, now() - interval '20 days'),

(gen_random_uuid(), gen_random_uuid(), 'Horváth Filmstúdió', 'horvath.film@outlook.com', '+36706543210',
 '4K videó és fotó csomag esküvőkre. Drone felvételek, highlight film, teljes nap rögzítése. Díjnyertes munkák.',
 'fotosok-videosok', 'Baranya', 'https://horvathfilm.hu', null, 'approved', 112, now() - interval '60 days'),

(gen_random_uuid(), gen_random_uuid(), 'Kiss Balázs Esküvői Fotós', 'kissbalazsfoto@gmail.com', '+36301112233',
 'Természetes fény, valódi érzelmek. Budapest és vidék, utazási díj nélkül 150 km-ig.',
 'fotosok-videosok', 'Fejér', null, null, 'approved', 41, now() - interval '15 days'),

(gen_random_uuid(), gen_random_uuid(), 'Fekete Ádám Videography', 'adam.fekete.video@gmail.com', '+36209998877',
 'Cinematic esküvői videók. Storytelling megközelítés, profi hangfelvétel. Előzetes megtekinthető a weboldalon.',
 'fotosok-videosok', 'Borsod-Abaúj-Zemplén', 'https://feketeadam.hu', null, 'approved', 67, now() - interval '25 days'),

(gen_random_uuid(), gen_random_uuid(), 'Molnár Zsuzsanna Fotóstúdió', 'molnar.zsu.foto@gmail.com', '+36701234000',
 'Esküvői fotózás Debrecenben és környékén. Párfotózás lehetséges a nagy nap előtt is.',
 'fotosok-videosok', 'Hajdú-Bihar', null, null, 'approved', 28, now() - interval '10 days'),

-- === ÉLŐZENE, DJ ===
(gen_random_uuid(), gen_random_uuid(), 'DJ Tamás – Esküvői Zenész', 'djtamas@gmail.com', '+36305556677',
 'Esküvői DJ és MC szolgáltatás. 15 éves tapasztalat, profi hangrendszer, fénytechnika. Az esti buli garantált!',
 'elo-zene-dj', 'Budapest', 'https://djtamas.hu', null, 'approved', 95, now() - interval '40 days'),

(gen_random_uuid(), gen_random_uuid(), 'Harmónia Zenekar', 'harmonia.zenekar@gmail.com', '+36204445566',
 '5 tagú élőzene zenekar. Magyar nóta, pop, jazz és rock repertoár. Vonós kvartett lehetőség a szertartáshoz.',
 'elo-zene-dj', 'Pest', 'https://harmoniazenekar.hu', null, 'approved', 78, now() - interval '35 days'),

(gen_random_uuid(), gen_random_uuid(), 'Varga Norbert Szaxofonista', 'varga.norbi.szax@gmail.com', '+36703334455',
 'Szólóban vagy kisegyüttessel vállalok esküvői zenei szolgáltatást. Jazz, soul, pop – bármilyen hangulathoz.',
 'elo-zene-dj', 'Győr-Moson-Sopron', null, null, 'approved', 33, now() - interval '18 days'),

(gen_random_uuid(), gen_random_uuid(), 'DJ Krisztián Sound', 'djkrisztian@gmail.com', '+36301231234',
 'Profi DJ és fénytechnika. Minden zenei stílus, interaktív műsorvezetés. Referenciák megtekinthetők.',
 'elo-zene-dj', 'Somogy', null, null, 'approved', 44, now() - interval '22 days'),

(gen_random_uuid(), gen_random_uuid(), 'Melodia Vonósnégyes', 'melodia.vonos@gmail.com', '+36207778899',
 'Klasszikus és kortárs darabok esküvői szertartásokhoz és fogadásokhoz. Budapest és vidék egyaránt.',
 'elo-zene-dj', 'Budapest', 'https://melodia.hu', null, 'approved', 56, now() - interval '28 days'),

-- === VŐFÉLY ===
(gen_random_uuid(), gen_random_uuid(), 'Tóth Sándor Vőfély', 'toth.sandor.vofely@gmail.com', '+36306667788',
 'Humoros és megható vőfélykedés. 20 éves tapasztalat, egyedi köszöntők írása. Egész napos jelenlét.',
 'vofely', 'Budapest', null, null, 'approved', 62, now() - interval '50 days'),

(gen_random_uuid(), gen_random_uuid(), 'Balogh Tibor – Hagyományőrző Vőfély', 'balogh.tibor.vofely@gmail.com', '+36205554433',
 'Népi hagyományokat ötvözök a modern vőfélykedéssel. Versek, mondókák, játékok a vendégek szórakoztatásához.',
 'vofely', 'Hajdú-Bihar', null, null, 'approved', 39, now() - interval '16 days'),

(gen_random_uuid(), gen_random_uuid(), 'Simon Péter Ceremóniamester', 'simon.peter.mc@gmail.com', '+36701110022',
 'Kétnyelvű (magyar-angol) ceremóniamester. Vegyes házasságokhoz ideális. Profi, elegáns, megbízható.',
 'vofely', 'Pest', 'https://simonpetermc.hu', null, 'approved', 47, now() - interval '32 days'),

-- === TORTA, SÜTEMÉNY ===
(gen_random_uuid(), gen_random_uuid(), 'Édességek Háza – Papp Katalin', 'papp.katalin.torta@gmail.com', '+36209998800',
 'Kézzel készített esküvői torták, macaronok, desszertek. 5+ réteg, saját készítésű fondant díszítés. Kóstolót vállalok.',
 'torta-sutemeny', 'Budapest', null, null, 'approved', 88, now() - interval '55 days'),

(gen_random_uuid(), gen_random_uuid(), 'Mézeskalács & Torta Manufaktúra', 'mezeskalacs.manufaktura@gmail.com', '+36303332211',
 'Egyedi esküvői torták és mézeskalács favoritok. Allergiás változatok is. Szállítás Budapest és Pest megye.',
 'torta-sutemeny', 'Pest', 'https://mezesmanufaktura.hu', null, 'approved', 71, now() - interval '38 days'),

(gen_random_uuid(), gen_random_uuid(), 'Bartal Zsófia Cukrászda', 'bartal.zsofi.cukor@gmail.com', '+36701234321',
 'Naked cake, drip cake, tower cake – minden esküvői stílushoz. Győr és környéke, vidékre szállítással.',
 'torta-sutemeny', 'Győr-Moson-Sopron', null, null, 'approved', 29, now() - interval '12 days'),

(gen_random_uuid(), gen_random_uuid(), 'Debreceni Cukrászmester', 'debr.cukor@gmail.com', '+36204321098',
 'Hagyományos és modern esküvői torták Debrecenben. 30 éves tapasztalat, megbízható minőség.',
 'torta-sutemeny', 'Hajdú-Bihar', null, null, 'approved', 52, now() - interval '42 days'),

-- === MENYASSZONYI RUHA ===
(gen_random_uuid(), gen_random_uuid(), 'Álom Menyasszonyi Szalon', 'alom.menyasszonyi@gmail.com', '+36301234888',
 'Exkluzív és megfizethető menyasszonyi ruhák. Saját tervezésű és import modellek. Varrodai módosítás helyben.',
 'menyasszonyi-ruha', 'Budapest', 'https://alommenyasszonyi.hu', null, 'approved', 134, now() - interval '70 days'),

(gen_random_uuid(), gen_random_uuid(), 'Fehér Rózsa Esküvői Szalon', 'feher.rozsa.szalon@gmail.com', '+36205671234',
 'Több száz ruhamodell raktárról. Bérlés és vásárlás egyaránt. Kiegészítők, fátyol, tiara – minden egy helyen.',
 'menyasszonyi-ruha', 'Debrecen', null, null, 'approved', 98, now() - interval '48 days'),

-- === ÖLTÖNY, SZMOKING ===
(gen_random_uuid(), gen_random_uuid(), 'Gentlemans Club Öltönyös', 'gentlemans.oltonya@gmail.com', '+36706781234',
 'Méretre szabott öltönyök és szmokingok esküvőkre. Magyar szabó mesterek munkája. Bérlés lehetséges.',
 'oltonya-szmoking', 'Budapest', 'https://gentlemans.hu', null, 'approved', 76, now() - interval '44 days'),

(gen_random_uuid(), gen_random_uuid(), 'Elegancia Öltönyház', 'elegancia.oltonya@gmail.com', '+36209870987',
 'Prémium öltönyök és kiegészítők bérlése és vásárlása. Gyors kiszolgálás, barátságos árak.',
 'oltonya-szmoking', 'Pest', null, null, 'approved', 43, now() - interval '21 days'),

-- === DEKOR, KELLÉK ===
(gen_random_uuid(), gen_random_uuid(), 'Virágos Álom Dekorátor', 'viragos.alom.dekor@gmail.com', '+36301239876',
 'Teljes esküvői dekoráció: asztaldíszek, szék huzatok, kapudekor, fénydekor. Helyszíni felmérés ingyenes.',
 'dekor-kellek', 'Budapest', 'https://viragosalom.hu', null, 'approved', 107, now() - interval '60 days'),

(gen_random_uuid(), gen_random_uuid(), 'Dekor & Events by Katalin', 'dekor.events.katalin@gmail.com', '+36204560123',
 'Egyedi tematikus dekorációk. Vintage, boho, klasszikus és modern stílusok. Teljes kivitelezés vállalható.',
 'dekor-kellek', 'Fejér', null, null, 'approved', 58, now() - interval '27 days'),

(gen_random_uuid(), gen_random_uuid(), 'Pécsi Esküvő Dekor', 'pecsi.eskuvo.dekor@gmail.com', '+36707654321',
 'Pécs és Baranya megye területén dekoráció szolgáltatás. Saját eszközpark, nagy választék.',
 'dekor-kellek', 'Baranya', null, null, 'approved', 31, now() - interval '14 days'),

-- === SMINK ===
(gen_random_uuid(), gen_random_uuid(), 'Barna Éva Make-Up Artist', 'barna.eva.mua@gmail.com', '+36201234560',
 'Tartós esküvői smink légkefével és hagyományos technikával. Próbasmink kötelező. Budapest és agglomeráció.',
 'smink', 'Budapest', 'https://barnaevamua.hu', null, 'approved', 143, now() - interval '65 days'),

(gen_random_uuid(), gen_random_uuid(), 'Glam Studio – Horváth Bettina', 'glam.bettina.mua@gmail.com', '+36305678901',
 'Airbrush és HD smink. Menyasszony + násznagy csomag. Kiszállás az egész országban vállalható.',
 'smink', 'Pest', 'https://glamstudio.hu', null, 'approved', 119, now() - interval '52 days'),

(gen_random_uuid(), gen_random_uuid(), 'Szép Nap Smink Stúdió', 'szepnap.smink@gmail.com', '+36703210987',
 'Természetes és glamour smink egyaránt. Próba időpont kötelező. Debrecen és Hajdú-Bihar megye.',
 'smink', 'Hajdú-Bihar', null, null, 'approved', 67, now() - interval '33 days'),

(gen_random_uuid(), gen_random_uuid(), 'Tündér Make-Up by Viki', 'tunder.mua.viki@gmail.com', '+36201110099',
 'Egyéni stílusodhoz igazított esküvői smink. Tartós, fotogén eredmény. Győr és környéke.',
 'smink', 'Győr-Moson-Sopron', null, null, 'approved', 45, now() - interval '19 days'),

-- === FODRÁSZ, BORBÉLY ===
(gen_random_uuid(), gen_random_uuid(), 'Hajvarázs Szalon – Németh Anikó', 'hajvarazs.aniko@gmail.com', '+36209871234',
 'Esküvői frizurák kontyoktól a hullámos hajakig. Hajhosszabbítás, hajdísz felhelyezés. Kiszállás vállalható.',
 'fodrasz-borbely', 'Budapest', null, null, 'approved', 91, now() - interval '46 days'),

(gen_random_uuid(), gen_random_uuid(), 'Bodza Hair Studio', 'bodza.hair@gmail.com', '+36305550099',
 'Modern és klasszikus esküvői frizurák. Csapat: 3 fodrász. Csoportos kikészítés lehetséges.',
 'fodrasz-borbely', 'Pest', 'https://bodzahair.hu', null, 'approved', 73, now() - interval '37 days'),

(gen_random_uuid(), gen_random_uuid(), 'Pécsi Esküvői Hajstúdió', 'pecsi.haj@gmail.com', '+36703456789',
 'Esküvői frizurák Pécsett. Próba kötelező. Fonyott és kontyos frizurák specialistája.',
 'fodrasz-borbely', 'Baranya', null, null, 'approved', 38, now() - interval '17 days'),

-- === KÖRMÖS ===
(gen_random_uuid(), gen_random_uuid(), 'NailArt by Csilla', 'nailart.csilla@gmail.com', '+36201230099',
 'Esküvői géllakk, műköröm, nail art díszítéssel. Menyasszony + koszorúslányok csomag kedvezménnyel.',
 'kormos', 'Budapest', null, null, 'approved', 82, now() - interval '41 days'),

(gen_random_uuid(), gen_random_uuid(), 'Kristály Körömstúdió', 'kristaly.korom@gmail.com', '+36305556600',
 'Prémium köröm kezelések. Francia, ombre, egyedi minták. Gyors és tartós eredmény.',
 'kormos', 'Pest', null, null, 'approved', 55, now() - interval '23 days'),

-- === KOZMETIKA ===
(gen_random_uuid(), gen_random_uuid(), 'Ragyogó Bőr Kozmetika', 'ragyogo.bor@gmail.com', '+36207778800',
 'Esküvő előtti bőrkezelések sorozata. Arctisztítás, mélyhámlasztás, arcmasszázs. Ajánlott 3 hónappal előtte kezdeni.',
 'kozmetika', 'Budapest', null, null, 'approved', 64, now() - interval '36 days'),

(gen_random_uuid(), gen_random_uuid(), 'Pelle Kozmetikai Szalon', 'pelle.kozmetika@gmail.com', '+36301230044',
 'Komplex esküvői szépségkezelések. IPL szőrtelenítés, arcfiatalítás, testkezelések.',
 'kozmetika', 'Győr-Moson-Sopron', null, null, 'approved', 47, now() - interval '24 days'),

-- === ÉKSZER ===
(gen_random_uuid(), gen_random_uuid(), 'Goldsmith – Egyedi Ékszerek', 'goldsmith.ekszer@gmail.com', '+36206780000',
 'Kézzel készített jegygyűrűk és eljegyzési gyűrűk. Saját tervezés lehetséges. Arany, fehérarany, platina.',
 'ekszer', 'Budapest', 'https://goldsmith.hu', null, 'approved', 156, now() - interval '80 days'),

(gen_random_uuid(), gen_random_uuid(), 'Öröm Ékszerészet', 'orom.ekszer@gmail.com', '+36305671111',
 'Párban tervezzük meg a jegygyűrűtöket. Egyedi gravírozás, kőberakás lehetséges.',
 'ekszer', 'Debrecen', null, null, 'approved', 89, now() - interval '49 days'),

-- === MEGHÍVÓ ===
(gen_random_uuid(), gen_random_uuid(), 'Papírvarázs Esküvői Nyomda', 'papirvarazs@gmail.com', '+36201115566',
 'Egyedi meghívók, ültetési tervek, menükártyák, köszönetajándék feliratok. Online tervezés lehetséges.',
 'meghivo', 'Budapest', 'https://papirvarazs.hu', null, 'approved', 72, now() - interval '43 days'),

(gen_random_uuid(), gen_random_uuid(), 'Nyomaték Design Stúdió', 'nyomatek.design@gmail.com', '+36703339988',
 'Prémium esküvői nyomdai termékek. Lézervágás, dombornyomás, aranyozás. 2-3 hetes átfutás.',
 'meghivo', 'Pest', null, null, 'approved', 48, now() - interval '26 days'),

-- === AUTÓ, HINTÓ ===
(gen_random_uuid(), gen_random_uuid(), 'Esküvői Autók – VIP Transfer', 'eskuvoi.auto.vip@gmail.com', '+36306667711',
 'Rolls-Royce, Bentley, Lincoln limuzin, vintage autók. Sofőr, díszítés, szalag. Teljes nap bérelhető.',
 'auto-hinto', 'Budapest', 'https://eskuvoiauto.hu', null, 'approved', 103, now() - interval '58 days'),

(gen_random_uuid(), gen_random_uuid(), 'Hintós Álom Lovarda', 'hintos.alom.lovarda@gmail.com', '+36204567890',
 'Lovas hintók esküvőkre. Fehér, fekete, antik hintók. Páros és négy fehér ló lehetséges.',
 'auto-hinto', 'Pest', null, null, 'approved', 61, now() - interval '30 days'),

-- === TÁNCOKTATÁS ===
(gen_random_uuid(), gen_random_uuid(), 'Ritmika Tánciskola', 'ritmika.tanciskola@gmail.com', '+36201234599',
 'Esküvői nyitótánc oktatás. 1-12 alkalom a pár igénye szerint. Bármilyen zenére, bármilyen stílusban.',
 'tanckoktatas', 'Budapest', 'https://ritmika.hu', null, 'approved', 84, now() - interval '47 days'),

(gen_random_uuid(), gen_random_uuid(), 'TáncArt Stúdió – Fekete Petra', 'tancart.petra@gmail.com', '+36304561234',
 'Keringő, tangó, modern – mindent megtanítunk. Rugalmas időpontok, kedves oktató. Online és személyes.',
 'tanckoktatas', 'Pest', null, null, 'approved', 59, now() - interval '29 days'),

-- === CATERING ===
(gen_random_uuid(), gen_random_uuid(), 'Royal Catering Kft.', 'royal.catering@gmail.com', '+36303334444',
 'Esküvői büfé és menüs vacsora. 50-500 fő részére. Saját felszerelés, pincér személyzet, dekorált tálalás.',
 'catering', 'Budapest', 'https://royalcatering.hu', null, 'approved', 128, now() - interval '75 days'),

(gen_random_uuid(), gen_random_uuid(), 'Ízek Kertje Catering', 'izek.kertje@gmail.com', '+36205553322',
 'Magyar ízek, minőségi alapanyagok. Kóstolót szervező. Ételallergiák kezelése. Pécs és Baranya.',
 'catering', 'Baranya', null, null, 'approved', 67, now() - interval '34 days'),

(gen_random_uuid(), gen_random_uuid(), 'Arany Tál Rendezvénycatering', 'arany.tal.catering@gmail.com', '+36701234567',
 'Teljes körű catering szolgáltatás Debrecenben. Pincérek, felszerelés, ételek – minden csomag.',
 'catering', 'Hajdú-Bihar', null, null, 'approved', 43, now() - interval '20 days'),

-- === HELYSZÍN ===
(gen_random_uuid(), gen_random_uuid(), 'Kastélykert Rendezvényközpont', 'kastelykeert.rendezveny@gmail.com', '+36306665544',
 '18. századi kastély esküvők fogadására. 50-300 fős terem, parkos kert, romantikus légkör. Mindent egy helyen.',
 'helyszin', 'Pest', 'https://kastelykeert.hu', null, 'approved', 198, now() - interval '90 days'),

(gen_random_uuid(), gen_random_uuid(), 'Rózsakert Esküvői Birtok', 'rozsakert.birtok@gmail.com', '+36207891234',
 'Exclusiv esküvői birtok a Balaton-parton. Saját konyha, szállás, 200 fős befogadóképesség.',
 'helyszin', 'Somogy', 'https://rozsakert.hu', null, 'approved', 176, now() - interval '85 days'),

(gen_random_uuid(), gen_random_uuid(), 'Napsugár Villa Rendezvényközpont', 'napsugar.villa@gmail.com', '+36305557766',
 'Modern villa esküvőkre Győr mellett. Fedett és szabadtéri lehetőség, 150 fő. Saját parkoló.',
 'helyszin', 'Győr-Moson-Sopron', null, null, 'approved', 87, now() - interval '55 days'),

(gen_random_uuid(), gen_random_uuid(), 'Miskolci Fogadó Esküvői Terem', 'miskolci.fogado@gmail.com', '+36703210000',
 'Hagyományos és modern dekorációval is rendezhető. 80-250 fő. Saját italcsomag és catering ajánlat.',
 'helyszin', 'Borsod-Abaúj-Zemplén', null, null, 'approved', 54, now() - interval '31 days'),

-- === VIRÁG ===
(gen_random_uuid(), gen_random_uuid(), 'Virágálom Florist Studio', 'viragalom.florist@gmail.com', '+36209990011',
 'Esküvői virágdekoráció teljeskörűen: menyasszonyi csokor, asztaldíszek, szertartási ívek, autódísz.',
 'virag', 'Budapest', 'https://viragalom.hu', null, 'approved', 122, now() - interval '66 days'),

(gen_random_uuid(), gen_random_uuid(), 'Tavaszi Rét Virágszalon', 'tavaszi.ret.virag@gmail.com', '+36301234222',
 'Szezonális virágokból készített természetes csokor. Fenntartható, eco szemlélet. Pest megye és Budapest.',
 'virag', 'Pest', null, null, 'approved', 79, now() - interval '39 days'),

(gen_random_uuid(), gen_random_uuid(), 'Pécsi Virágkötészet', 'pecsi.viragkoteszet@gmail.com', '+36704445566',
 'Prémium esküvői virág szolgáltatás Pécsett. Boho, vintage, klasszikus stílusok. Ingyenes konzultáció.',
 'virag', 'Baranya', null, null, 'approved', 41, now() - interval '18 days'),

-- === PEDIKŰR, MANIKŰR ===
(gen_random_uuid(), gen_random_uuid(), 'Szépség Sziget – Körömszalon', 'szepseg.sziget.korom@gmail.com', '+36201237788',
 'Esküvői mani-pedi csomag. Géllakk, spa kezelés, lábmasszázs. Csoportos foglalás kedvezménnyel.',
 'pedikur-manikur', 'Budapest', null, null, 'approved', 66, now() - interval '35 days'),

-- === KÖSZÖNTŐ, AJÁNDÉK ===
(gen_random_uuid(), gen_random_uuid(), 'AjándékVarázs Esküvői Bolt', 'ajandekvarazs@gmail.com', '+36305554433',
 'Egyedi köszönetajándékok: gravírozott tárgyak, fotókönyvek, személyre szabott dobozok. Online rendelés.',
 'koszonto-ajandek', 'Budapest', 'https://ajandekvarazs.hu', null, 'approved', 58, now() - interval '28 days')

ON CONFLICT DO NOTHING;

-- ============================================================
-- Teszt értékelések
-- ============================================================
-- Néhány értékelés hozzáadása a meglévő providers-hez
-- (A visitor user_id-k szintén dummy UUID-k a seed céljaira)

INSERT INTO public.reviews (id, provider_id, visitor_id, rating, comment, created_at)
SELECT
  gen_random_uuid(),
  p.id,
  gen_random_uuid(),
  CASE (random() * 4)::int
    WHEN 0 THEN 5
    WHEN 1 THEN 5
    WHEN 2 THEN 4
    WHEN 3 THEN 4
    ELSE 5
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Nagyon elégedett vagyok, mindent a tervek szerint szervezett!'
    WHEN 1 THEN 'Profi munka, kedves kiszolgálás. Mindenképpen ajánlom!'
    WHEN 2 THEN 'Pontosan azt kaptuk, amit ígért. Köszönjük a szép napot!'
    WHEN 3 THEN 'Rugalmas, megbízható. Az egész nap tökéletes volt!'
    ELSE 'Fantasztikus élmény, mindenkinek ajánljuk!'
  END,
  now() - (random() * 30 || ' days')::interval
FROM public.providers p
ON CONFLICT DO NOTHING;

-- Második értékelési kör (hogy legyen átlag alapja)
INSERT INTO public.reviews (id, provider_id, visitor_id, rating, comment, created_at)
SELECT
  gen_random_uuid(),
  p.id,
  gen_random_uuid(),
  CASE (random() * 3)::int
    WHEN 0 THEN 5
    WHEN 1 THEN 4
    ELSE 5
  END,
  null,
  now() - (random() * 60 || ' days')::interval
FROM public.providers p
WHERE random() > 0.4
ON CONFLICT DO NOTHING;
