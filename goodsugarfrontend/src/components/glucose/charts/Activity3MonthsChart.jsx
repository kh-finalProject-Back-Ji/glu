import { useMemo } from "react";

function pickYYYYMM(d) {
  const raw = d.measureDate ?? d.date ?? d.recordDate ?? d.measuredAt ?? d.createdAt ?? "";
  if (typeof raw === "string" && raw.length >= 7) return raw.slice(0, 7);
  if (raw instanceof Date) {
    const yyyy = raw.getFullYear();
    const mm = String(raw.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  }
  return "unknown";
}

function pickBool(d, keys) {
  for (const k of keys) {
    if (k in d) {
      const v = d[k];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v === 1;
      if (typeof v === "string") {
        const s = v.trim().toUpperCase();
        if (s === "Y" || s === "TRUE" || s === "1") return true;
        if (s === "N" || s === "FALSE" || s === "0") return false;
      }
    }
  }
  return false;
}

export default function Activity3MonthsChart({ days = [] }) {
  const rows = useMemo(() => {
    const byMonth = new Map();

    for (const d of days || []) {
      const ym = pickYYYYMM(d);

      const exercised = pickBool(d, ["exercise", "didExercise", "workout", "exerciseYn", "exerciseYN"]);
      const drank = pickBool(d, ["alcohol", "drink", "drank", "alcoholYn", "alcoholYN"]);
      const tookMed = pickBool(d, ["medicine", "med", "tookMedicine", "medicineYn", "medicineYN"]);
      const injected = pickBool(d, ["injection", "shot", "insulin", "injectionYn", "injectionYN"]);

      if (!byMonth.has(ym)) {
        byMonth.set(ym, { month: ym, exerciseDays: 0, alcoholDays: 0, medDays: 0, injectionDays: 0, total: 0 });
      }

      const agg = byMonth.get(ym);
      agg.total += 1;
      if (exercised) agg.exerciseDays += 1;
      if (drank) agg.alcoholDays += 1;
      if (tookMed) agg.medDays += 1;
      if (injected) agg.injectionDays += 1;
    }

    const months = Array.from(byMonth.keys()).sort();
    return months.slice(-3).map((m) => byMonth.get(m));
  }, [days]);

  if (!rows.length) {
    return <div className="rp-muted">활동 데이터가 없어요.</div>;
  }

  return (
    <div className="rp-chart">
      <table className="rp-table">
        <thead>
          <tr>
            <th>월</th>
            <th>운동</th>
            <th>음주</th>
            <th>약</th>
            <th>주사</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month}>
              <td>{r.month}</td>
              <td>{r.exerciseDays}</td>
              <td>{r.alcoholDays}</td>
              <td>{r.medDays}</td>
              <td>{r.injectionDays}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rp-muted" style={{ marginTop: 8 }}>
        ※ 각 항목은 “해당 기록 중 체크된 날 수” 집계입니다.
      </div>
    </div>
  );
}
