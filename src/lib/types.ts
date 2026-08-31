export type UserRole = "visitor" | "provider" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ServiceCategory =
  | "fotosok-videosok"
  | "elo-zene-dj"
  | "vofely"
  | "szertartasvezeto"
  | "torta-sutemeny"
  | "menyasszonyi-ruha"
  | "oltonya-szmoking"
  | "dekor-kellek"
  | "smink"
  | "fodrasz-borbely"
  | "kormos"
  | "koszonto-ajandek"
  | "pedikur-manikur"
  | "kozmetika"
  | "ekszer"
  | "meghivo"
  | "auto-hinto"
  | "tanckoktatas"
  | "catering"
  | "helyszin"
  | "virag";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  description: string;
  detailed_description?: string | null;
  categories: ServiceCategory[];
  counties: string[];
  website?: string;
  avatar_url?: string;
  gallery_urls?: string[];
  approval_status: ApprovalStatus;
  active?: boolean;
  rejection_reason?: string | null;
  pending_changes?: Partial<ProviderUpdatePayload> | null;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  review_count?: number;
  view_count?: number;
  featured?: "teal" | "silver" | "gold" | null;
  pricing_pdf_url?: string | null;
  pricing_text?: string | null;
}

export interface ProviderUpdatePayload {
  full_name: string;
  phone: string;
  description: string;
  detailed_description?: string | null;
  categories: ServiceCategory[];
  counties: string[];
  website?: string;
  avatar_url?: string;
  gallery_urls?: string[];
  pricing_pdf_url?: string | null;
  pricing_text?: string | null;
}

export interface Review {
  id: string;
  provider_id: string;
  visitor_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  visitor?: { full_name: string };
}

export const COUNTIES = [
  "Országosan",
  "Bács-Kiskun",
  "Baranya",
  "Békés",
  "Borsod-Abaúj-Zemplén",
  "Budapest",
  "Csongrád-Csanád",
  "Fejér",
  "Győr-Moson-Sopron",
  "Hajdú-Bihar",
  "Heves",
  "Jász-Nagykun-Szolnok",
  "Komárom-Esztergom",
  "Nógrád",
  "Pest",
  "Somogy",
  "Szabolcs-Szatmár-Bereg",
  "Tolna",
  "Vas",
  "Veszprém",
  "Zala",
] as const;

export type County = (typeof COUNTIES)[number];

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  "fotosok-videosok": "Fotósok, Videósok",
  "elo-zene-dj": "Élőzene, DJ",
  vofely: "Vőfélyek, Ceremóniamesterek",
  szertartasvezeto: "Szertartásvezetők",
  "torta-sutemeny": "Torták, Sütemények",
  "menyasszonyi-ruha": "Menyasszonyi ruhák",
  "oltonya-szmoking": "Öltönyök, Szmoking",
  "dekor-kellek": "Dekor, Kellékek",
  smink: "Smink",
  "fodrasz-borbely": "Fodrászok, Borbélyok",
  kormos: "Körmösök",
  "koszonto-ajandek": "Köszöntők, Ajándékok",
  "pedikur-manikur": "Pedikűr, Manikűr",
  kozmetika: "Kozmetikusok",
  ekszer: "Ékszerek",
  meghivo: "Meghívók",
  "auto-hinto": "Autók, Hintók",
  tanckoktatas: "Táncoktatás",
  catering: "Catering",
  helyszin: "Helyszínek",
  virag: "Virágok, Virágkötők",
};

export const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  "fotosok-videosok": "📷",
  "elo-zene-dj": "🎵",
  vofely: "🎤",
  szertartasvezeto: "💒",
  "torta-sutemeny": "🎂",
  "menyasszonyi-ruha": "👗",
  "oltonya-szmoking": "🤵",
  "dekor-kellek": "🌸",
  smink: "💄",
  "fodrasz-borbely": "💇",
  kormos: "💅",
  "koszonto-ajandek": "🎁",
  "pedikur-manikur": "💆",
  kozmetika: "✨",
  ekszer: "💍",
  meghivo: "💌",
  "auto-hinto": "🚗",
  tanckoktatas: "💃",
  catering: "🍽️",
  helyszin: "🏛️",
  virag: "💐",
};

