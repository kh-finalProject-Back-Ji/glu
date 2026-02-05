// src/components/glucose/charts/Activity3MonthsChart.jsx
import { useMemo } from "react";

function bool(v) {
  return v === true || v === 1 || v === "Y";
}

export default function Activity3MonthsChart({ days = [] }) {
  const stats = useMemo(() => {
    const list = days || [];
    const drink = list.filter((d) => bool(d.drinkYN)).length;
    const exercise = list.filter((d) => bool(d.exerciseYN)).length;
    const medication = list.filter((d) => bool(d.medicationYN)).length;
    const injection = list.filter((d) => bool(d.injectionYN)).length;
    const recordedDays = list.filter((d) => (d.recordCount ?? 0) > 0).length;
    const totalRecords = list.reduce((acc, d) => acc + Number(d.recordCount ?? 0), 0);

    return { drink, exercise, medication, injection, recordedDays, totalRecords };
  }, [days]);

  const items = [
    { emoji: "🍺", label: "음주", value: stats.drink },
    { emoji: "🏃", label: "운동", value: stats.exercise },
    { emoji: "💊", label: "약", value: stats.medication },
    { emoji: "💉", label: "주사", value: stats.injection },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={boxStyle}>
          <div style={kStyle}>기록 있는 날짜</div>
          <div style={vStyle}>{stats.recordedDays}일</div>
        </div>
        <div style={boxStyle}>
          <div style={kStyle}>총 기록 수</div>
          <div style={vStyle}>{stats.totalRecords}개</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        {items.map((it) => (
          <div key={it.label} style={pillStyle}>
            <span style={{ fontSize: 18 }}>{it.emoji}</span>
            <span style={{ fontWeight: 1000 }}>{it.label}</span>
            <b style={{ marginLeft: "auto" }}>{it.value}</b>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(0,0,0,0.55)", marginTop: 8 }}>
        “활동”은 3개월 집계(days)에서 해당 플래그가 1인 날짜 수로 계산합니다.
      </div>
    </div>
  );
}

const boxStyle = {
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 14,
  padding: "10px 12px",
  background: "#fff",
};

const kStyle = {
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(0,0,0,0.55)",
};

const vStyle = {
  marginTop: 4,
  fontSize: 18,
  fontWeight: 1000,
  color: "#111",
};

const pillStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fffdf0",
  padding: "10px 12px",
  fontSize: 13,
};
