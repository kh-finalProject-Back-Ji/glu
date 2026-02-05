import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { addMonths, endOfMonth, startOfMonth, toISODate } from "../../utils/date";

import Fasting3MonthsChart from "./charts/Fasting3MonthsChart";
import Activity3MonthsChart from "./charts/Activity3MonthsChart";

import "../../styles/RightPanel.css";

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v) {
  return v === true || v === 1 || v === "Y";
}

function emojisFromSummary(s) {
  if (!s) return [];
  const out = [];
  // ✅ 순서: 운동 / 약 / 주사 / 음주
  if (bool(s.exerciseYN)) out.push("🏃");
  if (bool(s.medicationYN)) out.push("💊");
  if (bool(s.injectionYN)) out.push("💉");
  if (bool(s.drinkYN)) out.push("🍺");
  return out;
}

function getFastingFromSummary(s) {
  if (!s) return null;
  // 백엔드 집계 컬럼 다양성 대응
  const v = s.fastingValue ?? s.fastingAvg ?? s.fasting ?? null;
  return v === "" ? null : v ?? null;
}

export default function RightPanel({
  memberId,
  monthCursor,
  selectedISO,
  selectedSummary,
}) {
  const [days3m, setDays3m] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 3개월 범위 (현재 월 기준 3개월)
  const rangeStart = useMemo(() => startOfMonth(addMonths(monthCursor, -2)), [monthCursor]);
  const rangeEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  useEffect(() => {
    if (!memberId) return;

    const fetch3Months = async () => {
      setLoading(true);
      try {
        const res = await api.get("/glucose", {
          params: {
            memberId,
            startDate: toISODate(rangeStart),
            endDate: toISODate(rangeEnd),
          },
        });
        setDays3m(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("RightPanel 3개월 데이터 조회 실패", e);
        setDays3m([]);
      } finally {
        setLoading(false);
      }
    };

    fetch3Months();
  }, [memberId, rangeStart, rangeEnd]);

  // ✅ 선택 날짜: 총 기록
  const selectedCount = useMemo(() => {
    const c = selectedSummary?.recordCount ?? 0;
    return Number(c || 0);
  }, [selectedSummary]);

  // ✅ 선택 날짜: 공복혈당 (무조건 보여주기)
  const selectedFasting = useMemo(() => {
    return getFastingFromSummary(selectedSummary);
  }, [selectedSummary]);

  // ✅ 선택 날짜: 운동/약/주사/음주
  const selectedEmojis = useMemo(() => emojisFromSummary(selectedSummary), [selectedSummary]);

  // ✅ 3개월 평균 공복혈당
  const fastingAvg3m = useMemo(() => {
    const vals = (days3m || [])
      .map((d) => toNum(d.fastingValue ?? d.fastingAvg ?? null))
      .filter((n) => n !== null);

    if (vals.length === 0) return null;
    const sum = vals.reduce((acc, n) => acc + n, 0);
    return Math.round((sum / vals.length) * 10) / 10; // 소수 1자리
  }, [days3m]);

  return (
    <div className="rp-wrap">
      {/* ✅ 선택 날짜 요약 */}
      <div className="rp-card rp-focus">
        <div className="rp-title">📌 선택 날짜 요약</div>
        <div className="rp-muted">
          선택 날짜: <b>{selectedISO || "-"}</b>
        </div>

        <div className="rp-kpis">
          <div className="rp-kpi">
            <div className="rp-kpiLabel">총 기록</div>
            <div className="rp-kpiValue">{selectedISO ? `${selectedCount}개` : "-"}</div>
          </div>

          <div className="rp-kpi">
            <div className="rp-kpiLabel">공복혈당</div>
            <div className="rp-kpiValue fasting">
              {selectedISO ? (selectedFasting ?? "-") : "-"}
            </div>
          </div>
        </div>

        <div className="rp-badges">
          {[
            { emoji: "🏃", label: "운동" },
            { emoji: "💊", label: "약" },
            { emoji: "💉", label: "주사" },
            { emoji: "🍺", label: "음주" },
          ].map((it) => {
            const on = selectedEmojis.includes(it.emoji);
            return (
              <span key={it.label} className={`rp-badge ${on ? "on" : "off"}`}>
                <span className="rp-badgeEmoji">{it.emoji}</span>
                {it.label}
              </span>
            );
          })}
        </div>

        {!selectedISO && (
          <div className="rp-hint">캘린더에서 날짜를 선택하면 여기에 요약이 바로 보여.</div>
        )}
      </div>

      {/* ✅ 최근 3개월 공복 */}
      <div className="rp-card">
        <div className="rp-title">📈 최근 3개월 공복 혈당</div>

        <div className="rp-subRow">
          <div className="rp-subText">
            기간: {toISODate(rangeStart)} ~ {toISODate(rangeEnd)}
          </div>
          <div className="rp-subText">
            3개월 평균 공복:{" "}
            <b className="rp-avg">{fastingAvg3m != null ? fastingAvg3m : "-"}</b>
          </div>
        </div>

        {loading ? (
          <div className="rp-muted">불러오는 중...</div>
        ) : (
          <Fasting3MonthsChart days={days3m} />
        )}
      </div>

      {/* ✅ 최근 3개월 활동 */}
      <div className="rp-card">
        <div className="rp-title">🏃 / 🍺 최근 3개월 활동</div>
        {loading ? <div className="rp-muted">불러오는 중...</div> : <Activity3MonthsChart days={days3m} />}
      </div>

      {/* 메모 (임시) */}
      <div className="rp-card">
        <div className="rp-title">📝 나에게 쓰는 메모</div>
        <div className="rp-memo-box">
          <div className="rp-muted">※ 현재는 메모 테이블이 없어 임시 영역입니다.</div>
          <div className="rp-muted">메모 테이블 + API 추가 시 바로 저장/조회 가능</div>
        </div>
      </div>
    </div>
  );
}

