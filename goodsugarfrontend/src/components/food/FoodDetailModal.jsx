// src/components/food/FoodDetailModal.jsx
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import "../../styles/FoodDetailModal.css";

const DV = {
  kcal: 2000,
  carb: 324,
  sugar: 25,
  protein: 55,
  fat: 54,
  satFat: 15,
  sodium: 2000,
};

const MAX_RADAR = 100; // ✅ 핵심: 100 → 30

function pct(v, dv) {
  const n = Number(v);
  if (!Number.isFinite(n) || !dv) return 0;
  return Math.round((n / dv) * 1000) / 10; // 1자리 %
}

function fmt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const fixed = Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export default function FoodDetailModal({ open, onClose, item, loading, detail }) {
  if (!open) return null;

  const title = detail?.name ?? item?.name ?? "식품 상세";
  const serving = detail?.servingSize ?? item?.servingSize ?? "";

  const radarData = [
    { key: "에너지", value: pct(detail?.kcal, DV.kcal) },
    { key: "나트륨", value: pct(detail?.sodium, DV.sodium) },
    { key: "탄수화물", value: pct(detail?.carb, DV.carb) },
    { key: "당", value: pct(detail?.sugar, DV.sugar) },
    { key: "지방", value: pct(detail?.fat, DV.fat) },
    { key: "단백질", value: pct(detail?.protein, DV.protein) },
    { key: "포화지방", value: pct(detail?.satFat, DV.satFat) },
  ];

  return (
    <div className="fd-backdrop" onClick={onClose}>
      <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
        {/* TOP */}
        <div className="fd-top">
          <div>
            <div className="fd-title">{title}</div>
            {serving && <div className="fd-sub">기준량: {serving}</div>}
          </div>
          <button className="fd-close" onClick={onClose}>✕</button>
        </div>

        {/* GRAPH */}
        <div className="fd-section">
          <div className="fd-section__head">
            <div className="fd-section__h">1일 영양성분 기준치(%)</div>
            <div className="fd-section__hint">
              * 기준: 에너지 2000kcal / 나트륨 2000mg
            </div>
          </div>

          <div className="fd-chartCard">
            {loading ? (
              <div className="fd-loading">불러오는 중…</div>
            ) : detail ? (
              <div className="fd-chart">
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.12)" />
                    <PolarAngleAxis dataKey="key" />
                    <PolarRadiusAxis
                      domain={[0, MAX_RADAR]}
                      tickCount={4}
                    />
                    <Radar
                      dataKey="value"
                      stroke="#F0E68C"
                      fill="#F0E68C"
                      fillOpacity={0.45}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="fd-badges">
                  {radarData.map((r) => (
                    <div className="fd-badge" key={r.key}>
                      <span>{r.key}</span>
                      <span className="fd-badge__v">{fmt(r.value)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="fd-error">상세 정보를 불러오지 못했어요.</div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="fd-section">
          <div className="fd-section__h">영양성분 함량</div>

          <div className="fd-tableCard">
            <table className="fd-table">
              <thead>
                <tr>
                  <th>에너지(kcal)</th>
                  <th>탄수(g)</th>
                  <th>당(g)</th>
                  <th>단백질(g)</th>
                  <th>지방(g)</th>
                  <th>포화지방(g)</th>
                  <th>나트륨(mg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{fmt(detail?.kcal)}</td>
                  <td>{fmt(detail?.carb)}</td>
                  <td>{fmt(detail?.sugar)}</td>
                  <td>{fmt(detail?.protein)}</td>
                  <td>{fmt(detail?.fat)}</td>
                  <td>{fmt(detail?.satFat)}</td>
                  <td>{fmt(detail?.sodium)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