export const CATEGORY_SEO_DESCRIPTIONS: Record<ServiceCategory, string> = {
  "fotosok-videosok":
    "Az esküvői fotós és videós megörökíti az összes felejthetetlen pillanatot – az első pillantástól a hajnalig tartó táncolásig. Profi esküvői fotósaink és videósaink szerte Magyarországon elérhetők, hogy a nagy napotok örök emlékké váljon. Böngéssz ajánlataink között, és válaszd ki azt a szakembert, aki a stílusotokhoz a legjobban illik.",
  "elo-zene-dj":
    "Élőzene vagy DJ – a tökéletes hangulat a legjobb zenén múlik. Esküvői zenekarok, szólisták és DJ-k széles választékából találhatod meg azt, aki igazán táncra perdíti a vendégeket. Nézz körül kínálatunkban, és foglald le a nagy nap hangulatfelelősét!",
  vofely:
    "A vőfély és a ceremóniamester a lakodalom lelke: ő vezeti végig a ceremóniát, tartja a hangulatot és gondoskodik arról, hogy minden a tervek szerint menjen. Tapasztalt vőfélyeink és ceremóniamestereink Magyarország-szerte vállalnak esküvőket – keresd meg azt, aki a legjobban illik az elképzeléseitekhez.",
  szertartasvezeto:
    "A szertartásvezető a ceremónia hangja: veletek együtt írja meg a szertartás szövegét, és úgy vezeti végig az esküt, hogy az rólatok szóljon. Polgári és szimbolikus szertartásokhoz egyaránt találsz nálunk szertartásvezetőt az ország egész területén – nézd meg az ajánlatokat, és válaszd azt, akinek a stílusa a tiétekhez illik.",
  "torta-sutemeny":
    "Az esküvői torta nemcsak finomság, hanem az ünnep egyik legszebb dísze is. Egyedi tervezésű, kézzel készített esküvői torták és sütemények széles kínálatából választhatsz: romantikustól a modernig, kis csapatnak és nagy lagzira egyaránt. Találd meg az álomcukrászodat nálunk!",
  "menyasszonyi-ruha":
    "Az álomruha megtalálása az esküvőtervezés legemlékezetesebb pillanata. Menyasszonyi ruha szalonjaink szerte az országban várakoznak rád: klasszikus, bohém vagy modern stílusban, minden alkathoz és ízléshez. Keresd meg azt a ruhát, amiben igazán önnagad lehetsz a nagy napon!",
  "oltonya-szmoking":
    "A vőlegény megjelenése épp annyira fontos, mint a menyasszonyé. Elegáns öltöny és szmoking kölcsönzők, valamint szabók segítenek abban, hogy a vőlegény is tökéletesen nézzen ki az esküvőn. Böngéssz ajánlataink között, és találd meg a tökéletes szettet!",
  "dekor-kellek":
    "Az esküvői dekoráció varázsolja igazán különlegessé a helyszínt. Virágdekorátorok, esküvői kellékek kölcsönzői és dekoratőrök segítenek megteremteni az elképzelt hangulatot – legyen az vintage, bohém, romantikus vagy minimál stílus. Keresd meg az inspiráló szakembert!",
  smink:
    "Az esküvői smink megkoronázza a nagy nap összképét. Profi menyasszonyi sminkmesterek biztosítják, hogy a legjobb önmagadat mutathasd az oltár előtt és az esküvői fotókon egyaránt. Tartós, gyönyörű smink – keresd meg a sminkmesteredet nálunk!",
  "fodrasz-borbely":
    "Az esküvői frizura tökéletes kiegészítője az összhatásnak. Esküvői fodrászaink a hajformától a kontyig mindent elvállalnak, hogy a menyasszony és a vőlegény is tündököljön a nagy napon. Nézd meg ajánlatainkat, és foglald le a legjobb stylistot!",
  kormos:
    "Az ápolott körmök apró részletek, de az esküvői fotókon minden számít. Körmös szakembereink esküvői géllakk, műköröm és nail art területén is segítenek, hogy a kezeid is meseszép állapotban legyenek a nagy napra. Keresd meg a hozzád legközelebb eső szakembert!",
  "koszonto-ajandek":
    "Az esküvői ajándék és a személyre szabott köszöntő emlékezetessé teszi az ünnepet. Egyedi ajándékötletek, gravirozott emlékek és kreatív köszöntők széles kínálatából válogathatsz – mind a pár, mind a vendégek számára. Lepd meg szeretteidet egy igazán különleges gesztussal!",
  "pedikur-manikur":
    "A nagy nap előtt kényeztesd magadat egy profi pedikűr- és manikűrkezeléssel. Szakembereink segítenek abban, hogy a lábaid és kezeid is tökéletes állapotban legyenek az esküvőre. Foglalj időpontot most, és érezd magad igazán gondoskodottnak!",
  kozmetika:
    "Az esküvői bőrápolás és kozmetikai kezelés az alapja a tökéletes megjelenésnek. Kozmetikusaink a menyasszonyok és vőlegények igényeihez igazítva nyújtanak kezeléseket – arctisztítástól a bőrmegújításig. Kezd a felkészülést időben, és ragyogj a nagy napon!",
  ekszer:
    "Az esküvői ékszer az ünnep egyik legszebb emléke marad. Egyedi tervezésű jegygyűrűk, nyakláncok és karkötők széles választékából találhatod meg azt a darabot, amely kifejezi a szerelmeteket. Keresd meg az álomékszeredet nálunk!",
  meghivo:
    "Az esküvői meghívó az első benyomás, amit a vendégek kapnak a nagy napról. Egyedi tervezésű, nyomtatott és digitális esküvői meghívók közül választhatsz – klasszikus, modern vagy kézzel festett stílusban. Add meg vendégeidnek az első ízelítőt a csodás napból!",
  "auto-hinto":
    "Az esküvői autó és hintó a ceremónia egyik legstílusosabb eleme. Elegáns limuzinok, vintage autók és mesebeli hinták közül választhatsz, hogy a pár megérkezése igazán emlékezetes legyen. Böngéssz ajánlataink között, és foglald le az álomjárművet!",
  tanckoktatas:
    "Az esküvői nyitótánc az est legmeghatóbb pillanata lehet. Profi táncoktatóink segítenek a párnak összeállítani és betanulni az egyedi koreográfiát – akár keringőtől a modern táncig. Ne félj a parketttől: velünk biztosan ragyogni fogtok!",
  catering:
    "Az esküvői catering az ünnep egyik legemlékezetesebb részét jelenti. Esküvői éttermi és mobil catering szolgáltatók széles kínálatából választhatsz: büfétől a menüsorig, kisebb és nagyobb lagzihoz egyaránt. Keresd meg a legjobb esküvői cateringest a régiódban!",
  helyszin:
    "A tökéletes esküvői helyszín meghatározza az egész nap hangulatát. Kastélyok, borászatok, kertek és különleges rendezvénytermek közül válogathatsz – Budapest közelében és vidéken egyaránt. Találd meg azt a helyszínt, ahol örök emlékké válik a nagy napotok!",
  virag:
    "Az esküvői virágdekoráció varázsolja igazán romantikussá a ceremóniát és a fogadást. Esküvői virágkötőink menyasszonyi csokrok, asztaldíszek és helyszíndekoráció terén egyaránt segítenek megvalósítani az elképzelt hangulatot. Keresd meg a te virágkötődet nálunk!",
};

