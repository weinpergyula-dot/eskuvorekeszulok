"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Regime, TradeRecord } from "@/lib/trade/types";

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

export default function TradePage() {
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [regime, setRegime] = useState<Regime | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState("");
  const [adding, setAdding] = useState(false);

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
  }, [load]);

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

  const addTicker = async () => {
    const sym = newTicker.trim().toUpperCase();
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
        setNewTicker("");
        refreshOne(sym); // fetch its first analysis
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

  // One entry per watchlist symbol; attach its record if we have one.
  const bySymbol = new Map(records.map((r) => [r.symbol, r]));
  const items = watchlist
    .map((symbol) => ({ symbol, rec: bySymbol.get(symbol) }))
    .sort((a, b) => {
      const sa = a.rec ? a.rec.scores.long.total : -1;
      const sb = b.rec ? b.rec.scores.long.total : -1;
      if (sb !== sa) return sb - sa;
      return a.symbol.localeCompare(b.symbol);
    });

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
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
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
              📈 Trade — swing dashboard
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Döntéstámogató technikai áttekintés. NASDAQ · napi időtáv.
            </p>
          </div>
          <button
            onClick={refreshAll}
            disabled={refreshingAll}
            style={{
              background: refreshingAll ? "#334155" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: refreshingAll ? "default" : "pointer",
            }}
          >
            {refreshingAll ? "Frissítés folyamatban…" : "Mindent frissít"}
          </button>
        </header>

        {/* Watchlist add */}
        <div style={{ display: "flex", gap: 8, margin: "12px 0 4px" }}>
          <input
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && addTicker()}
            placeholder="Ticker (pl. GOOGL)"
            maxLength={6}
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 10,
              color: "#e2e8f0",
              padding: "10px 12px",
              fontSize: 14,
              width: 200,
              textTransform: "uppercase",
            }}
          />
          <button
            onClick={addTicker}
            disabled={adding}
            style={{
              background: "#1f2937",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: adding ? "default" : "pointer",
            }}
          >
            {adding ? "…" : "+ Hozzáad"}
          </button>
        </div>

        {regime && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              margin: "10px 0 4px",
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

        <p
          style={{
            fontSize: 11.5,
            color: "#64748b",
            margin: "8px 0 18px",
            lineHeight: 1.5,
          }}
        >
          ⚠️ Ez nem pénzügyi tanács. Döntéstámogató eszköz, technikai adatok
          összegzése — a döntés, a pozícióméret és a kockázatkezelés a tiéd.
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {items.map(({ symbol, rec }) =>
              rec ? (
                <Card
                  key={symbol}
                  rec={rec}
                  busy={!!busy[symbol]}
                  onRefresh={() => refreshOne(symbol)}
                  onRemove={() => removeTicker(symbol)}
                />
              ) : (
                <PlaceholderCard
                  key={symbol}
                  symbol={symbol}
                  busy={!!busy[symbol]}
                  onRefresh={() => refreshOne(symbol)}
                  onRemove={() => removeTicker(symbol)}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function RemoveBtn({ onRemove, busy }: { onRemove: () => void; busy: boolean }) {
  return (
    <button
      onClick={onRemove}
      disabled={busy}
      title="Eltávolítás a watchlistről"
      style={{
        background: "transparent",
        color: "#64748b",
        border: "1px solid #334155",
        borderRadius: 9,
        padding: "6px 9px",
        fontSize: 12,
        cursor: busy ? "default" : "pointer",
      }}
    >
      ✕
    </button>
  );
}

function RefreshBtn({ onRefresh, busy }: { onRefresh: () => void; busy: boolean }) {
  return (
    <button
      onClick={onRefresh}
      disabled={busy}
      title="Frissítés"
      style={{
        background: "#1f2937",
        color: "#e2e8f0",
        border: "1px solid #334155",
        borderRadius: 9,
        padding: "6px 10px",
        fontSize: 12,
        cursor: busy ? "default" : "pointer",
      }}
    >
      {busy ? "…" : "↻"}
    </button>
  );
}

function PlaceholderCard({
  symbol,
  busy,
  onRefresh,
  onRemove,
}: {
  symbol: string;
  busy: boolean;
  onRefresh: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px dashed #334155",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 140,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 19, fontWeight: 800, flex: 1 }}>{symbol}</span>
        <RefreshBtn onRefresh={onRefresh} busy={busy} />
        <RemoveBtn onRemove={onRemove} busy={busy} />
      </div>
      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
        {busy ? "Elemzés folyamatban…" : "Még nincs elemzés — nyomd meg a ↻-t."}
      </p>
    </div>
  );
}

function Card({
  rec,
  busy,
  onRefresh,
  onRemove,
}: {
  rec: TradeRecord;
  busy: boolean;
  onRefresh: () => void;
  onRemove: () => void;
}) {
  const { snapshot: s, scores, analysis: a } = rec;
  const up = s.price.chg_pct >= 0;
  const score = scores.long.total;
  const scoreColor = score >= 70 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#64748b";
  const eDays = rec.catalysts?.earnings_in_days;
  const earningsSoon = eDays != null && eDays >= 0 && eDays <= 10;

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>{s.symbol}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                color: BIAS_COLOR[a.bias],
                border: `1px solid ${BIAS_COLOR[a.bias]}66`,
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              {a.bias}
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 14 }}>
            <b>${s.price.last}</b>{" "}
            <span style={{ color: up ? "#4ade80" : "#f87171" }}>
              {up ? "+" : ""}
              {s.price.chg_pct}%
            </span>
          </div>
        </div>
        <RefreshBtn onRefresh={onRefresh} busy={busy} />
        <RemoveBtn onRemove={onRemove} busy={busy} />
      </div>

      {/* Score bar */}
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
          style={{
            height: 7,
            borderRadius: 999,
            background: "#1f2937",
            overflow: "hidden",
          }}
        >
          <div
            style={{ width: `${score}%`, height: "100%", background: scoreColor }}
          />
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

      {/* Technical rationale */}
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#94a3b8" }}>
        {a.rationale}
      </div>
      {a.risks.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#fca5a5" }}>
          {a.risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}

      {/* Catalysts: earnings + headlines */}
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
          marginTop: 2,
        }}
      >
        <span>{a.source === "ai" ? "🤖 AI-összegzés" : "⚙️ Determinisztikus"}</span>
        <span>frissítve {ago(rec.updated_at)}</span>
      </div>
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
        margin: "0 0 18px",
        fontSize: 12.5,
      }}
    >
      <summary style={{ cursor: "pointer", fontWeight: 700, color: "#cbd5e1" }}>
        ⓘ Mit jelent? — jelmagyarázat
      </summary>
      <div style={{ marginTop: 12 }}>
        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "6px 0" }}>
          Fejléc &amp; pontszám
        </div>
        <LRow term="Bias (bullish/neutral/bearish)">
          az összesített irány: a long és short pontszám különbségéből.
        </LRow>
        <LRow term="Swing-setup pontszám (0–100) + low/medium/high">
          mennyire „tiszta” most egy több napos long beszállás. Öt részből:
          trend + momentum + szint/R-R + volumen + minőség; a piaci rezsim
          kapuzza. A low/medium/high a meggyőződés.
        </LRow>
        <LRow term="Setup tag (pl. Kitörés, Visszahúzás MA-ra)">
          a felismert mintázat a szabály-motor szerint.
        </LRow>

        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "12px 0 6px" }}>
          Indikátorok
        </div>
        <LRow term="RSI(14)">
          momentum-mérő 0–100. &lt;30 túladott, &gt;70 túlvett; 55–70 „strong” =
          egészséges felfelé lendület.
        </LRow>
        <LRow term="MACD">
          trend-momentum. „bullish rising” = pozitív és erősödő lendület.
        </LRow>
        <LRow term="MA állás">
          a 20/50/200 napos mozgóátlagok sorrendje. „20&gt;50&gt;200” = tiszta
          emelkedő trend; „mixed” = nem rendezett (óvatosság).
        </LRow>
        <LRow term="Heti trend">
          a magasabb (heti) időtáv iránya — a legjobb setupok itt is egyeznek.
        </LRow>
        <LRow term="ATR (és %)">
          átlagos napi mozgásterjedelem = volatilitás. Magas % → tág stop kell,
          nagyobb kirázás-veszély.
        </LRow>
        <LRow term="Rel. volumen">
          a mai forgalom a 20-napos átlaghoz képest. &gt;1 = átlag feletti
          érdeklődés (kitörésnél megerősítés).
        </LRow>
        <LRow term="Támasz / Ellenállás">
          a legutóbbi ~20 nap alja/teteje. Az ellenállás fölé zárás = kitörés.
        </LRow>
        <LRow term="52h pozíció">
          hol áll az 52-hetes tartományban (0% = éves mély, 100% = éves csúcs).
        </LRow>

        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "12px 0 6px" }}>
          Kulcs-szintek
        </div>
        <LRow term="Belépő-zóna">hol lenne értelme beszállni.</LRow>
        <LRow term="Invalidáció (stop)">
          ha ide esik az ár, a tézis megdőlt — itt a védelmi stop.
        </LRow>
        <LRow term="Célok · R/R">
          a cél(ok), és a kockázat/hozam arány. R/R 2 = 2 egység nyereség 1
          egység kockázatra; általában a ≥2 vonzó.
        </LRow>

        <div style={{ color: "#7dd3fc", fontWeight: 800, margin: "12px 0 6px" }}>
          Szöveg
        </div>
        <LRow term="💬 Mit jelent?">
          közérthető összegzés: mit jelent a kép és mit érdemes figyelni.
        </LRow>
        <LRow term="Technikai indoklás">a szakmai, indikátoros magyarázat.</LRow>
        <LRow term="📅 Earnings / 📰 hírek">
          gyorsjelentés dátuma (közeli earnings = gap-kockázat) és friss hírek.
        </LRow>
        <LRow term="🤖 AI-összegzés / ⚙️ Determinisztikus">
          a szöveget a Claude írta, vagy (AI nélkül) a determinisztikus tartalék.
        </LRow>

        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid #1f2937",
            color: "#64748b",
            fontSize: 11.5,
          }}
        >
          A számok determinisztikusan, a chart adataiból számolódnak; az AI ezt
          fordítja emberi nyelvre és rangsorol. Ez döntéstámogatás, nem pénzügyi
          tanács.
        </div>
      </div>
    </details>
  );
}
