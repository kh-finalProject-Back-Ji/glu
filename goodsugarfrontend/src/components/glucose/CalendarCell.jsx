// src/components/glucose/CalendarCell.jsx
import { useState } from "react";

export default function CalendarCell({
  day,
  iso,
  summary,
  onCreate,
  onDetail,
  onEdit,
  onDelete,
}) {
  const [hover, setHover] = useState(false);
  const [expand, setExpand] = useState(false);

  const recordCount = summary?.recordCount || 0;
  const hasRecord = recordCount > 0;

  return (
    <div
      className="cal-cell"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setExpand(false);
      }}
    >
      <span className="cal-day">{day}</span>

      {hover && (
        <div className="cal-hover">
          {!hasRecord && (
            <button onClick={() => onCreate(iso)}>
              작성하기
            </button>
          )}

          {hasRecord && (
            <>
              <button onClick={() => setExpand(v => !v)}>
                첫번째 기록
              </button>

              <button onClick={() => onCreate(iso)}>
                작성하기
              </button>

              {expand && (
                <div className="cal-sub">
                  <button onClick={() => onDetail(iso)}>상세</button>
                  <button onClick={() => onEdit(iso)}>수정</button>
                  <button onClick={() => onDelete(iso)}>삭제</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