export const CATEGORY_SYNONYMS: Record<ServiceCategory, string[]> = {
  "fotosok-videosok": [
    "fotográfus", "fényképész", "kameraman", "filmes", "videográfus", "fotó", "videó",
    "esküvői fotós", "esküvői videós", "riporter", "pillanatfelvétel", "fotózás", "videózás",
    "drone", "drónfotó", "légifelvétel", "dokumentálás", "képek", "emlékek", "felvétel",
    "fotóstúdió", "stúdió", "photographer", "videographer", "film",
  ],
  "elo-zene-dj": [
    "zenekar", "együttes", "zenész", "disco", "lemezlovas", "koncert", "band",
    "énekes", "énekesnő", "gitár", "gitáros", "zongorista", "zongora", "hegedű", "hegedűs",
    "szaxofon", "szaxofonos", "vonósnégyes", "vonós", "jazz", "pop", "rock", "klasszikus",
    "akusztikus", "dj", "disc jockey", "zenei", "hangulat", "tánczene", "bál", "mulatság",
    "lakodalom zene", "esküvői zene", "nóta", "magyar nóta", "folklór", "folk",
  ],
  vofely: [
    "ceremóniamester", "mc", "műsorvezető", "konferanszié", "vőfej",
    "köszöntő", "tósztmester", "lagzi vezető", "lagzi",
    "esküvői műsorvezető", "rendezvényvezető", "host",
    "ünnepi köszöntő", "versek", "rigmusok", "humor", "szórakoztató",
  ],
  szertartasvezeto: [
    "szertartásvezető", "anyakönyvvezető", "celebráns", "esküvővezető",
    "polgári szertartás", "szimbolikus szertartás", "kézfogó", "eskü",
    "esküszöveg", "fogadalom", "gyűrűváltás", "ceremónia", "szertartás",
    "esküvői szertartás", "szabadtéri szertartás", "kétnyelvű szertartás",
    "celebrant", "officiant",
  ],
  "torta-sutemeny": [
    "cukrász", "süti", "tortakészítő", "cukrászda", "édességek", "desszert",
    "esküvői torta", "torta", "sütemény", "macaroon", "macaron", "bonbon",
    "cukorvirág", "fondant", "naked cake", "drip cake", "számtorta", "emeletes torta",
    "candy bar", "édesség pult", "esküvői desszert", "keksz", "muffin", "cupcake",
    "gasztronómia", "édességasztal", "krém", "piskóta", "rendeles",
  ],
  "menyasszonyi-ruha": [
    "esküvői ruha", "ruhaszalon", "menyasszonyi szalon", "bridal", "menyasszony ruha",
    "menyasszonyi", "ruha", "szalon", "próba", "uszály", "fátyol", "tüll",
    "csipke", "szatén", "a-vonalú", "sellő fazon", "princesse", "bohém ruha",
    "koszorúslány ruha", "esküvői divat", "próbafoglalás", "alteráció", "varroda",
    "varrónő", "divattervező", "couture", "fehér ruha", "elefántcsont",
  ],
  "oltonya-szmoking": [
    "öltöny", "vőlegény ruha", "zakó", "formal", "smokingruha", "szalon",
    "vőlegény", "öltönyös", "nyakkendő", "csokornyakkendő", "mellény",
    "frakk", "szmoking", "öltönyüzlet", "kölcsönző", "ruhabérlet", "elegáns",
    "szabó", "egyedi szabás", "méretes öltöny", "kísérő ruha", "násznagy",
    "tanú ruha", "öltönyössé", "klasszikus", "modern öltöny",
  ],
  "dekor-kellek": [
    "dekoráció", "díszítés", "dekoratőr", "esküvői díszítés", "kellék", "dekor",
    "asztaldísz", "esküvői dekor", "léggömb", "ballondekor", "szalag", "girland",
    "fényfüzér", "led", "gyertya", "mécsestartó", "virágdekor", "ívdekor",
    "arch", "baldachin", "sátor", "pavilon", "ültetési terv", "tábla", "felirat",
    "neon felirat", "fénybetű", "fotófal", "fotowall", "háttérfal", "backdrop",
    "esküvői kellék", "konfetti", "száraz jég", "füst", "pezsgő",
  ],
  smink: [
    "sminkművész", "make-up", "make up artist", "mua", "arcfestés", "sminkes",
    "menyasszonyi smink", "esküvői smink", "nappali smink", "esti smink",
    "airbrush smink", "tartós smink", "szemkidolgozás", "contouring", "highlighter",
    "alapozó", "rúzs", "szemhéjfesték", "árnyékolás", "szempilla", "műszempilla",
    "szépség", "beauty", "makeup artist", "arcápolás", "bőrápolás",
  ],
  "fodrasz-borbely": [
    "fodrász", "hajstylista", "frizura", "hajvágás", "stylist", "hajdísz",
    "esküvői frizura", "menyasszonyi frizura", "konty", "fonott konty", "tűzött haj",
    "hullámos haj", "göndörítés", "egyenesítés", "festés", "balayage", "highlights",
    "hajfonat", "félkonty", "laza frizura", "vintage frizura", "bohém frizura",
    "hajdekor", "tiara", "hajcsat", "hajpánt", "vőlegény frizura", "szakáll", "borotválás",
  ],
  kormos: [
    "köröm", "műköröm", "géllakk", "nail art", "körömstúdió", "körömépítés",
    "körömdísz", "körömfestés", "akril", "porcelán köröm", "zselé köröm",
    "esküvői manikűr", "esküvői köröm", "french manikűr", "ombre köröm",
    "kristály", "strassz", "virágos köröm", "menyasszonyi köröm", "természetes köröm",
  ],
  "koszonto-ajandek": [
    "ajándék", "köszöntő", "gravirozott", "személyre szabott", "emléktárgy", "nászajándék",
    "esküvői ajándék", "vendégajándék", "köszönetajándék", "pénzajándék",
    "egyedi ajándék", "gravírozás", "felirat", "fénykép ajándék", "fotóajándék",
    "vászonkép", "fotokönyv", "emlékkönyv", "naplók", "persely", "képkeret",
    "mézes sütemény", "pálinka", "bor", "különleges ajándék", "surprise",
  ],
  "pedikur-manikur": [
    "lábápolás", "kézápolás", "pedikűr", "manikűr", "körömápolás",
    "spa", "kényeztetés", "wellness", "lábmasszázs", "kézmasszázs",
    "sarokreszelés", "bőrkeményedés", "géllakk pedikűr", "vízi pedikűr",
    "halterápia", "esküvő előtti kezelés", "szépségszalon",
  ],
  kozmetika: [
    "kozmetikus", "bőrápolás", "arctisztítás", "facial", "szépségszalon", "arckezelés",
    "arcmaszk", "peeling", "mélytisztítás", "microdermabráció", "hidratálás",
    "anti-aging", "ránctalanítás", "bőrfiatalítás", "mezoterápia", "ultrahang",
    "szépségkezelés", "bőrgyógyász", "bőr", "rosacea", "pattanás", "pórustágulat",
    "esküvő előtti kezelés", "menyasszonyi kezelés", "wellness", "spa",
  ],
  ekszer: [
    "gyűrű", "jegygyűrű", "ékszerész", "nyaklánc", "karkötő", "ékszerbolt",
    "esküvői ékszer", "menyasszonyi ékszer", "fülbevaló", "tiara", "fejdísz",
    "gyémánt", "arany", "fehérarany", "rozéarany", "ezüst", "platina",
    "köves gyűrű", "briliáns", "egyedi ékszer", "ékszerterv", "gravírozás",
    "páros ékszer", "wedding ring", "engagement ring", "jegyajándék",
  ],
  meghivo: [
    "meghívó", "nyomtatás", "grafikus", "ültetési terv", "esküvői nyomtatvány",
    "esküvői meghívó", "save the date", "ültetőkártya", "asztalszám", "menükártya",
    "borítékok", "pecsét", "viaszpecsét", "szalaghirdetmény", "program füzet",
    "köszönőkártya", "kézzel írott", "kalligráfia", "digitális meghívó",
    "online meghívó", "egyedi tervezés", "design", "nyomda", "esküvői stacionárium",
  ],
  "auto-hinto": [
    "limuzin", "esküvői autó", "vintage autó", "autókölcsönző", "hintó", "bérautó",
    "rolls royce", "mercedes", "cadillac", "oldtimer", "retró autó", "klasszikus autó",
    "fehér autó", "fekete autó", "szalagos autó", "sofőr", "chauffeur",
    "lovas hintó", "ünnepi kocsi", "esküvői transzport", "szállítás", "menyasszonyi autó",
    "vőlegény autó", "party busz", "esküvői busz",
  ],
  tanckoktatas: [
    "tánc", "koreográfia", "nyitótánc", "valcer", "keringő", "tánciskola", "táncóra",
    "esküvői tánc", "tangó", "foxtrott", "rumba", "quickstep", "salsa", "cha-cha",
    "latin tánc", "standard tánc", "néptánc", "modern tánc", "koreográfus",
    "táncpróba", "tánctanfolyam", "táncmester", "esküvői koreográfia",
    "pár tánc", "együtt táncolás", "romantikus tánc",
  ],
  catering: [
    "étel", "büfé", "menü", "étkezés", "szakács", "főzés", "étterem",
    "esküvői vacsora", "lagzi étel", "bankett", "ültetéses vacsora", "grill",
    "barbecue", "bbq", "street food", "food truck", "hideg büfé", "meleg büfé",
    "előétel", "leves", "főétel", "desszert", "péksütemény", "kenyér",
    "tortilla", "canape", "finger food", "vegán", "vegetáriánus", "gluténmentes",
    "halal", "kosher", "séf", "pincér", "felszolgáló", "italszolgáltatás",
    "bor", "pálinka", "koktél", "bárszolgálat",
  ],
  helyszin: [
    "kastély", "borászat", "rendezvényterem", "étterem", "kert", "terem", "szalon",
    "esküvői helyszín", "ceremónia helyszín", "fogadás helyszín", "villa",
    "birtok", "major", "tanya", "farm", "pince", "pincerendszer", "barlang",
    "hotel", "szálloda", "wellness hotel", "fürdő", "uszoda", "teniszpálya",
    "lovasbirtok", "lovarda", "erdei helyszín", "tavi helyszín", "dunai hajó",
    "hajó", "panorámás", "kilátó", "hegytetős", "szabadtéri", "outdoor",
    "indoor", "beltéri", "kültéri", "esküvői birtok", "vendégház",
  ],
  virag: [
    "virágkötő", "csokor", "menyasszonyi csokor", "asztaldísz", "flórista", "virágbolt", "bokréta",
    "esküvői virág", "virágdekoráció", "virágdísz", "koszorú", "hajtű",
    "kitűző", "boutonniere", "gomblyukdísz", "rózsa", "bazsarózsa", "hortenzia",
    "tulipán", "liliom", "orchidea", "levendula", "boglárka", "eukaliptusz",
    "zöld növény", "borostyán", "páfrány", "koszorúslány csokor", "dobócsokor",
    "oltárdekor", "ceremóniadekor", "székdekor", "mennyezeti virágdísz",
  ],
};

