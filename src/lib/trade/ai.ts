import type { Analysis, Catalysts, Regime, Scores, Snapshot } from "./types";
import { biasFromScores, convictionFromScore, fallbackAnalysis } from "./analysis";

const SYSTEM = `Te egy swing-kereskedési DÖNTÉSTÁMOGATÓ asszisztens vagy, NEM pénzügyi tanácsadó.
Kizárólag a felhasználói üzenetben kapott JSON adatból dolgozol.

SZIGORÚ SZABÁLYOK:
- NE találj ki árat, szintet, indikátor-értéket, hírt vagy earnings-dátumot. Minden szint a bemeneti "levels"/"price"/"trend" mezőkből származzon.
- NE jósolj árfolyamot. Forgatókönyvet és a megadott szintekhez kötött kockázatot írj le.
- A "scores.total" a determinisztikus rangsor — NE írd felül. Ha az elemzésed eltér tőle, azt az "override_reason"-ben indokold, és csak a "gates" alapján vétózhatsz.
- A "confidence" a score-ok konzisztenciáját tükrözze, ne az optimizmusodat.
- NEM mondod meg, mekkora pozíciót vegyen fel, és nem adsz vételi/eladási utasítást.
- A "catalysts" mezőbe a bemeneti "catalysts.next_earnings" dátumot és a "catalysts.headlines" hírekből levonható lényeget írd — NE találj ki hírt vagy dátumot. Ha nincs hír/earnings a bemenetben, üres tömb.
- Ha "gates.earnings_within_hold" true, tedd be a "risks"-be az earnings gap-kockázatot.
- A "rationale" a szakmai indoklás (max ~3 mondat, indikátorokkal).
- A "plain_summary" KÖZÉRTHETŐ, szakszavak nélküli (2-3 mondat): mit jelent ez emberi nyelven, és mit érdemes FIGYELNI (mi erősítené meg, mi buktatná a setupot). NE adj vételi/eladási utasítást és NE mondj pozícióméretet — csak leírod a képet és a figyelendőket.
- Magyarul írj.

Válaszod KIZÁRÓLAG egyetlen JSON objektum legyen, PONTOSAN ezekkel a kulcsokkal:
{
  "bias": "bullish" | "neutral" | "bearish",
  "setup": string (a bemeneti setup_tags egyike, vagy "none"),
  "conviction": "low" | "medium" | "high",
  "key_levels": { "entry_zone": [number, number] | null, "invalidation": number | null, "targets": number[] },
  "risk_reward": number | null,
  "rationale": string,
  "plain_summary": string,
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
  catalysts: {
    next_earnings: string | null;
    earnings_in_days: number | null;
    headlines: string[];
  };
}

// Pull the JSON object out of the model's reply (handles ```json fences or
// stray prose around it).
function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end !== -1 ? body.slice(start, end + 1) : body;
}

