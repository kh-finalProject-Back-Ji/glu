import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";

import CalendarMonth from "../components/glucose/CalendarMonth";
import DayModal from "../components/glucose/DayModal";
import RightPanel from "../components/glucose/RightPanel";

import { addMonths, endOfMonth, startOfMonth, toISODate } from "../utils/date";
import "../styles/GlucoseRecordPage.css";

/**
 * 실무형 설계 포인트
 * - Page가 상태/데이터/API를 모두 통제
 * - Calendar는 UI 전용(의도 intent만 올림)
 * - DayModal은 탭/폼/상세 렌더, 저장/삭제는 Page handler로 수행
 * - 월 데이터(loadCalendar) / 특정 날짜 기록(loadDayRecords)을 분리
 * - AbortController로 월 전환/날짜 변경시 이전 요청 취소(레이스 방지)
 */

const MODES = {
  PICK: "pick",     // 기록 선택(목록)
  CREATE: "create", // 작성
  DETAIL: "detail", // 상세
  EDIT: "edit",     // 수정
};

export default function GlucoseRecordPage() {
  // TODO: 로그인 붙이면 세션/토큰에서 memberId 가져오기
  const memberId = 1;

  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // day modal state
  const [openDayModal, setOpenDayModal] = useState(false);
  const [selectedISO, setSelectedISO] = useState(null);

  // day records state (해당 날짜의 여러 기록)
  const [dayRecords, setDayRecords] = useState([]); // [{recordId,...}]
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // 모달 내 “현재 모드(탭/화면)”
  const [mode, setMode] = useState(MODES.PICK);

  // loading/error
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // abort refs
  const monthReqRef = useRef(null);
  const dayReqRef = useRef(null);

  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const monthEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  /**
   * 월 캘린더 집계 로드
   */
  const loadCalendar = useCallback(async () => {
    if (!memberId) return;

    // 이전 요청 취소
    if (monthReqRef.current) monthReqRef.current.abort();
    const controller = new AbortController();
    monthReqRef.current = controller;

    setLoadingMonth(true);
    setErrorMsg("");

    try {
      const res = await api.get("/glucose", {
        params: {
          memberId,
          startDate: toISODate(monthStart),
          endDate: toISODate(monthEnd),
        },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor]);

  /**
   * 특정 날짜의 기록 목록 로드 (/glucose/day)
   */
  const loadDayRecords = useCallback(
    async (iso) => {
      if (!memberId || !iso) return;

      // 이전 요청 취소
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

        // 기본 선택: 첫번째 기록
        const firstId = list?.[0]?.recordId ?? null;
        setSelectedRecordId(firstId);

        // 기록이 없으면 작성모드로 유도, 있으면 pick(목록)으로
        setMode(list.length > 0 ? MODES.PICK : MODES.CREATE);
      } catch (e) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.error(e);
        setErrorMsg("해당 날짜 기록을 불러오지 못했어요.");
        setDayRecords([]);
        setSelectedRecordId(null);
        setMode(MODES.CREATE);
      } finally {
        setLoadingDay(false);
      }
    },
    [memberId]
  );

  /**
   * 날짜 선택 공통 처리:
   * - iso 선택
   * - 모달 open
   * - dayRecords fetch
   */
  const openForISO = useCallback(
    async (iso) => {
      setSelectedISO(iso);
      setOpenDayModal(true);
      setSelectedRecordId(null);
      setDayRecords([]);
      setMode(MODES.PICK); // 일단 기본
      await loadDayRecords(iso);
    },
    [loadDayRecords]
  );

  /**
   * 캘린더 셀 hover 메뉴에서 쓰는 핸들러들
   * - CalendarCell은 onCreate/onDetail/onEdit/onDelete만 호출
   * - Page는 “모달 모드”까지 포함해서 UX를 만든다
   */
  const handleCreate = useCallback(
    async (iso) => {
      await openForISO(iso);
      setMode(MODES.CREATE);
    },
    [openForISO]
  );

  const handleDetail = useCallback(
    async (iso) => {
      await openForISO(iso);
      // 기록이 있어야 상세가 의미 있음 → 없다면 create로
      setMode((prev) => (dayRecords.length > 0 ? MODES.DETAIL : MODES.CREATE));
    },
    // dayRecords는 openForISO 이후 로드되므로 여기서는 mode만 detail로 두고
    // DayModal에서 "선택된 recordId 없으면 pick" 처리도 같이 넣는 게 안정적
    [openForISO, dayRecords.length]
  );

  const handleEdit = useCallback(
    async (iso) => {
      await openForISO(iso);
      setMode((prev) => (dayRecords.length > 0 ? MODES.EDIT : MODES.CREATE));
    },
    [openForISO, dayRecords.length]
  );

  const handleDeleteFirst = useCallback(
    async (iso) => {
      // 실무적으로는 "첫번째 기록"의 기준이 필요함(최신/최초)
      // 여기서는 dayRecords를 먼저 불러오고 첫 recordId 삭제(예: 첫번째)
      await openForISO(iso);
      const first = (dayRecords && dayRecords[0]) ? dayRecords[0] : null;
      if (!first?.recordId) return;

      if (!window.confirm("첫번째 기록을 삭제할까요?")) return;

      try {
        await api.delete(`/glucose/${first.recordId}`);
        await loadDayRecords(iso);
        await loadCalendar();
      } catch (e) {
        console.error(e);
        setErrorMsg("삭제에 실패했어요.");
      }
    },
    [openForISO, dayRecords, loadDayRecords, loadCalendar]
  );

  /**
   * 페이지의 기존 "날짜 클릭"은 openForISO로 통일
   */
  const onClickDay = useCallback(
    async (iso) => {
      await openForISO(iso);
    },
    [openForISO]
  );

  /**
   * 캘린더에서 선택된 ISO에 대응하는 "월 집계 summary"
   */
  const selectedSummary = useMemo(() => {
    if (!selectedISO) return null;
    return calendarDays.find((d) => String(d.measureDate) === selectedISO) || null;
  }, [calendarDays, selectedISO]);

  /**
   * 모달 닫기
   */
  const closeModal = () => {
    setOpenDayModal(false);
    setErrorMsg("");
  };

  /**
   * 모달에서 저장/삭제가 발생했을 때:
   * - dayRecords 재조회
   * - 달 집계 재조회
   */
  const refreshAfterMutation = useCallback(async () => {
    if (!selectedISO) return;
    await loadDayRecords(selectedISO);
    await loadCalendar();
  }, [selectedISO, loadDayRecords, loadCalendar]);

  return (
    <div className="gr-page">
      <section className="gr-left">
        {/* 상단 캘린더 헤더 */}
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

        {/* ✅ CalendarMonth는 UI 전용 + “의도 콜백”만 전달 */}
        <CalendarMonth
          monthDate={monthCursor}
          days={calendarDays}
          selectedISO={selectedISO}
          onClickDay={onClickDay} // 셀 클릭(기본)
          onCreate={handleCreate} // hover 메뉴 - 작성
          onDetail={handleDetail} // hover 메뉴 - 상세
          onEdit={handleEdit}     // hover 메뉴 - 수정
          onDelete={handleDeleteFirst} // hover 메뉴 - 삭제(첫번째)
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

      {/* ✅ DayModal에는 “데이터 + 모드 + 핸들러”를 내려준다 */}
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
