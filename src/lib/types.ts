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
  category: ServiceCategory;
  county: string;
  website?: string;
  avatar_url?: string;
  gallery_urls?: string[];
  approval_status: ApprovalStatus;
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
  category: ServiceCategory;
  county: string;
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
