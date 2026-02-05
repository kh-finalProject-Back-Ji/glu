import { dayOfWeek0Sun, endOfMonth, startOfMonth, toISODate } from "../../utils/date";
import "../../styles/CalendarMonth.css";
import CalendarCell from "./CalendarCell";

const WEEK = ["일","월","화","수","목","금","토"];

export default function CalendarMonth({
  monthDate,
  days,
  onClickDay,
  selectedISO,
  onCreate = () => {},
  onDetail = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const s = startOfMonth(monthDate);
  const e = endOfMonth(monthDate);

  // 📌 날짜별 summary 맵 (캘린더 집계 데이터)
  const summaryMap = new Map();
  (days || []).forEach((d) => {
    summaryMap.set(String(d.measureDate), d);
  });

  const firstDow = dayOfWeek0Sun(s); // 0=Sun
  const totalDays = e.getDate();
  const todayISO = toISODate(new Date());

  const cells = [];

  /* =========================
     1️⃣ 앞쪽 빈칸
  ========================= */
  for (let i = 0; i < firstDow; i++) {
    cells.push({ type: "empty", key: `pre-${i}` });
  }

  /* =========================
     2️⃣ 실제 날짜
  ========================= */
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(s.getFullYear(), s.getMonth(), day);
    const iso = toISODate(date);
    const summary = summaryMap.get(iso) || null;

    cells.push({
      type: "day",
      key: iso,
      iso,
      day,
      summary,
      isToday: iso === todayISO,
      isSelected: selectedISO === iso,
    });
  }

  /* =========================
     3️⃣ 뒤쪽 빈칸 (7의 배수)
  ========================= */
  while (cells.length % 7 !== 0) {
    cells.push({ type: "empty", key: `post-${cells.length}` });
  }

  /* =========================
     4️⃣ 주(행) 수 계산 (5주 / 6주)
  ========================= */
  const weeks = Math.ceil(cells.length / 7);

  return (
    <div className="cal-wrap">
      {/* 요일 */}
      <div className="cal-week">
        {WEEK.map((w) => (
          <div key={w} className="cal-weekcell">{w}</div>
        ))}
      </div>

      {/* 날짜 grid */}
      <div className="cal-grid" data-weeks={weeks}>
        {cells.map((c) => {
          if (c.type === "empty") {
            return <div key={c.key} className="cal-cell empty" />;
          }

          return (
            <CalendarCell
              key={c.key}
              day={c.day}
              iso={c.iso}
              summary={c.summary}
              isToday={c.isToday}
              isSelected={c.isSelected}

              /* hover 액션 콜백 */
              onCreate={onCreate}
              onDetail={onDetail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </div>
  );
}
