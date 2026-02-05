import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";

import CalendarMonth from "../components/glucose/CalendarMonth";
import DayModal from "../components/glucose/DayModal";
import RightPanel from "../components/glucose/RightPanel";

import { addMonths, endOfMonth, startOfMonth, toISODate } from "../utils/date";
import "../styles/GlucoseRecordPage.css";

const MODES = {
  PICK: "pick",
  CREATE: "create",
  DETAIL: "detail",
  EDIT: "edit",
};

export default function GlucoseRecordPage() {
  const memberId = 1;

  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  const [openDayModal, setOpenDayModal] = useState(false);
  const [selectedISO, setSelectedISO] = useState(null);

  const [dayRecords, setDayRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const [mode, setMode] = useState(MODES.PICK);

  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const monthReqRef = useRef(null);
  const dayReqRef = useRef(null);

  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const monthEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  const loadCalendar = useCallback(async () => {
    if (!memberId) return;

    if (monthReqRef.current) monthReqRef.current.abort();
    const controller = new AbortController();
    monthReqRef.current = controller;

    setLoadingMonth(true);
    setErrorMsg("");

    try {
      const res = await api.get("/glucose", {
        params: { memberId, startDate: toISODate(monthStart), endDate: toISODate(monthEnd) },
        signal: controller.signal,
      });
      setCalendarDays(res.data || []);
    } catch (e) {
      if (e?.name === "CanceledError" || e?.name === "AbortError") return;
      console.error(e);
      setErrorMsg("월 데이터 조회에 실패했어요.");
      setCalendarDays([]);
    } finally {
      setLoadingMonth(false);
    }
  }, [memberId, monthStart, monthEnd]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const loadDayRecords = useCallback(
    async (iso) => {
      if (!memberId || !iso) return;

      if (dayReqRef.current) dayReqRef.current.abort();
      const controller = new AbortController();
      dayReqRef.current = controller;

      setLoadingDay(true);
      setErrorMsg("");

      try {
        const res = await api.get("/glucose/day", {
          params: { memberId, date: iso },
          signal: controller.signal,
        });

        const list = res.data || [];
        setDayRecords(list);

        const firstId = list?.[0]?.recordId ?? null;
        setSelectedRecordId(firstId);
      } catch (e) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.error(e);
        setErrorMsg("해당 날짜 기록을 불러오지 못했어요.");
        setDayRecords([]);
        setSelectedRecordId(null);
      } finally {
        setLoadingDay(false);
      }
    },
    [memberId]
  );

  const openForISO = useCallback(
    async (iso) => {
      setSelectedISO(iso);
      setOpenDayModal(true);
      setSelectedRecordId(null);
      setDayRecords([]);
      await loadDayRecords(iso);
    },
    [loadDayRecords]
  );

  const selectedSummary = useMemo(() => {
    if (!selectedISO) return null;
    return calendarDays.find((d) => String(d.measureDate) === selectedISO) || null;
  }, [calendarDays, selectedISO]);

  const refreshAfterMutation = useCallback(async () => {
    if (!selectedISO) return;
    await loadDayRecords(selectedISO);
    await loadCalendar();
  }, [selectedISO, loadDayRecords, loadCalendar]);

  const closeModal = () => {
    setOpenDayModal(false);
    setErrorMsg("");
  };

  return (
    <div className="gr-page">
      <section className="gr-left">
        <div className="gr-calHeader">
          <button
            className="gr-calArrow gr-calArrow-left"
            onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
            type="button"
            aria-label="이전 달"
          >
            ◀
          </button>

          <div className="gr-calTitle">혈당 기록</div>

          <div className="gr-calMonthText">
            {monthCursor.getFullYear()}년 {monthCursor.getMonth() + 1}월
          </div>

          <button
            className="gr-calArrow gr-calArrow-right"
            onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
            type="button"
            aria-label="다음 달"
          >
            ▶
          </button>
        </div>

        {errorMsg && <div className="gr-error">{errorMsg}</div>}
        {loadingMonth && <div className="gr-muted">캘린더 불러오는 중...</div>}

        {/* ✅ 여기 중요: hover 버튼 2개만 동작 */}
        <CalendarMonth
          monthDate={monthCursor}
          days={calendarDays}
          selectedISO={selectedISO}
          memberId={memberId}
          onOpenDay={openForISO}
          onCreate={async (iso) => {
            await openForISO(iso);
            setMode(MODES.CREATE);
          }}
          onEditDay={async (iso) => {
            await openForISO(iso);
            // ✅ 모달 안에서 선택해서 수정/삭제/상세 처리
            setMode(MODES.PICK);
          }}
        />
      </section>

      <aside className="gr-right">
        <RightPanel
          memberId={memberId}
          monthCursor={monthCursor}
          selectedISO={selectedISO}
          selectedSummary={selectedSummary}
        />
      </aside>

      <DayModal
        open={openDayModal}
        onClose={closeModal}
        memberId={memberId}
        dateISO={selectedISO}
        summary={selectedSummary}
        loading={loadingDay}
        mode={mode}
        setMode={setMode}
        records={dayRecords}
        selectedRecordId={selectedRecordId}
        setSelectedRecordId={setSelectedRecordId}
        onSaved={refreshAfterMutation}
        onDeleted={refreshAfterMutation}
      />
    </div>
  );
}
