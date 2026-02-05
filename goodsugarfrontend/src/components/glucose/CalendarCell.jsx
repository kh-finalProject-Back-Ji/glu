import { useEffect, useState } from "react";
import api from "../../api/axios";

const MEASURE_LABEL = {
  FASTING: "공복",
  BEFORE_MEAL: "식전",
  AFTER_1H: "식후1H",
  AFTER_2H: "식후2H",
  UNKNOWN: "모름",
};

function recordEmojis(r) {
  // ✅ 순서 고정: 운동 → 약 → 주사 → 음주
  const out = [];
  if (r?.exerciseYN) out.push("🏃");
  if (r?.medicationYN) out.push("💊");
  if (r?.injectionYN) out.push("💉");
  if (r?.drinkYN) out.push("🍺");
  return out.join(" ");
}

export default function CalendarCell({
  day,
  iso,
  summary,
  memberId,

  onCreate,   // (iso) => 작성 모드
  onEditDay,  // (iso) => 모달 열고 "목록/수정" 흐름 시작
  onOpenDay,  // (iso) => 모달 열기(선택)

  isToday,
  isSelected,
}) {
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dayRecords, setDayRecords] = useState([]);

  const recordCount = Number(summary?.recordCount || 0);

  // ✅ 공복혈당: summary 우선 (백엔드 월 집계에서 주면 가장 빠름)
  const fastingFromSummary =
    summary?.fastingValue ?? summary?.fasting ?? summary?.fastingGlucose ?? null;

  // hover 조회 records에서도 FASTING 찾아서 표시(월 집계에 fasting이 없을 때 대비)
  const fastingFromRecords =
    dayRecords?.find((r) => r?.measureType === "FASTING")?.glucoseValue ?? null;

  const fastingValue =
    fastingFromSummary != null && fastingFromSummary !== ""
      ? fastingFromSummary
      : fastingFromRecords;

  // hover시에만 day records 조회 (표시용)
  useEffect(() => {
    if (!hover) return;
    if (!memberId || !iso) return;

    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/glucose/day", { params: { memberId, date: iso } });
        const list = Array.isArray(res.data) ? res.data : [];
        if (!alive) return;
        setDayRecords(list);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setDayRecords([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [hover, memberId, iso]);

  const cellCls = ["cal-cell", isToday ? "today" : "", isSelected ? "selected" : ""].join(" ");

  // ✅ 셀 안 아이콘 라인(운동→약→주사→음주)
  const leftIcons = [
    summary?.exerciseYN ? "🏃" : "",
    summary?.medicationYN ? "💊" : "",
    summary?.injectionYN ? "💉" : "",
    summary?.drinkYN ? "🍺" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cellCls}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpenDay?.(iso)}
      role="button"
      tabIndex={0}
    >
      {/* 상단: 날짜 + 총 기록 */}
      <div className="cal-topRow">
        <span className="cal-day">{day}</span>
        {recordCount > 0 && <span className="cal-count">총 기록: {recordCount}</span>}
      </div>

      {/* ✅ 아이콘줄 맨 오른쪽에 공복혈당 */}
      <div className="cal-emojiRow">
        <span className="cal-emojiLeft">{leftIcons}</span>
        <span className={`cal-fastingBadge ${fastingValue != null ? "on" : ""}`}>
          공복혈당: {fastingValue != null && fastingValue !== "" ? fastingValue : "-"}
        </span>
      </div>

      {/* hover 패널 */}
      {hover && (
        <div className="cal-hover" onClick={(e) => e.stopPropagation()}>
          <div className="cal-hoverBody">
            {loading && <div className="cal-muted">불러오는 중...</div>}

            {!loading && dayRecords.length === 0 && (
              <div className="cal-muted">기록 없음</div>
            )}

            {/* ✅ 기록은 “글자 리스트(버튼X)” */}
            {!loading && dayRecords.length > 0 && (
              <div className="cal-recordTextList">
                {dayRecords.map((r, idx) => (
                  <div key={r.recordId} className="cal-recordText readonly">
                    <span className="cal-rNo">#{idx + 1}</span>
                    <span className="cal-rMain">
                      {r.glucoseValue ?? "-"} · {MEASURE_LABEL[r.measureType] ?? r.measureType ?? "-"}
                    </span>
                    <span className="cal-rEmoji">{recordEmojis(r)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ hover 버튼은 “수정하기 / 작성하기” 두 개만 */}
          <div className="cal-hoverBtns">
            <button className="cal-editBtn" type="button" onClick={() => onEditDay?.(iso)}>
              수정하기
            </button>
            <button className="cal-createBottom" type="button" onClick={() => onCreate?.(iso)}>
              작성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
