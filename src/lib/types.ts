export type UserRole = "visitor" | "provider" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ServiceCategory =
  | "fotosok-videosok"
  | "elo-zene-dj"
  | "vofely"
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
}

export interface ProviderUpdatePayload {
  full_name: string;
  phone: string;
  description: string;
  categories: ServiceCategory[];
  counties: string[];
  website?: string;
  avatar_url?: string;
  gallery_urls?: string[];
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
  vofely: "Vőfély",
  "torta-sutemeny": "Torta, Sütemény",
  "menyasszonyi-ruha": "Menyasszonyi ruha",
  "oltonya-szmoking": "Öltöny, Szmoking",
  "dekor-kellek": "Dekor, Kellék",
  smink: "Smink",
  "fodrasz-borbely": "Fodrász, Borbély",
  kormos: "Körmös",
  "koszonto-ajandek": "Köszöntő, Ajándék",
  "pedikur-manikur": "Pedikűr, Manikűr",
  kozmetika: "Kozmetika",
  ekszer: "Ékszer",
  meghivo: "Meghívó",
  "auto-hinto": "Autó, Hintó",
  tanckoktatas: "Táncoktatás",
  catering: "Catering",
  helyszin: "Helyszín",
  virag: "Virág",
};

export const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  "fotosok-videosok": "📷",
  "elo-zene-dj": "🎵",
  vofely: "🎤",
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
    "A vőfély a lakodalom lelke: ő vezeti végig a ceremóniát, tartja a hangulatot és gondoskodik arról, hogy minden a tervek szerint menjen. Tapasztalt vőfélyeink Magyarország-szerte vállalnak esküvőket – keresd meg azt, aki a legjobban illik az elképzeléseitekhez.",
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

export const CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  "fotosok-videosok": "Örökítsétek meg a legszebb pillanatokat.",
  "elo-zene-dj": "A jó zene mindenkit táncra perdít.",
  vofely: "Töléletes nap, profi vezetéssel.",
  "torta-sutemeny": "Ettől lesz igazán édes a napotok.",
  "menyasszonyi-ruha": "A ruha, amiben igazán önnagad lehetsz.",
  "oltonya-szmoking": "Az elegancia döntés kérdése.",
  "dekor-kellek": "A részletek teremtik meg a hangulat varázsát.",
  smink: "A legszebb önmagad, egész nap.",
  "fodrasz-borbely": "Minden tincs számít.",
  kormos: "Örökítsétek meg a nagy napotokat!",
  "koszonto-ajandek": "Lepd meg szeretteidet.",
  "pedikur-manikur": "Kényeztesd magadat a nagy nap előtt.",
  kozmetika: "A végső simítások itt kezdődnek.",
  ekszer: "A drágaságod.",
  meghivo: "Örökítsétek meg a nagy napotokat!",
  "auto-hinto": "Örökítsétek meg a nagy napotokat!",
  tanckoktatas: "Örökítsétek meg a nagy napotokat!",
  catering: "Örökítsétek meg a nagy napotokat!",
  helyszin: "Örökítsétek meg a nagy napotokat!",
  virag: "Örökítsétek meg a nagy napotokat!",
};
