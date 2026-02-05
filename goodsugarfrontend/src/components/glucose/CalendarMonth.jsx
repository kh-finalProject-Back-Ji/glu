import { dayOfWeek0Sun, endOfMonth, startOfMonth, toISODate } from "../../utils/date";
import "../../styles/CalendarMonth.css";
import CalendarCell from "./CalendarCell";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarMonth({
  monthDate,
  days,
  selectedISO,
  memberId,

  onOpenDay,  // (iso)
  onCreate,   // (iso)
  onEditDay,  // (iso)
}) {
  const s = startOfMonth(monthDate);
  const e = endOfMonth(monthDate);

  const summaryMap = new Map();
  (days || []).forEach((d) => {
    summaryMap.set(String(d.measureDate), d);
  });

  const firstDow = dayOfWeek0Sun(s);
  const totalDays = e.getDate();
  const todayISO = toISODate(new Date());

  const cells = [];

  for (let i = 0; i < firstDow; i++) cells.push({ type: "empty", key: `pre-${i}` });

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

  while (cells.length % 7 !== 0) cells.push({ type: "empty", key: `post-${cells.length}` });

  return (
    <div className="cal-wrap">
      <div className="cal-week">
        {WEEK.map((w) => (
          <div key={w} className="cal-weekcell">
            {w}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((c) => {
          if (c.type === "empty") return <div key={c.key} className="cal-cell empty" />;

          return (
            <CalendarCell
              key={c.key}
              day={c.day}
              iso={c.iso}
              summary={c.summary}
              memberId={memberId}
              isToday={c.isToday}
              isSelected={c.isSelected}
              onOpenDay={onOpenDay}
              onCreate={onCreate}
              onEditDay={onEditDay}
            />
          );
        })}
      </div>
    </div>
  );
}
