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

export default function RightPanel({
  memberId,
  monthCursor,
  selectedISO,
  selectedSummary, // 유지(안써도 됨)
}) {
  // ✅ 3개월 데이터
  const [days3m, setDays3m] = useState([]);
  const [loading3m, setLoading3m] = useState(false);

  // ✅ 선택 날짜 레코드(식단 추출용)
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [loadingSelected, setLoadingSelected] = useState(false);

  // ✅ 나에게 쓰는 메모(회원 단위)
  const [memo, setMemo] = useState("");
  const [savingMemo, setSavingMemo] = useState(false);

  // ✅ 3개월 범위 (현재 월 기준 3개월)
  const rangeStart = useMemo(
    () => startOfMonth(addMonths(monthCursor, -2)),
    [monthCursor]
  );
  const rangeEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  // ✅ 3개월 데이터 불러오기
  useEffect(() => {
    if (!memberId) return;

    const fetch3Months = async () => {
      setLoading3m(true);
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
        setLoading3m(false);
      }
    };

    fetch3Months();
  }, [memberId, rangeStart, rangeEnd]);

  // ✅ 선택 날짜 레코드 불러오기 (식단 표시용)
  useEffect(() => {
    if (!memberId || !selectedISO) {
      setSelectedRecords([]);
      return;
    }

    let alive = true;
    (async () => {
      setLoadingSelected(true);
      try {
        const res = await api.get("/glucose/day", {
          params: { memberId, date: selectedISO },
        });
        if (!alive) return;
        setSelectedRecords(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("RightPanel 선택날짜 기록 조회 실패", e);
        if (!alive) return;
        setSelectedRecords([]);
      } finally {
        if (alive) setLoadingSelected(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [memberId, selectedISO]);

  // ✅ 선택 날짜: 식단만 추출 + "식단 1, 식단 2..." 자동 번호
  const diets = useMemo(() => {
    const list = Array.isArray(selectedRecords) ? selectedRecords : [];

    const onlyDiet = list
      .map((r) => ({
        recordId: r?.recordId ?? null,
        diet: String(r?.diet ?? "").trim(),
      }))
      .filter((x) => x.diet.length > 0);

    return onlyDiet.map((x, i) => ({
      no: i + 1,
      key: x.recordId ?? `diet-${i}`,
      text: x.diet,
    }));
  }, [selectedRecords]);

  // ✅ 3개월 평균 공복혈당 (데이터 없으면 null)
  const fastingAvg3m = useMemo(() => {
    const vals = (days3m || [])
      .map((d) =>
        toNum(
          d.fastingValue ??
            d.fastingAvg ??
            d.fasting ??
            d.fastingGlucose ??
            d.glucoseValue ??
            null
        )
      )
      .filter((n) => n !== null);

    if (vals.length === 0) return null;
    const sum = vals.reduce((acc, n) => acc + n, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  }, [days3m]);

  // ✅ 메모 불러오기
  // ✅ 메모 불러오기
useEffect(() => {
  if (!memberId) return;

  const fetchMemo = async () => {
    try {
      const res = await api.get("/member/memo", { params: { memberId } });
      setMemo(res.data?.memo ?? ""); // ✅ 여기 중요 (res.data가 객체)
    } catch (e) {
      console.error("메모 조회 실패", e);
      setMemo("");
    }
  };

  fetchMemo();
}, [memberId]);

// ✅ 메모 자동 저장 (0.8초 debounce)
useEffect(() => {
  if (!memberId) return;

  const timer = setTimeout(async () => {
    try {
      setSavingMemo(true);
      await api.put("/member/memo", {
        memberId,
        memo, // ✅ JSON으로 보냄
      });
    } catch (e) {
      console.error("메모 저장 실패", e);
    } finally {
      setSavingMemo(false);
    }
  }, 800);

  return () => clearTimeout(timer);
}, [memo, memberId]);


  return (
    <div className="rp-wrap">
      {/* ✅ 선택 날짜 요약: 식단만 */}
      <div className="rp-card rp-focus">
        <div className="rp-title">📌 선택 날짜 식단</div>

        <div className="rp-muted">
          선택 날짜: <b>{selectedISO || "-"}</b>
        </div>

        {!selectedISO && (
          <div className="rp-hint">
            캘린더에서 날짜를 선택하면 식단이 여기 표시돼.
          </div>
        )}

        {selectedISO && loadingSelected && (
          <div className="rp-muted" style={{ marginTop: 10 }}>
            불러오는 중...
          </div>
        )}

        {selectedISO && !loadingSelected && diets.length === 0 && (
          <div className="rp-muted" style={{ marginTop: 10, fontWeight: 900 }}>
            식단 기록이 없어요.
          </div>
        )}

        {selectedISO && !loadingSelected && diets.length > 0 && (
          <div className="rp-dietList" style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {diets.map((d) => (
              <div key={d.key} className="rp-dietItem">
                <div className="rp-dietLabel">식단 {d.no}</div>
                <div className="rp-dietText">{d.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 최근 3개월 공복 혈당 */}
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

        {loading3m ? (
          <div className="rp-muted">불러오는 중...</div>
        ) : (
          <Fasting3MonthsChart days={days3m} hideEmptyText />
        )}
      </div>

      {/* ✅ 최근 3개월 활동 */}
      <div className="rp-card">
        <div className="rp-title">🏃 / 🍺 최근 3개월 활동</div>
        {loading3m ? (
          <div className="rp-muted">불러오는 중...</div>
        ) : (
          <Activity3MonthsChart days={days3m} />
        )}
      </div>

      {/* ✅ 나에게 쓰는 메모 (회원 단위) */}
      <div className="rp-card">
        <div className="rp-title">📝 나에게 쓰는 메모</div>

        <textarea
          className="rp-memo-textarea"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이번 달 목표, 주의할 점 등을 자유롭게 작성하세요."
        />

        {savingMemo && (
          <div className="rp-muted" style={{ marginTop: 6 }}>
            저장 중...
          </div>
        )}
      </div>
    </div>
  );
}
