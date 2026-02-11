import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/CalendarCell.css";

function bool(v) {
  return v === true || v === 1 || v === "Y";
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickFasting(summary, dayRecords) {
  const v =
    summary?.fastingValue ??
    summary?.fastingAvg ??
    summary?.fasting ??
    summary?.fastingGlucose ??
    summary?.glucoseValue ??
    null;

  const fromSummary = toNum(v);
  if (fromSummary != null) return fromSummary;

  const fromRecords = toNum(
    (dayRecords || []).find((r) => r?.measureType === "FASTING")?.glucoseValue
  );
  return fromRecords;
}

export default function CalendarCell({
  day,
  iso,
  summary,
  memberId,

  onCreate,
  onEditDay,
  onOpenDay,

  isToday,
  isSelected,
}) {
  const [hover, setHover] = useState(false);
  const [dayRecords, setDayRecords] = useState([]);

  const recordCount = useMemo(() => Number(summary?.recordCount || 0), [summary]);
  const hasRecord = recordCount > 0;

  // ✅ 요약 플래그
  const flags = useMemo(() => {
    const s = summary || {};
    return {
      exercise: bool(s.exerciseYN),
      drink: bool(s.drinkYN),
      medication: bool(s.medicationYN),
      injection: bool(s.injectionYN),
    };
  }, [summary]);

  // ✅ “체크된 것만” + “원하는 순서대로 당겨서”
  // 여기 순서만 바꾸면 UI 순서 바로 바뀜
  const activeIcons = useMemo(() => {
    const order = [
      { key: "exercise", emoji: "🏃", label: "운동" },
      { key: "drink", emoji: "🍺", label: "음주" },
      { key: "medication", emoji: "💊", label: "약" },
      { key: "injection", emoji: "💉", label: "주사" },
    ];
    return order.filter((it) => !!flags[it.key]);
  }, [flags]);

  // hover일 때만 공복 보완 조회
  useEffect(() => {
    if (!hover) return;
    if (!memberId || !iso) return;

    let alive = true;
    (async () => {
      try {
        const res = await api.get("/glucose/day", { params: { memberId, date: iso } });
        const list = Array.isArray(res.data) ? res.data : [];
        if (alive) setDayRecords(list);
      } catch (e) {
        console.error(e);
        if (alive) setDayRecords([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [hover, memberId, iso]);

  const fastingValue = useMemo(
    () => pickFasting(summary, dayRecords),
    [summary, dayRecords]
  );

  const cls = [
    "cal-cell",
    isToday ? "today" : "",
    isSelected ? "selected" : "",
    hasRecord ? "has" : "empty",
    hover ? "hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") onOpenDay?.(iso);
  };

  return (
    <div
      className={cls}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpenDay?.(iso)}
      onKeyDown={onKeyDown}
      aria-label={`${iso} 기록 ${recordCount}개`}
    >
      {/* 1줄: 날짜(좌) / 총기록(우) */}
      <div className="cal-top">
        <div className="cal-dayNum">
          {day}
          {isToday && <span className="cal-todayDot" />}
        </div>

        <div className="cal-countText">
          총기록 <b>{hasRecord ? recordCount : "-"}</b>
        </div>
      </div>

      {/* 2줄: 공복(좌) */}
      <div className="cal-mid">
        <div className="cal-fastingText">
          공복{" "}
          <b className={fastingValue != null ? "on" : "off"}>
            {fastingValue ?? "-"}
          </b>
        </div>
      </div>

      {/* 3줄: 체크된 아이콘만 “당겨서” 표시 */}
      <div className="cal-bottom" aria-label="활동 아이콘">
        {activeIcons.length === 0 ? (
          <span className="cal-iconsEmpty">-</span>
        ) : (
          activeIcons.map((it) => (
            <span className="cal-ic on" title={it.label} key={it.key}>
              {it.emoji}
            </span>
          ))
        )}
      </div>

      {/* hover 버튼: 한 줄 고정 + 줄바꿈 방지 */}
      {hover && (
  <div className="cal-hoverBtns" onClick={(e) => e.stopPropagation()}>
    {hasRecord && (
      <button
        className="cal-btn cal-btnGhost"
        type="button"
        onClick={() => onEditDay?.(iso)}
      >
        수정
      </button>
    )}
    <button
      className="cal-btn cal-btnPrimary"
      type="button"
      onClick={() => onCreate?.(iso)}
    >
      작성하기
    </button>
  </div>
)}

    </div>
  );
}
