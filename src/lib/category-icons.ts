import {
  Camera, Music, Mic, Cake, Crown, Shirt, Flower2,
  Palette, Scissors, Hand, Gift, Footprints, Sparkles, Gem,
  Mail, Car, PersonStanding, UtensilsCrossed, Building2, Flower,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategory } from "./types";

export const CATEGORY_LUCIDE_ICONS: Record<ServiceCategory, LucideIcon> = {
  "fotosok-videosok": Camera,
  "elo-zene-dj": Music,
  vofely: Mic,
  "torta-sutemeny": Cake,
  "menyasszonyi-ruha": Crown,
  "oltonya-szmoking": Shirt,
  "dekor-kellek": Flower2,
  smink: Palette,
  "fodrasz-borbely": Scissors,
  kormos: Hand,
  "koszonto-ajandek": Gift,
  "pedikur-manikur": Footprints,
  kozmetika: Sparkles,
  ekszer: Gem,
  meghivo: Mail,
  "auto-hinto": Car,
  tanckoktatas: PersonStanding,
  catering: UtensilsCrossed,
  helyszin: Building2,
  virag: Flower,
};
