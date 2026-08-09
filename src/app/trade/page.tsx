"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Regime, TradeRecord } from "@/lib/trade/types";
import BalanceView from "./balance-view";

const BUY_THRESHOLD = 70; // day-trade signal at/above this is green / highlighted

const REGIME_LABEL: Record<Regime["qqq_trend"], string> = {
  up: "Emelkedő piac",
  down: "Csökkenő piac",
  range: "Oldalazó piac",
};
const REGIME_COLOR: Record<Regime["qqq_trend"], string> = {
  up: "#16a34a",
  down: "#dc2626",
  range: "#ca8a04",
};
const BIAS_COLOR: Record<string, string> = {
  bullish: "#16a34a",
  bearish: "#dc2626",
  neutral: "#64748b",
};
const SETUP_HU: Record<string, string> = {
  pullback_to_ma: "Visszahúzás MA-ra",
  breakout: "Kitörés",
  oversold_bounce: "Túladott elpattanás",
  squeeze: "Squeeze",
  none: "Nincs tiszta setup",
};

function ago(iso?: string): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "az imént";
  if (s < 3600) return `${Math.floor(s / 60)} perce`;
  if (s < 86400) return `${Math.floor(s / 3600)} órája`;
  return `${Math.floor(s / 86400)} napja`;
}

function dtsColor(pct: number): string {
  // 0-39 red, 40-69 orange, 70+ green
  return pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
}