export const CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  "fotosok-videosok": "Örök emlékek minden pillanatból.",
  "elo-zene-dj": "A jó zene mindenkit táncra perdít.",
  vofely: "Tökéletes nap, profi kezekben.",
  szertartasvezeto: "A ti szavaitokkal, a ti szertartásotok.",
  "torta-sutemeny": "Ettől lesz igazán édes a napotok.",
  "menyasszonyi-ruha": "Az álomruha, ami csak rád vár.",
  "oltonya-szmoking": "Az elegancia döntés kérdése.",
  "dekor-kellek": "A hangulat a részletekben lakik.",
  smink: "A legszebb önmagad, egész nap.",
  "fodrasz-borbely": "Minden tincs a helyén.",
  kormos: "Hagyomány, szerencse és mosoly.",
  "koszonto-ajandek": "Öröm csomagolva, szívből adva.",
  "pedikur-manikur": "Kényeztesd magadat a nagy napra.",
  kozmetika: "Ragyogj a legszebb napodón.",
  ekszer: "A csillogó pont az i-n.",
  meghivo: "Az első igen már a borítékon.",
  "auto-hinto": "Érkezz stílusban, menj el mesékben.",
  tanckoktatas: "Lépj fel magabiztosan a parkettére.",
  catering: "Felejthetetlen ízek az asztalotokon.",
  helyszin: "Az álomhely, ahol az igen elhangzik.",
  virag: "Szirmok, amik elmondják, amit szavak nem tudnak.",
};
