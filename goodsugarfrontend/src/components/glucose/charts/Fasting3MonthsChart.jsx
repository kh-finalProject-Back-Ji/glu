import { useMemo } from "react";

// days에서 공복혈당 값 뽑아오기 (필드명 여러 케이스 대응)
function pickFastingValue(d) {
  const v =
    d.fastingGlucose ??
    d.fasting ??
    d.fastingLevel ??
    d.fastingSugar ??
    d.fasting_value ??
    d.fasting_glucose ??
    null;

  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

// measureDate(또는 date)에서 yyyy-mm 뽑기
function pickYYYYMM(d) {
  const raw = d.measureDate ?? d.date ?? d.recordDate ?? d.measuredAt ?? d.createdAt ?? "";
  if (typeof raw === "string" && raw.length >= 7) return raw.slice(0, 7);
  // Date 객체 가능성
  if (raw instanceof Date) {
    const yyyy = raw.getFullYear();
    const mm = String(raw.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  }
  return "unknown";
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export default function Fasting3MonthsChart({ days = [] }) {
  const stats = useMemo(() => {
    // 월별로 fasting 값 모으기
    const byMonth = new Map();

    for (const d of days || []) {
      const ym = pickYYYYMM(d);
      const val = pickFastingValue(d);
      if (val == null) continue;

      if (!byMonth.has(ym)) byMonth.set(ym, []);
      byMonth.get(ym).push(val);
    }

    // 정렬된 월 리스트
    const months = Array.from(byMonth.keys()).sort();

    // 최근 3개만
    const last3 = months.slice(-3);

    const rows = last3.map((m) => {
      const arr = byMonth.get(m) || [];
      const sum = arr.reduce((a, b) => a + b, 0);
      const avg = arr.length ? sum / arr.length : null;
      const min = arr.length ? Math.min(...arr) : null;
      const max = arr.length ? Math.max(...arr) : null;
      return { month: m, count: arr.length, avg, min, max };
    });

    // bar 스케일용 최대 avg
    const maxAvg = Math.max(
      1,
      ...rows.map((r) => (r.avg == null ? 0 : r.avg))
    );

    return { rows, maxAvg };
  }, [days]);

  if (!stats.rows.length) {
    return <div className="rp-muted">공복 혈당 데이터가 없어요.</div>;
  }

  return (
    <div className="rp-chart">
      <div className="rp-chart-grid">
        {stats.rows.map((r) => {
          const pct = r.avg == null ? 0 : Math.round((r.avg / stats.maxAvg) * 100);
          return (
            <div key={r.month} className="rp-row">
              <div className="rp-row-head">
                <span className="rp-k">{r.month}</span>
                <span className="rp-v">
                  평균 <b>{r.avg == null ? "-" : round1(r.avg)}</b> / 최소 {r.min ?? "-"} / 최대 {r.max ?? "-"} ({r.count}건)
                </span>
              </div>

              <div className="rp-bar-rail">
                <div className="rp-bar" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rp-muted" style={{ marginTop: 8 }}>
        ※ 막대는 최근 3개월 평균을 상대 비교한 표시입니다.
      </div>
    </div>
  );
}