export default function TradePage() {
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [regime, setRegime] = useState<Regime | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [allSymbols, setAllSymbols] = useState<
    { symbol: string; name: string }[]
  >([]);
  const [suggestions, setSuggestions] = useState<TradeRecord[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestMeta, setSuggestMeta] = useState<{
    scanned: number;
    qualifying: number;
  } | null>(null);
  const [cost, setCost] = useState<{ total: number; currency: string } | null>(
    null
  );
  const [tab, setTab] = useState<"tips" | "balance">("tips");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/trade", { cache: "no-store" });
      const j = await r.json();
      setRecords(j.records ?? []);
      setWatchlist(j.watchlist ?? []);
      setRegime(j.regime ?? null);
      if (j.error) setError(String(j.error));
    } catch {
      setError("Nem sikerült betölteni a gyorsítótárat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/trade/cost", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (typeof j.total === "number") {
          setCost({ total: j.total, currency: j.currency ?? "USD" });
        }
      })
      .catch(() => {});
    fetch("/api/trade/symbols-list", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.symbols)) setAllSymbols(j.symbols);
      })
      .catch(() => {});
  }, [load]);

  const toggle = (symbol: string) =>
    setOpen((o) => ({ ...o, [symbol]: !o[symbol] }));

  const refreshOne = async (symbol: string) => {
    setBusy((b) => ({ ...b, [symbol]: true }));
    setError(null);
    try {
      const r = await fetch(`/api/trade/refresh?symbol=${symbol}`, {
        method: "POST",
      });
      const j = await r.json();
      if (j.record) {
        setRecords((prev) => [
          ...prev.filter((x) => x.symbol !== symbol),
          j.record as TradeRecord,
        ]);
        setRegime((j.record as TradeRecord).regime);
      } else {
        setError(`${symbol}: ${j.error ?? "hiba"}`);
      }
    } catch {
      setError(`${symbol}: hálózati hiba`);
    } finally {
      setBusy((b) => ({ ...b, [symbol]: false }));
    }
  };

  const refreshAll = async () => {
    setRefreshingAll(true);
    setError(null);
    try {
      const r = await fetch("/api/trade/refresh-all", { method: "POST" });
      const j = await r.json();
      if (j.records) {
        setRecords(j.records as TradeRecord[]);
        setRegime(j.regime ?? null);
        if (j.errors) {
          setError(
            "Néhány szimbólum nem frissült (rate limit / hibás ticker?): " +
              Object.keys(j.errors).join(", ")
          );
        }
      } else {
        setError(j.error ?? "Frissítési hiba.");
      }
    } catch {
      setError("Hálózati hiba a teljes frissítésnél.");
    } finally {
      setRefreshingAll(false);
    }
  };

  const doAdd = async (raw: string) => {
    const sym = raw.trim().toUpperCase();
    if (!sym) return;
    setAdding(true);
    setError(null);
    try {
      const r = await fetch("/api/trade/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
      const j = await r.json();
      if (j.ok) {
        setWatchlist((w) => (w.includes(sym) ? w : [...w, sym]));
        refreshOne(sym);
      } else {
        setError(
          j.error === "invalid_symbol" ? "Érvénytelen ticker." : String(j.error)
        );
      }
    } catch {
      setError("Nem sikerült hozzáadni a tickert.");
    } finally {
      setAdding(false);
    }
  };

  const removeTicker = async (symbol: string) => {
    setBusy((b) => ({ ...b, [symbol]: true }));
    try {
      await fetch(`/api/trade/watchlist?symbol=${symbol}`, { method: "DELETE" });
      setWatchlist((w) => w.filter((s) => s !== symbol));
      setRecords((prev) => prev.filter((x) => x.symbol !== symbol));
    } catch {
      setError(`${symbol}: törlés sikertelen`);
    } finally {
      setBusy((b) => ({ ...b, [symbol]: false }));
    }
  };

  const suggestNow = async () => {
    setSuggesting(true);
    setError(null);
    try {
      const r = await fetch("/api/trade/suggest", { method: "POST" });
      const j = await r.json();
      if (j.records) {
        setSuggestions(j.records as TradeRecord[]);
        setSuggestMeta({ scanned: j.scanned ?? 0, qualifying: j.qualifying ?? 0 });
        if (j.regime) setRegime(j.regime);
      } else {
        setError(j.error ?? "Nem sikerült a javaslat.");
      }
    } catch {
      setError("Hálózati hiba a javaslatnál.");
    } finally {
      setSuggesting(false);
    }
  };

  const addFromSuggestion = async (symbol: string) => {
    setBusy((b) => ({ ...b, [symbol]: true }));
    try {
      const r = await fetch("/api/trade/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const j = await r.json();
      if (j.ok) {
        setWatchlist((w) => (w.includes(symbol) ? w : [...w, symbol]));
        setSuggestions((s) => s.filter((x) => x.symbol !== symbol));
        refreshOne(symbol);
      } else {
        setError(String(j.error));
      }
    } catch {
      setError(`${symbol}: nem sikerült hozzáadni`);
    } finally {
      setBusy((b) => ({ ...b, [symbol]: false }));
    }
  };

  const bySymbol = new Map(records.map((r) => [r.symbol, r]));
  const items = watchlist
    .map((symbol) => ({ symbol, rec: bySymbol.get(symbol) }))
    .sort((a, b) => {
      const sa = a.rec?.analysis.day_trade_score ?? -1;
      const sb = b.rec?.analysis.day_trade_score ?? -1;
      if (sb !== sa) return sb - sa;
      return a.symbol.localeCompare(b.symbol);
    });

  const buyCount = items.filter(
    (i) => (i.rec?.analysis.day_trade_score ?? -1) >= BUY_THRESHOLD
  ).length;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#0b1120",
        color: "#e2e8f0",
        fontFamily:
          "'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,sans-serif",
        padding: "24px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              📈 Trade
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Döntéstámogató technikai áttekintés. NASDAQ · napi időtáv.
            </p>
            {cost && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                💵 Anthropic API-költség (aktuális hó):{" "}
                <b style={{ color: "#e2e8f0" }}>
                  ${cost.total.toFixed(2)} {cost.currency}
                </b>
              </p>
            )}
          </div>
        </header>

        <TabBar tab={tab} setTab={setTab} />

        {tab === "balance" && <BalanceView />}

        {tab === "tips" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 4,
              }}
            >
              <button
                onClick={suggestNow}
                disabled={suggesting}
                style={{
                  background: suggesting ? "#334155" : "#15803d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: suggesting ? "default" : "pointer",
                }}
              >
                {suggesting ? "Keresés…" : "🎯 AI napi javaslat"}
              </button>
              <button
                onClick={refreshAll}
                disabled={refreshingAll}
                style={{
                  background: refreshingAll ? "#334155" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: refreshingAll ? "default" : "pointer",
                }}
              >
                {refreshingAll ? "Frissítés…" : "Mindent frissít"}
              </button>
            </div>

        {/* Watchlist add — searchable NASDAQ combobox */}
        <div style={{ margin: "12px 0 4px" }}>
          <SymbolCombo options={allSymbols} onPick={doAdd} busy={adding} />
        </div>

        {regime && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              margin: "10px 8px 4px 0",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#111827",
              border: `1px solid ${REGIME_COLOR[regime.qqq_trend]}55`,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: REGIME_COLOR[regime.qqq_trend],
              }}
            />
            Piaci rezsim (QQQ): <b>{REGIME_LABEL[regime.qqq_trend]}</b>
            <span style={{ color: "#64748b" }}>· 50MA {regime.qqq_vs_50ma}</span>
          </div>
        )}

        <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "10px 0 4px" }}>
          A <b style={{ color: "#e2e8f0" }}>%</b> az AI 1&nbsp;napos beszállási
          jelzése minden együttállás alapján. {BUY_THRESHOLD}% felett érdemes
          figyelni — most{" "}
          <b style={{ color: buyCount > 0 ? "#16a34a" : "#94a3b8" }}>
            {buyCount}
          </b>{" "}
          papír van a küszöb felett. Kattints a sorra a részletekért.
        </p>

        <p style={{ fontSize: 11.5, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
          ⚠️ Ez nem pénzügyi tanács. Döntéstámogató eszköz — a döntés, a
          pozícióméret és a kockázatkezelés a tiéd.
        </p>

        <Legend />

        {error && (
          <div
            style={{
              background: "#7f1d1d33",
              border: "1px solid #7f1d1d",
              color: "#fca5a5",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Betöltés…</p>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "#94a3b8",
              border: "1px dashed #334155",
              borderRadius: 16,
            }}
          >
            Üres a watchlist. Adj hozzá egy tickert fent, majd frissíts.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(({ symbol, rec }) => (
              <AccordionItem
                key={symbol}
                symbol={symbol}
                rec={rec}
                open={!!open[symbol]}
                busy={!!busy[symbol]}
                onToggle={() => toggle(symbol)}
                onRefresh={() => refreshOne(symbol)}
                onRemove={() => removeTicker(symbol)}
              />
            ))}
          </div>
        )}

        {suggestMeta && (
          <section style={{ marginTop: 30 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
              🎯 AI napi javaslat
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>
              Top jelöltek a kurált NASDAQ-körből (a watchlistedet kihagyva).{" "}
              {suggestMeta.scanned} papírt néztem át,{" "}
              <b style={{ color: "#22c55e" }}>{suggestMeta.qualifying}</b> van 70%
              felett (zöld = erős jelzés).
            </p>
            {suggestions.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  color: "#94a3b8",
                  border: "1px dashed #334155",
                  borderRadius: 14,
                  fontSize: 13,
                }}
              >
                Nem sikerült papírt lekérni (rate limit?). Próbáld pár perc múlva.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {suggestions.map((rec) => (
                  <AccordionItem
                    key={`sg-${rec.symbol}`}
                    symbol={rec.symbol}
                    rec={rec}
                    open={!!open[`sg-${rec.symbol}`]}
                    busy={!!busy[rec.symbol]}
                    onToggle={() => toggle(`sg-${rec.symbol}`)}
                    onAdd={() => addFromSuggestion(rec.symbol)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
          </>
        )}
      </div>
    </main>
  );
}

function IconBtn({
  title,
  onClick,
  busy,
  children,
}: {
  title: string;
  onClick: () => void;
  busy: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!busy) onClick();
      }}
      disabled={busy}
      title={title}
      style={{
        background: "#1f2937",
        color: "#e2e8f0",
        border: "1px solid #334155",
        borderRadius: 9,
        padding: "6px 9px",
        fontSize: 12,
        cursor: busy ? "default" : "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function DayBadge({ pct }: { pct: number | null }) {
  if (pct == null) {
    return (
      <div style={{ minWidth: 62, textAlign: "right", color: "#64748b", fontSize: 12 }}>
        —
      </div>
    );
  }
  const color = dtsColor(pct);
  return (
    <div style={{ minWidth: 62, textAlign: "right", flexShrink: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>
        {pct}%
      </div>
      <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
        1 napos jelzés
      </div>
    </div>
  );
}

function AccordionItem({
  symbol,
  rec,
  open,
  busy,
  onToggle,
  onRefresh,
  onRemove,
  onAdd,
}: {
  symbol: string;
  rec: TradeRecord | undefined;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
  onRemove?: () => void;
  onAdd?: () => void;
}) {
  const pct = rec?.analysis.day_trade_score ?? null;
  const highlighted = pct != null && pct >= BUY_THRESHOLD;

  return (
    <div
      style={{
        background: "#111827",
        border: `1px solid ${highlighted ? "#22c55e66" : "#1f2937"}`,
        borderLeft: `3px solid ${highlighted ? "#22c55e" : "#1f2937"}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header row (click to expand) */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          cursor: "pointer",
        }}
      >
        <div style={{ minWidth: 62 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{symbol}</div>
          {rec && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                color: BIAS_COLOR[rec.analysis.bias],
              }}
            >
              {rec.analysis.bias}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {rec ? (
            <div style={{ fontSize: 13.5 }}>
              <b>${rec.snapshot.price.last}</b>{" "}
              <span
                style={{
                  color: rec.snapshot.price.chg_pct >= 0 ? "#4ade80" : "#f87171",
                }}
              >
                {rec.snapshot.price.chg_pct >= 0 ? "+" : ""}
                {rec.snapshot.price.chg_pct}%
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
              {busy ? "Elemzés folyamatban…" : "Még nincs elemzés — frissíts ↻"}
            </div>
          )}
        </div>

        <DayBadge pct={pct} />
        {onAdd ? (
          <IconBtn title="Watchlistre" onClick={() => onAdd()} busy={busy}>
            {busy ? "…" : "＋"}
          </IconBtn>
        ) : (
          <>
            <IconBtn title="Frissítés" onClick={() => onRefresh?.()} busy={busy}>
              {busy ? "…" : "↻"}
            </IconBtn>
            <IconBtn title="Eltávolítás" onClick={() => onRemove?.()} busy={busy}>
              ✕
            </IconBtn>
          </>
        )}
        <span
          style={{
            color: "#64748b",
            fontSize: 16,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .15s",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </div>

      {/* Body */}
      {open && rec && <CardBody rec={rec} />}
      {open && !rec && (
        <div style={{ padding: "0 14px 14px", fontSize: 12.5, color: "#94a3b8" }}>
          Nyomd meg a ↻ gombot az első elemzéshez.
        </div>
      )}
    </div>
  );
}

function CardBody({ rec }: { rec: TradeRecord }) {
  const { snapshot: s, scores, analysis: a } = rec;
  const score = scores.long.total;
  const scoreColor = score >= 70 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#64748b";
  const eDays = rec.catalysts?.earnings_in_days;
  const earningsSoon = eDays != null && eDays >= 0 && eDays <= 10;

  return (
    <div
      style={{
        borderTop: "1px solid #1f2937",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Plain-language summary */}
      {a.plain_summary && (
        <div
          style={{
            background: "#0e1a2b",
            border: "1px solid #1e3a5f",
            borderLeft: "3px solid #38bdf8",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "#e2e8f0",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "#7dd3fc",
              marginBottom: 4,
            }}
          >
            💬 Mit jelent?
          </span>
          {a.plain_summary}
        </div>
      )}

      {/* Swing score bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11.5,
            color: "#94a3b8",
            marginBottom: 4,
          }}
        >
          <span>Swing-setup pontszám (long)</span>
          <span style={{ color: scoreColor, fontWeight: 700 }}>
            {score}/100 · {a.conviction}
          </span>
        </div>
        <div
          style={{ height: 7, borderRadius: 999, background: "#1f2937", overflow: "hidden" }}
        >
          <div style={{ width: `${score}%`, height: "100%", background: scoreColor }} />
        </div>
      </div>

      {/* Setup */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(s.setup_tags.length ? s.setup_tags : ["none"]).map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11.5,
              background: "#0b1120",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "3px 9px",
              color: "#cbd5e1",
            }}
          >
            {SETUP_HU[t] ?? t}
          </span>
        ))}
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 12px",
          fontSize: 12.5,
        }}
      >
        <Metric label="RSI(14)" value={`${s.momentum.rsi14} · ${s.momentum.rsi_zone}`} />
        <Metric label="MACD" value={s.momentum.macd_state.replace("_", " ")} />
        <Metric label="MA állás" value={s.trend.stack} />
        <Metric label="Heti trend" value={s.trend.weekly_trend} />
        <Metric label="ATR" value={`${s.price.atr14} (${s.price.atr_pct}%)`} />
        <Metric label="Rel. volumen" value={`${s.volume.rel_volume}×`} />
        <Metric label="Támasz / Ellenállás" value={`${s.levels.support} / ${s.levels.resistance}`} />
        <Metric label="52h pozíció" value={`${s.levels.range_52w.pos_pct}%`} />
      </div>

      {/* Key levels */}
      <div
        style={{
          background: "#0b1120",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12.5,
          lineHeight: 1.7,
        }}
      >
        <div>
          <span style={{ color: "#94a3b8" }}>Belépő-zóna:</span>{" "}
          <b>
            {a.key_levels.entry_zone
              ? `${a.key_levels.entry_zone[0]} – ${a.key_levels.entry_zone[1]}`
              : "—"}
          </b>
        </div>
        <div>
          <span style={{ color: "#94a3b8" }}>Invalidáció (stop):</span>{" "}
          <b style={{ color: "#f87171" }}>{a.key_levels.invalidation ?? "—"}</b>
        </div>
        <div>
          <span style={{ color: "#94a3b8" }}>Célok:</span>{" "}
          <b style={{ color: "#4ade80" }}>
            {a.key_levels.targets.length ? a.key_levels.targets.join(" · ") : "—"}
          </b>
          {a.risk_reward != null && (
            <span style={{ color: "#94a3b8" }}> · R/R {a.risk_reward}</span>
          )}
        </div>
      </div>

      {/* Catalysts */}
      {rec.catalysts &&
        (rec.catalysts.next_earnings ||
          (rec.catalysts.news?.length ?? 0) > 0) && (
          <div
            style={{
              borderTop: "1px solid #1f2937",
              paddingTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {rec.catalysts.next_earnings && (
              <div
                style={{
                  fontSize: 12,
                  color: earningsSoon ? "#fca5a5" : "#94a3b8",
                  fontWeight: earningsSoon ? 700 : 400,
                }}
              >
                📅 Earnings: <b>{rec.catalysts.next_earnings}</b>
                {rec.catalysts.earnings_in_days != null &&
                  ` (${rec.catalysts.earnings_in_days} nap)`}
              </div>
            )}
            {rec.catalysts.news?.slice(0, 3).map((n, i) => (
              <a
                key={i}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                title={n.source}
                style={{
                  fontSize: 11.8,
                  color: "#7dd3fc",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                📰 {n.headline}
              </a>
            ))}
          </div>
        )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: "#475569",
        }}
      >
        <span>{a.source === "ai" ? "🤖 AI-összegzés" : "⚙️ Determinisztikus"}</span>
        <span>frissítve {ago(rec.updated_at)}</span>
      </div>
    </div>
  );
}

function SymbolCombo({
  options,
  onPick,
  busy,
}: {
  options: { symbol: string; name: string }[];
  onPick: (symbol: string) => void;
  busy: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const query = q.trim().toUpperCase();
    if (!query) return [];
    const starts: { symbol: string; name: string }[] = [];
    const contains: { symbol: string; name: string }[] = [];
    for (const o of options) {
      if (o.symbol.startsWith(query)) starts.push(o);
      else if (
        o.symbol.includes(query) ||
        o.name.toUpperCase().includes(query)
      )
        contains.push(o);
      if (starts.length >= 20) break;
    }
    return [...starts, ...contains].slice(0, 20);
  }, [q, options]);

  const pick = (symbol: string) => {
    onPick(symbol);
    setQ("");
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "min(380px, 100%)" }}>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) pick(q.trim().toUpperCase());
        }}
        placeholder={
          options.length
            ? "Keresés: ticker vagy cégnév…"
            : "Ticker (pl. GOOGL) — Enter"
        }
        disabled={busy}
        style={{
          background: "#111827",
          border: "1px solid #334155",
          borderRadius: 10,
          color: "#e2e8f0",
          padding: "10px 12px",
          fontSize: 14,
          width: "100%",
        }}
      />
      {open && matches.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 30,
            background: "#0b1120",
            border: "1px solid #334155",
            borderRadius: 10,
            marginTop: 4,
            maxHeight: 280,
            overflowY: "auto",
            boxShadow: "0 12px 32px -12px rgba(0,0,0,.6)",
          }}
        >
          {matches.map((o) => (
            <button
              key={o.symbol}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o.symbol);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid #1f2937",
                color: "#e2e8f0",
                padding: "9px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <b>{o.symbol}</b>
              {o.name && (
                <span style={{ color: "#94a3b8" }}> — {o.name}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBar({
  tab,
  setTab,
}: {
  tab: "tips" | "balance";
  setTab: (t: "tips" | "balance") => void;
}) {
  const Tab = ({ id, label }: { id: "tips" | "balance"; label: string }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: tab === id ? "#e2e8f0" : "#64748b",
        fontSize: 15,
        fontWeight: 700,
        padding: "8px 2px",
        borderBottom: `2px solid ${tab === id ? "#2563eb" : "transparent"}`,
      }}
    >
      {label}
    </button>
  );
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        borderBottom: "1px solid #1f2937",
        margin: "6px 0 16px",
      }}
    >
      <Tab id="tips" label="Trade tips" />
      <Tab id="balance" label="Trade balance" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "#64748b" }}>{label}: </span>
      <span style={{ color: "#e2e8f0" }}>{value}</span>
    </div>
  );
}

function LRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 8, lineHeight: 1.5 }}>
      <b style={{ color: "#e2e8f0" }}>{term}</b>{" "}
      <span style={{ color: "#94a3b8" }}>— {children}</span>
    </div>
  );
}

function Legend() {
  return (
    <details
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: "10px 14px",
        margin: "0 0 16px",
        fontSize: 12.5,
      }}
    >
      <summary style={{ cursor: "pointer", fontWeight: 700, color: "#cbd5e1" }}>
        ⓘ Mit jelent? — jelmagyarázat
      </summary>
      <div style={{ marginTop: 12 }}>
        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "6px 0" }}>
          Soron (összecsukva)
        </div>
        <LRow term="1 napos jelzés (%)">
          az AI 0–100%-os jelzése: minden együttállás alapján mennyire kedvező
          MOST egy 1 napos long beszállás. Sávok:{" "}
          <b style={{ color: "#ef4444" }}>0–40 piros</b> (kerülendő),{" "}
          <b style={{ color: "#f59e0b" }}>40–70 narancs</b> (óvatos),{" "}
          <b style={{ color: "#22c55e" }}>70+ zöld</b> (erős jelzés). Rövid távú
          — nem a swing-score. Napi adatból számol, így heurisztika: valódi
          intraday day-tradinghez élő adat kellene.
        </LRow>
        <LRow term="Bias (bullish/neutral/bearish)">
          az összesített irány a hosszabb képre.
        </LRow>

        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "12px 0 6px" }}>
          Lenyitva — pontszám &amp; indikátorok
        </div>
        <LRow term="Swing-setup pontszám (0–100)">
          több napos long beszállás minősége (trend + momentum + szint/R-R +
          volumen + minőség), a piaci rezsim kapuzza.
        </LRow>
        <LRow term="RSI(14)">
          momentum 0–100. &lt;30 túladott, &gt;70 túlvett; 55–70 „strong”.
        </LRow>
        <LRow term="MACD">trend-momentum („bullish rising” = erősödő).</LRow>
        <LRow term="MA állás">
          20/50/200 sorrend. „20&gt;50&gt;200” = tiszta emelkedő; „mixed” =
          óvatosság.
        </LRow>
        <LRow term="Heti trend">a magasabb időtáv iránya.</LRow>
        <LRow term="ATR (%)">
          napi mozgásterjedelem = volatilitás; magas → tág stop, kirázás-veszély.
        </LRow>
        <LRow term="Rel. volumen">mai forgalom a 20-napos átlaghoz képest.</LRow>
        <LRow term="Támasz / Ellenállás">a legutóbbi ~20 nap alja/teteje.</LRow>
        <LRow term="52h pozíció">hol áll az 52-hetes tartományban.</LRow>

        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "12px 0 6px" }}>
          Lenyitva — szintek &amp; szöveg
        </div>
        <LRow term="Belépő-zóna / Stop / Célok · R/R">
          a beszállás terve és a kockázat/hozam arány (≥2 vonzó).
        </LRow>
        <LRow term="💬 Mit jelent?">
          közérthető összegzés: mit jelent a kép és mit figyelj.
        </LRow>
        <LRow term="📅 Earnings / 📰 hírek">
          gyorsjelentés dátuma (≤10 nap = gap-kockázat) és friss hírek.
        </LRow>
        <LRow term="🤖 / ⚙️">Claude-összegzés, vagy determinisztikus tartalék.</LRow>

        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid #1f2937",
            color: "#64748b",
            fontSize: 11.5,
          }}
        >
          A számok a chart adataiból, determinisztikusan számolódnak; az AI ezt
          fordítja emberi nyelvre és adja a %-os jelzést. Döntéstámogatás, nem
          pénzügyi tanács.
        </div>
      </div>
    </details>
  );
}
