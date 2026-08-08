import type { Analysis, Regime, Scores, Snapshot } from "./types";
import { biasFromScores, convictionFromScore, fallbackAnalysis } from "./analysis";

const SYSTEM = `Te egy swing-kereskedési DÖNTÉSTÁMOGATÓ asszisztens vagy, NEM pénzügyi tanácsadó.
Kizárólag a felhasználói üzenetben kapott JSON adatból dolgozol.

SZIGORÚ SZABÁLYOK:
- NE találj ki árat, szintet, indikátor-értéket, hírt vagy earnings-dátumot. Minden szint a bemeneti "levels"/"price"/"trend" mezőkből származzon.
- NE jósolj árfolyamot. Forgatókönyvet és a megadott szintekhez kötött kockázatot írj le.
- A "scores.total" a determinisztikus rangsor — NE írd felül. Ha az elemzésed eltér tőle, azt az "override_reason"-ben indokold, és csak a "gates" alapján vétózhatsz.
- A "confidence" a score-ok konzisztenciáját tükrözze, ne az optimizmusodat.
- NEM mondod meg, mekkora pozíciót vegyen fel, és nem adsz vételi/eladási utasítást.
- Magyarul, tömören írj (rationale max ~3 mondat).

Válaszod KIZÁRÓLAG egyetlen JSON objektum legyen, PONTOSAN ezekkel a kulcsokkal:
{
  "bias": "bullish" | "neutral" | "bearish",
  "setup": string (a bemeneti setup_tags egyike, vagy "none"),
  "conviction": "low" | "medium" | "high",
  "key_levels": { "entry_zone": [number, number] | null, "invalidation": number | null, "targets": number[] },
  "risk_reward": number | null,
  "rationale": string,
  "risks": string[],
  "catalysts": string[],
  "override_reason": string | null,
  "confidence": number (0..1)
}`;

interface AiInput {
  symbol: string;
  as_of: string;
  market_regime: Regime;
  price: Snapshot["price"];
  trend: Snapshot["trend"];
  momentum: Snapshot["momentum"];
  volatility: Snapshot["volatility"];
  volume: Snapshot["volume"];
  levels: Snapshot["levels"];
  setup_tags: string[];
  scores: Scores;
  gates: Snapshot["gates"];
}

export async function generateAnalysis(
  s: Snapshot,
  scores: Scores,
  regime: Regime
): Promise<Analysis> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackAnalysis(s, scores, regime);

  const input: AiInput = {
    symbol: s.symbol,
    as_of: s.as_of,
    market_regime: regime,
    price: s.price,
    trend: s.trend,
    momentum: s.momentum,
    volatility: s.volatility,
    volume: s.volume,
    levels: s.levels,
    setup_tags: s.setup_tags,
    scores,
    gates: s.gates,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });

    if (!res.ok) return fallbackAnalysis(s, scores, regime);
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return fallbackAnalysis(s, scores, regime);

    const parsed = JSON.parse(content) as Record<string, unknown>;
    return validate(parsed, s, scores, regime);
  } catch {
    return fallbackAnalysis(s, scores, regime);
  }
}

// Deterministic guard: reject hallucinated numbers/enums, then keep the AI's
// prose but anchor every level to plausible bounds. On any hard failure we drop
// back to the fully deterministic card so the dashboard is never misleading.
function validate(
  raw: Record<string, unknown>,
  s: Snapshot,
  scores: Scores,
  regime: Regime
): Analysis {
  const fb = fallbackAnalysis(s, scores, regime);

  // Plausible price band: nothing outside ~0.5x..2x the 52w range.
  const lo = s.levels.range_52w.low * 0.5;
  const hi = s.levels.range_52w.high * 2;
  const inBand = (n: unknown): n is number =>
    typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi;

  const biasSet = new Set(["bullish", "neutral", "bearish"]);
  const bias = biasSet.has(String(raw.bias))
    ? (raw.bias as Analysis["bias"])
    : biasFromScores(scores);

  const setupOk =
    typeof raw.setup === "string" &&
    (raw.setup === "none" || s.setup_tags.includes(raw.setup));
  const setup = setupOk ? (raw.setup as string) : fb.setup;

  const rationale =
    typeof raw.rationale === "string" && raw.rationale.trim().length > 0
      ? raw.rationale.trim().slice(0, 600)
      : fb.rationale;

  // key_levels: accept only in-band numbers, else fall back per field.
  const kl = (raw.key_levels ?? {}) as Record<string, unknown>;
  let entry_zone = fb.key_levels.entry_zone;
  if (
    Array.isArray(kl.entry_zone) &&
    kl.entry_zone.length === 2 &&
    inBand(kl.entry_zone[0]) &&
    inBand(kl.entry_zone[1])
  ) {
    entry_zone = [kl.entry_zone[0], kl.entry_zone[1]] as [number, number];
  }
  const invalidation = inBand(kl.invalidation)
    ? (kl.invalidation as number)
    : fb.key_levels.invalidation;
  const targets = Array.isArray(kl.targets)
    ? (kl.targets.filter(inBand) as number[])
    : fb.key_levels.targets;

  const isStr = (v: unknown): v is string => typeof v === "string";
  const risks: string[] = Array.isArray(raw.risks)
    ? raw.risks.filter(isStr).slice(0, 5)
    : [...fb.risks];
  const catalysts: string[] = Array.isArray(raw.catalysts)
    ? raw.catalysts.filter(isStr).slice(0, 5)
    : [];

  const confidence =
    typeof raw.confidence === "number"
      ? Math.max(0, Math.min(1, raw.confidence))
      : fb.confidence;

  // Veto rule: if an earnings gate ever fires, force a warning in.
  if (s.gates.earnings_within_hold === true) {
    risks.unshift("Earnings a tartási időtávon belül — kihagyás megfontolandó.");
  }

  return {
    symbol: s.symbol,
    bias,
    setup,
    conviction: convictionFromScore(scores.long.total),
    key_levels: { entry_zone, invalidation, targets },
    risk_reward:
      typeof raw.risk_reward === "number" && Number.isFinite(raw.risk_reward)
        ? raw.risk_reward
        : fb.risk_reward,
    rationale,
    risks: risks.length ? risks : fb.risks,
    catalysts,
    override_reason:
      typeof raw.override_reason === "string" ? raw.override_reason : null,
    confidence,
    not_advice: true,
    source: "ai",
  };
}
