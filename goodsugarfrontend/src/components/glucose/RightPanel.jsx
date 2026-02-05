import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  addMonths,
  endOfMonth,
  startOfMonth,
  toISODate,
} from "../../utils/date";
import Fasting3MonthsChart from "./charts/Fasting3MonthsChart";
import Activity3MonthsChart from "./charts/Activity3MonthsChart";



import "../../styles/RightPanel.css";

/**
 * RightPanel
 * - 역할: "최근 3개월 데이터 집계 + 우측 정보 패널"
 * - API 호출은 여기서 1번만
 * - 차트들은 days props만 받아서 렌더링
 */
export default function RightPanel({
  memberId,
  monthCursor,
  selectedISO,
  selectedSummary,
}) {
  const [days3m, setDays3m] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 최근 3개월 범위 (monthCursor 기준)
  const rangeStart = useMemo(
    () => startOfMonth(addMonths(monthCursor, -2)),
    [monthCursor]
  );
  const rangeEnd = useMemo(
    () => endOfMonth(monthCursor),
    [monthCursor]
  );

  // ✅ 3개월 데이터 조회
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
        setDays3m(res.data || []);
      } catch (e) {
        console.error("RightPanel 3개월 데이터 조회 실패", e);
        setDays3m([]);
      } finally {
        setLoading(false);
      }
    };

    fetch3Months();
  }, [memberId, rangeStart, rangeEnd]);

  return (
    <>
      {/* ================= 공복 혈당 ================= */}
      <div className="rp-card">
        <div className="rp-title">📈 최근 3개월 공복 혈당</div>

        {loading ? (
          <div className="rp-muted">불러오는 중...</div>
        ) : (
          <Fasting3MonthsChart days={days3m} />
        )}
      </div>

      {/* ================= 활동 요약 ================= */}
      <div className="rp-card">
        <div className="rp-title">🏃 / 🍺 최근 3개월 활동</div>

        {loading ? (
          <div className="rp-muted">불러오는 중...</div>
        ) : (
          <Activity3MonthsChart days={days3m} />
        )}
      </div>

      {/* ================= 메모 ================= */}
      <div className="rp-card">
        <div className="rp-title">📝 나에게 쓰는 메모</div>

        <div className="rp-memo">
          <div className="rp-memo-head">
            선택 날짜: <b>{selectedISO || "-"}</b>
          </div>

          <div className="rp-memo-box">
            {selectedSummary ? (
              <>
                <div className="rp-muted">
                  ※ 현재는 메모 테이블이 없어 임시 영역입니다.
                </div>
                <div className="rp-muted">
                  메모 테이블 + API 추가 시 바로 저장/조회 가능
                </div>
              </>
            ) : (
              <div className="rp-muted">
                캘린더에서 날짜를 선택하면 메모를 작성할 수 있어요.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
