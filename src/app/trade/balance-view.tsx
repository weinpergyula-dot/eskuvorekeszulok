"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

interface Position {
  id: string;
  symbol: string;
  invested: number;
  buy_price: number;
  status: "open" | "closed";
  exit_amount: number | null;
  closed_at: string | null;
  created_at: string;
}

const money = (n: number) =>
  (n < 0 ? "-" : "") +
  "$" +
  Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const plColor = (n: number) =>
  n > 0 ? "#22c55e" : n < 0 ? "#ef4444" : "#94a3b8";
const sign = (n: number) => (n >= 0 ? "+" : "");

export default function BalanceView() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // per-symbol new-position form + per-position exit input
  const [form, setForm] = useState<
    Record<string, { invested: string; price: string }>
  >({});
  const [exit, setExit] = useState<Record<string, string>>({});
  const [closing, setClosing] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/trade/positions", { cache: "no-store" });
      const j = await r.json();
      setPositions(j.positions ?? []);
      setSymbols(j.symbols ?? []);
      setPrices(j.prices ?? {});
      if (j.error) setError(String(j.error));
    } catch {
      setError("Nem sikerült betölteni a pozíciókat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPos = async (symbol: string) => {
    const f = form[symbol] || { invested: "", price: "" };
    const invested = Number(f.invested);
    const buy_price = Number(f.price);
    if (!(invested > 0) || !(buy_price > 0)) {
      setError("Adj meg pozitív befektetett összeget és vételi árat.");
      return;
    }
    setBusy((b) => ({ ...b, [`new-${symbol}`]: true }));
    setError(null);
    try {
      const r = await fetch("/api/trade/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, invested, buy_price }),
      });
      const j = await r.json();
      if (j.position) {
        setPositions((p) => [j.position as Position, ...p]);
        setForm((fm) => ({ ...fm, [symbol]: { invested: "", price: "" } }));
      } else {
        setError(String(j.error));
      }
    } catch {
      setError("Nem sikerült menteni a pozíciót.");
    } finally {
      setBusy((b) => ({ ...b, [`new-${symbol}`]: false }));
    }
  };

  const closePos = async (id: string) => {
    const amt = Number(exit[id]);
    if (!(amt >= 0)) {
      setError("Adj meg egy kivett összeget.");
      return;
    }
    setBusy((b) => ({ ...b, [id]: true }));
    setError(null);
    try {
      const r = await fetch(`/api/trade/positions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exit_amount: amt }),
      });
      const j = await r.json();
      if (j.position) {
        setPositions((p) => p.map((x) => (x.id === id ? (j.position as Position) : x)));
        setClosing((c) => ({ ...c, [id]: false }));
      } else {
        setError(String(j.error));
      }
    } catch {
      setError("Nem sikerült lezárni a pozíciót.");
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const deletePos = async (id: string) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await fetch(`/api/trade/positions/${id}`, { method: "DELETE" });
      setPositions((p) => p.filter((x) => x.id !== id));
    } catch {
      setError("Nem sikerült törölni.");
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  // --- summaries ---
  const { realized, openInvested, unrealized, chart } = useMemo(() => {
    const closed = positions.filter((p) => p.status === "closed");
    const open = positions.filter((p) => p.status === "open");
    const realized = closed.reduce(
      (s, p) => s + ((p.exit_amount ?? 0) - p.invested),
      0
    );
    const openInvested = open.reduce((s, p) => s + p.invested, 0);
    const unrealized = open.reduce((s, p) => {
      const price = prices[p.symbol];
      if (!price) return s;
      const shares = p.invested / p.buy_price;
      return s + (shares * price - p.invested);
    }, 0);

    const byDay: Record<string, number> = {};
    for (const p of closed) {
      if (!p.closed_at) continue;
      const day = p.closed_at.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + ((p.exit_amount ?? 0) - p.invested);
    }
    const chart = Object.keys(byDay)
      .sort()
      .map((day) => ({ day, pl: byDay[day] }));
    return { realized, openInvested, unrealized, chart };
  }, [positions, prices]);

  // symbols with positions first, then the rest
  const withPos = new Set(positions.map((p) => p.symbol));
  const orderedSymbols = [...symbols].sort((a, b) => {
    const pa = withPos.has(a) ? 0 : 1;
    const pb = withPos.has(b) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });

  return (
    <div>
      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <SummaryCard label="Realizált P/L" value={money(realized)} color={plColor(realized)} />
        <SummaryCard label="Nyitott befektetés" value={money(openInvested)} color="#e2e8f0" />
        <SummaryCard
          label="Nyitott P/L (becsült)"
          value={`${sign(unrealized)}${money(unrealized)}`}
          color={plColor(unrealized)}
        />
      </div>

      {/* Daily chart */}
      <DailyChart data={chart} />

      {error && (
        <div
          style={{
            background: "#7f1d1d33",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            margin: "12px 0",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Betöltés…</p>
      ) : orderedSymbols.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#94a3b8",
            border: "1px dashed #334155",
            borderRadius: 14,
          }}
        >
          Még nincs egy részvény sem. Adj hozzá a Trade tips fülön, vagy kérj AI
          javaslatot — utána itt tudsz rájuk pozíciót rögzíteni.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orderedSymbols.map((symbol) => {
            const price = prices[symbol];
            const symPositions = positions.filter((p) => p.symbol === symbol);
            const f = form[symbol] || { invested: "", price: "" };
            return (
              <div
                key={symbol}
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{symbol}</span>
                  {price != null && (
                    <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                      aktuális ár: <b style={{ color: "#e2e8f0" }}>${price}</b>
                    </span>
                  )}
                </div>

                {/* Positions */}
                {symPositions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                    {symPositions.map((p) => (
                      <PositionRow
                        key={p.id}
                        p={p}
                        price={price}
                        busy={!!busy[p.id]}
                        closing={!!closing[p.id]}
                        exitVal={exit[p.id] ?? ""}
                        onStartClose={() => {
                          const shares = p.invested / p.buy_price;
                          const prefill = price ? (shares * price).toFixed(2) : "";
                          setExit((e) => ({ ...e, [p.id]: prefill }));
                          setClosing((c) => ({ ...c, [p.id]: true }));
                        }}
                        onExitChange={(v) => setExit((e) => ({ ...e, [p.id]: v }))}
                        onConfirmClose={() => closePos(p.id)}
                        onCancelClose={() => setClosing((c) => ({ ...c, [p.id]: false }))}
                        onDelete={() => deletePos(p.id)}
                      />
                    ))}
                  </div>
                )}

                {/* New position form */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <NumInput
                    placeholder="Befektetett $"
                    value={f.invested}
                    onChange={(v) =>
                      setForm((fm) => ({ ...fm, [symbol]: { ...f, invested: v } }))
                    }
                  />
                  <NumInput
                    placeholder="Vételi ár $"
                    value={f.price}
                    onChange={(v) =>
                      setForm((fm) => ({ ...fm, [symbol]: { ...f, price: v } }))
                    }
                  />
                  <button
                    onClick={() => createPos(symbol)}
                    disabled={!!busy[`new-${symbol}`]}
                    style={{
                      background: "#15803d",
                      color: "#fff",
                      border: "none",
                      borderRadius: 9,
                      padding: "9px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {busy[`new-${symbol}`] ? "…" : "Mentés"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function PositionRow({
  p,
  price,
  busy,
  closing,
  exitVal,
  onStartClose,
  onExitChange,
  onConfirmClose,
  onCancelClose,
  onDelete,
}: {
  p: Position;
  price: number | undefined;
  busy: boolean;
  closing: boolean;
  exitVal: string;
  onStartClose: () => void;
  onExitChange: (v: string) => void;
  onConfirmClose: () => void;
  onCancelClose: () => void;
  onDelete: () => void;
}) {
  const shares = p.invested / p.buy_price;
  const closed = p.status === "closed";
  const pl = closed
    ? (p.exit_amount ?? 0) - p.invested
    : price
      ? shares * price - p.invested
      : null;

  return (
    <div
      style={{
        background: "#0b1120",
        border: "1px solid #1f2937",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 12.5,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px" }}>
        <span style={{ color: "#94a3b8" }}>
          Befektetve: <b style={{ color: "#e2e8f0" }}>{money(p.invested)}</b>
        </span>
        <span style={{ color: "#94a3b8" }}>
          Vételi ár: <b style={{ color: "#e2e8f0" }}>${p.buy_price}</b>
        </span>
        <span style={{ color: "#94a3b8" }}>
          Db: <b style={{ color: "#e2e8f0" }}>{shares.toFixed(3)}</b>
        </span>
        {closed ? (
          <span style={{ color: "#94a3b8" }}>
            Kivéve: <b style={{ color: "#e2e8f0" }}>{money(p.exit_amount ?? 0)}</b>
          </span>
        ) : (
          price != null && (
            <span style={{ color: "#94a3b8" }}>
              Jelenlegi érték:{" "}
              <b style={{ color: "#e2e8f0" }}>{money(shares * price)}</b>
            </span>
          )
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 8,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13 }}>
          {pl != null ? (
            <>
              <span style={{ color: "#94a3b8" }}>
                {closed ? "Realizált P/L: " : "Becsült P/L: "}
              </span>
              <b style={{ color: plColor(pl) }}>
                {sign(pl)}
                {money(pl)}
              </b>
            </>
          ) : (
            <span style={{ color: "#64748b" }}>nincs aktuális ár</span>
          )}
          <span
            style={{
              marginLeft: 8,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              color: closed ? "#64748b" : "#22c55e",
            }}
          >
            {closed ? "lezárt" : "nyitott"}
          </span>
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          {!closed && !closing && (
            <button onClick={onStartClose} disabled={busy} style={btn("#2563eb")}>
              Kivétel
            </button>
          )}
          <button onClick={onDelete} disabled={busy} style={btn("#334155")}>
            🗑
          </button>
        </div>
      </div>

      {/* Close form */}
      {!closed && closing && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
          <NumInput
            placeholder="Kivett összeg $"
            value={exitVal}
            onChange={onExitChange}
          />
          <button onClick={onConfirmClose} disabled={busy} style={btn("#15803d")}>
            {busy ? "…" : "Lezár"}
          </button>
          <button onClick={onCancelClose} disabled={busy} style={btn("#334155")}>
            Mégse
          </button>
        </div>
      )}
    </div>
  );
}

function btn(bg: string): CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function NumInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 8,
        color: "#e2e8f0",
        padding: "8px 10px",
        fontSize: 13,
        width: 130,
      }}
    />
  );
}

function DailyChart({ data }: { data: { day: string; pl: number }[] }) {
  if (data.length === 0) {
    return (
      <div
        style={{
          border: "1px solid #1f2937",
          borderRadius: 12,
          padding: "16px",
          color: "#64748b",
          fontSize: 12.5,
          marginBottom: 16,
        }}
      >
        📊 Napi P/L — még nincs lezárt pozíció. Zárj le egy pozíciót (Kivétel), és
        itt megjelenik a napi (hozzávetőleges) profit/veszteség.
      </div>
    );
  }
  const max = Math.max(...data.map((d) => Math.abs(d.pl)), 1);
  const barW = 34;
  const gap = 10;
  const h = 120;
  const mid = h / 2;
  const width = data.length * (barW + gap) + gap;

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 16,
        overflowX: "auto",
      }}
    >
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
        📊 Napi P/L (lezárt pozíciók, hozzávetőleges)
      </div>
      <svg width={width} height={h + 24} style={{ display: "block" }}>
        <line x1={0} y1={mid} x2={width} y2={mid} stroke="#334155" strokeWidth={1} />
        {data.map((d, i) => {
          const x = gap + i * (barW + gap);
          const barH = (Math.abs(d.pl) / max) * (mid - 8);
          const pos = d.pl >= 0;
          const y = pos ? mid - barH : mid;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={3}
                fill={pos ? "#22c55e" : "#ef4444"}
              />
              <text
                x={x + barW / 2}
                y={h + 16}
                textAnchor="middle"
                fontSize={9}
                fill="#64748b"
              >
                {d.day.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
