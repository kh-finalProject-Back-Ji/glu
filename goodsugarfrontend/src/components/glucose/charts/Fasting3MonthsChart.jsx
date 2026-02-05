// src/components/glucose/charts/Fasting3MonthsChart.jsx
import { useMemo } from "react";

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toISO(d) {
  return String(d?.measureDate ?? "");
}

export default function Fasting3MonthsChart({ days = [] }) {
  const points = useMemo(() => {
    // 날짜순 정렬
    const sorted = [...(days || [])].sort((a, b) => toISO(a).localeCompare(toISO(b)));

    // 공복 값 있는 데이터만
    const list = sorted
      .map((d) => {
        const v = toNum(d.fastingValue ?? d.fastingAvg);
        return { xKey: toISO(d), v };
      })
      .filter((p) => p.xKey && p.v !== null);

    return list;
  }, [days]);

  if (!points || points.length === 0) {
    return <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.55)" }}>공복 혈당 데이터가 없어요.</div>;
  }

  const W = 360;
  const H = 160;
  const PAD = 18;

  const minV = Math.min(...points.map((p) => p.v));
  const maxV = Math.max(...points.map((p) => p.v));
  const span = Math.max(1, maxV - minV);

  const xStep = points.length === 1 ? 0 : (W - PAD * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = PAD + i * xStep;
    const y = PAD + (H - PAD * 2) * (1 - (p.v - minV) / span);
    return { ...p, x, y };
  });

  const dPath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const last = coords[coords.length - 1];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#111" }}>
          최근 공복: <span style={{ color: "#e84c7a" }}>{last.v}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.55)" }}>
          min {minV} / max {maxV}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="160" style={{ display: "block" }}>
        {/* grid line */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(0,0,0,0.08)" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(0,0,0,0.08)" />

        {/* path */}
        <path d={dPath} fill="none" stroke="rgba(232,76,122,0.9)" strokeWidth="2.5" />

        {/* points */}
        {coords.map((c) => (
          <circle key={c.xKey} cx={c.x} cy={c.y} r="3.5" fill="rgba(240,230,140,1)" stroke="rgba(232,76,122,0.9)" />
        ))}

        {/* last label */}
        <text x={last.x} y={Math.max(12, last.y - 10)} textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(0,0,0,0.65)">
          {last.v}
        </text>
      </svg>

      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(0,0,0,0.55)", marginTop: 6 }}>
        공복 데이터 있는 날만 표시됩니다.
      </div>
    </div>
  );
}