// Diagnostic: run the REAL system prompt + a representative input end-to-end and
// report the raw reply + whether it parses. Used by /api/trade/diag?test=full.
export async function debugGenerate() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return { error: "no key" };
  const sampleInput = {
    symbol: "TEST",
    as_of: "2026-08-08",
    market_regime: { qqq_trend: "up", qqq_vs_50ma: "+1%" },
    price: { last: 100, chg_pct: 1, atr14: 2, atr_pct: 2 },
    trend: {
      ma20: 99, ma50: 95, ma200: 90, stack: "20>50>200",
      regime: "up", weekly_trend: "up", ma20_slope: "up",
    },
    momentum: { rsi14: 55, rsi_zone: "neutral", macd_hist: 0.2, macd_state: "bullish_rising" },
    volatility: { bb_bandwidth_pctile: 30, squeeze: false },
    volume: { rel_volume: 1.1 },
    levels: {
      support: 95, resistance: 110, dist_to_support_atr: 2.5, dist_to_resistance_atr: 5,
      range_52w: { high: 120, low: 70, pos_pct: 60 },
    },
    setup_tags: ["pullback_to_ma"],
    scores: { long: { total: 70, trend: 25, momentum: 18, level_rr: 18, volume: 6, quality: 3 }, short: { total: 20 } },
    gates: { earnings_within_hold: null, extreme_volatility: false },
    catalysts: { next_earnings: null, earnings_in_days: null, headlines: [] },
  };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 4096,
        system: SYSTEM,
        messages: [{ role: "user", content: JSON.stringify(sampleInput) }],
      }),
    });
    const status = res.status;
    if (!res.ok) return { status, ok: false, body: (await res.text()).slice(0, 800) };
    const json = (await res.json()) as {
      stop_reason?: string;
      content?: Array<{ type: string; text?: string }>;
    };
    const content =
      json.content?.find((c) => c.type === "text")?.text ??
      json.content?.[0]?.text ??
      "";
    let parseError: string | null = null;
    let parsedKeys: string[] | null = null;
    try {
      parsedKeys = Object.keys(JSON.parse(extractJson(content)));
    } catch (e) {
      parseError = String(e);
    }
    return {
      status,
      ok: true,
      stop_reason: json.stop_reason,
      content_types: json.content?.map((c) => c.type),
      rawText: content.slice(0, 800),
      parseError,
      parsedKeys,
    };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function generateAnalysis(
  s: Snapshot,
  scores: Scores,
  regime: Regime,
  catalysts: Catalysts
): Promise<Analysis> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    console.error("[trade/ai] nincs ANTHROPIC_API_KEY a környezetben");
    return fallbackAnalysis(s, scores, regime, catalysts);
  }

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
    catalysts: {
      next_earnings: catalysts.next_earnings,
      earnings_in_days: catalysts.earnings_in_days,
      headlines: catalysts.news.map((n) => n.headline),
    },
  };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 4096,
        system: SYSTEM,
        messages: [{ role: "user", content: JSON.stringify(input) }],
      }),
    });

    if (!res.ok) {
      console.error(
        "[trade/ai] Anthropic hiba",
        res.status,
        (await res.text()).slice(0, 400)
      );
      return fallbackAnalysis(s, scores, regime, catalysts);
    }
    const json = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const content =
      json.content?.find((c) => c.type === "text")?.text ??
      json.content?.[0]?.text;
    if (!content) return fallbackAnalysis(s, scores, regime, catalysts);

    const parsed = JSON.parse(extractJson(content)) as Record<string, unknown>;
    return validate(parsed, s, scores, regime, catalysts);
  } catch (e) {
    console.error("[trade/ai] kivétel", e);
    return fallbackAnalysis(s, scores, regime, catalysts);
  }
}

// Deterministic guard: reject hallucinated numbers/enums, then keep the AI's
// prose but anchor every level to plausible bounds. On any hard failure we drop
// back to the fully deterministic card so the dashboard is never misleading.
function validate(
  raw: Record<string, unknown>,
  s: Snapshot,
  scores: Scores,
  regime: Regime,
  cat: Catalysts
): Analysis {
  const fb = fallbackAnalysis(s, scores, regime, cat);

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

  const plain_summary =
    typeof raw.plain_summary === "string" && raw.plain_summary.trim().length > 0
      ? raw.plain_summary.trim().slice(0, 600)
      : fb.plain_summary;

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
  // Ensure the real earnings date is always surfaced, even if the model omits it.
  if (cat.next_earnings && !catalysts.some((c) => /earnings/i.test(c))) {
    const inDays =
      cat.earnings_in_days != null ? ` (${cat.earnings_in_days} nap)` : "";
    catalysts.unshift(`Earnings: ${cat.next_earnings}${inDays}`);
  }

  const confidence =
    typeof raw.confidence === "number"
      ? Math.max(0, Math.min(1, raw.confidence))
      : fb.confidence;

  // Veto rule: if an earnings gate fires and the model didn't already flag it,
  // force a single warning in (avoids a duplicate earnings bullet).
  if (
    s.gates.earnings_within_hold === true &&
    !risks.some((r) => /earnings/i.test(r))
  ) {
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
    plain_summary,
    risks: risks.length ? risks : fb.risks,
    catalysts,
    override_reason:
      typeof raw.override_reason === "string" ? raw.override_reason : null,
    confidence,
    not_advice: true,
    source: "ai",
  };
}
