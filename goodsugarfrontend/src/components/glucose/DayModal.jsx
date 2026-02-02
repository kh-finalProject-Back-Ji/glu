import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import "../../styles/DayModal.css";

/**
 * 실무형 UX 요구
 * - records 0개: [작성하기]만 크게 노출
 * - records 1개 이상: [첫번째 기록] [작성하기]
 *   - 첫번째 기록 클릭 → 아래 액션바(수정/삭제/상세) 펼쳐짐
 *   - 상세 클릭 → RecordDetailModal
 *   - 수정 클릭 → RecordFormModal(edit)
 *   - 삭제 클릭 → DELETE 후 재조회 + onSaved(캘린더 집계 reload)
 *
 * API (백엔드 기준)
 * - GET    /glucose/day?memberId=&date=YYYY-MM-DD
 * - GET    /glucose/{recordId}
 * - POST   /glucose
 * - PUT    /glucose/{recordId}
 * - DELETE /glucose/{recordId}
 */

export default function DayModal({
  open,
  onClose,
  memberId,
  dateISO,
  summary,
  onSaved,
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // “첫번째 기록” 액션 펼치기
  const [expanded, setExpanded] = useState(false);

  // 2차 모달들
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // 폼 모달 모드
  const [formMode, setFormMode] = useState("create"); // create | edit

  // 상세 모달 데이터
  const [detailRecord, setDetailRecord] = useState(null);

  const hasRecord = records.length > 0;

  // 첫번째 기록
  const firstRecord = useMemo(() => (records?.length ? records[0] : null), [records]);
  const firstRecordId = firstRecord?.recordId ?? null;

  // 모달 닫기(상태 정리)
  const closeAll = () => {
    setExpanded(false);
    setDetailOpen(false);
    setFormOpen(false);
    setDetailRecord(null);
    setErrorMsg("");
    onClose?.();
  };

  // ✅ 모달 열릴 때마다: records 로드 + 상태 리셋
  useEffect(() => {
    if (!open) return;

    setExpanded(false);
    setDetailOpen(false);
    setFormOpen(false);
    setDetailRecord(null);
    setErrorMsg("");

    fetchDayRecords().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateISO, memberId]);

  const fetchDayRecords = async () => {
    if (!memberId || !dateISO) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/glucose/day", {
        params: { memberId, date: dateISO },
      });
      setRecords(res.data || []);
    } catch (e) {
      console.error("day records load fail", e);
      setRecords([]);
      setErrorMsg("해당 날짜 기록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 작성
  const openCreate = () => {
    setFormMode("create");
    setFormOpen(true);
  };

  // 수정(첫번째)
  const openEditFirst = () => {
    if (!firstRecordId) return;
    setFormMode("edit");
    setFormOpen(true);
  };

  // 상세(첫번째)
  const openDetailFirst = async () => {
    if (!firstRecordId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // records에 상세 필드가 다 있으면 이 호출은 생략 가능
      const res = await api.get(`/glucose/${firstRecordId}`);
      setDetailRecord(res.data);
      setDetailOpen(true);
    } catch (e) {
      console.error("detail load fail", e);
      setErrorMsg("상세 조회에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 삭제(첫번째)
  const deleteFirst = async () => {
    if (!firstRecordId) return;
    if (!window.confirm("첫번째 기록을 삭제할까?")) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await api.delete(`/glucose/${firstRecordId}`);
      await fetchDayRecords();
      await onSaved?.(); // 캘린더/우측패널 집계 리프레시
      setExpanded(false);
    } catch (e) {
      console.error("delete fail", e);
      setErrorMsg("삭제에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 첫번째 기록 토글
  const onClickFirstRecord = () => {
    setExpanded((v) => !v);
  };

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="dm-backdrop" onClick={closeAll}>
      <div className="dm-panel" onClick={(e) => e.stopPropagation()}>
        <button className="dm-close" onClick={closeAll} type="button" aria-label="닫기">
          ×
        </button>

        {/* ===== 헤더 ===== */}
        <div className="dm-head">
          <div className="dm-brand">Good Sugar</div>
          <div className="dm-date">{dateISO}</div>
        </div>

        {/* ===== 요약 카드 ===== */}
        <div className="dm-card">
          <div className="dm-cardTitle">요약</div>

          {loading ? (
            <div className="dm-muted">불러오는 중...</div>
          ) : errorMsg ? (
            <div className="dm-muted">{errorMsg}</div>
          ) : hasRecord ? (
            <div className="dm-muted">기록 {records.length}개가 있어요.</div>
          ) : (
            <div className="dm-muted">이 날짜는 아직 기록이 없어요.</div>
          )}

          {/* summary가 있으면 짧게 보여주기 */}
          {summary && (
            <div style={{ marginTop: 10, color: "#666", fontWeight: 700 }}>
              {typeof summary.glucoseValue === "number" && (
                <span>공복 {summary.glucoseValue} · </span>
              )}
              <span>기록 {summary.recordCount ?? 0}개</span>
            </div>
          )}
        </div>

        {/* ===== 액션 영역 ===== */}
        {!hasRecord ? (
          <div className="dm-emptyCta">
            <div className="dm-emptyTitle">기록이 없어요</div>
            <div className="dm-emptyDesc">오늘의 혈당 기록을 남겨볼까요?</div>

            <button
              className="dm-btn primary big"
              onClick={openCreate}
              type="button"
              disabled={loading}
            >
              작성하기
            </button>
          </div>
        ) : (
          <>
            <div className="dm-topRow">
              <button
                className={`dm-btn ${expanded ? "active" : ""}`}
                onClick={onClickFirstRecord}
                type="button"
                disabled={loading}
                style={{ flex: 1 }}
              >
                첫번째 기록
              </button>

              <button
                className="dm-btn primary"
                onClick={openCreate}
                type="button"
                disabled={loading}
                style={{ width: 160 }}
              >
                작성하기
              </button>
            </div>

            {/* 펼쳐지는 액션바 */}
            {expanded && (
              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <button
                  className="dm-btn"
                  onClick={openEditFirst}
                  type="button"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  수정
                </button>
                <button
                  className="dm-btn danger"
                  onClick={deleteFirst}
                  type="button"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  삭제
                </button>
                <button
                  className="dm-btn"
                  onClick={openDetailFirst}
                  type="button"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  상세
                </button>
              </div>
            )}

            {records.length > 1 && (
              <div style={{ marginTop: 12, color: "#666", fontWeight: 700 }}>
                ※ 이 날짜에 기록이 {records.length}개 있어요. (리스트 UI는 다음 단계에서)
              </div>
            )}
          </>
        )}

        {/* ===== 2차 모달: 상세 ===== */}
        {detailOpen && (
          <RecordDetailModal
            record={detailRecord}
            onClose={() => setDetailOpen(false)}
          />
        )}

        {/* ===== 2차 모달: 작성/수정 ===== */}
        {formOpen && (
          <RecordFormModal
            mode={formMode}
            memberId={memberId}
            dateISO={dateISO}
            recordId={formMode === "edit" ? firstRecordId : null}
            initialRecord={formMode === "edit" ? firstRecord : null}
            onClose={() => setFormOpen(false)}
            onSuccess={async () => {
              setFormOpen(false);
              setExpanded(false);
              await fetchDayRecords();
              await onSaved?.();
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

/* =========================
   상세 모달
========================= */
function RecordDetailModal({ record, onClose }) {
  return createPortal(
    <div className="dm2-backdrop" onClick={onClose}>
      <div className="dm2-panel" onClick={(e) => e.stopPropagation()}>
        <button className="dm2-close" onClick={onClose} type="button" aria-label="닫기">
          ×
        </button>

        <div className="dm2-title">상세</div>

        {!record ? (
          <div className="dm-muted">상세 데이터가 없어요.</div>
        ) : (
          <div className="dm2-body">
            <pre className="dm-pre">{JSON.stringify(record, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* =========================
   작성/수정 모달 (기본 폼)
   ✅ 백엔드 DTO 필드명에 맞춤:
   - medicationYN 사용 (useMedicationYN 금지)
========================= */
function RecordFormModal({
  mode,            // "create" | "edit"
  memberId,
  dateISO,
  recordId,
  initialRecord,
  onClose,
  onSuccess,
}) {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ===== DTO 기반 =====
  const [glucoseValue, setGlucoseValue] = useState(initialRecord?.glucoseValue ?? "");
  const [measureTime, setMeasureTime] = useState(initialRecord?.measureTime ?? "08:00");
  const [measureType, setMeasureType] = useState(initialRecord?.measureType ?? "FASTING");

  const [exerciseYN, setExerciseYN] = useState(!!initialRecord?.exerciseYN);
  const [exerciseContents, setExerciseContents] = useState(initialRecord?.exerciseContents ?? "");
  const [drinkYN, setDrinkYN] = useState(!!initialRecord?.drinkYN);

  const [medicationYN, setMedicationYN] = useState(!!initialRecord?.medicationYN);
  const [medicationInfo, setMedicationInfo] = useState(initialRecord?.medicationInfo ?? "");

  const [injectionYN, setInjectionYN] = useState(!!initialRecord?.injectionYN);
  const [injectionInfo, setInjectionInfo] = useState(initialRecord?.injectionInfo ?? "");

  const [diet, setDiet] = useState(initialRecord?.diet ?? "");
  const [logContent, setLogContent] = useState(initialRecord?.logContent ?? "");

  // ✅ 필수: 당뇨 타입(자유입력)
  const [glucoseType, setGlucoseType] = useState(initialRecord?.glucoseType ?? "");

  const MEASURE = [
    ["FASTING", "공복"],
    ["BEFORE_MEAL", "식전"],
    ["AFTER_1H", "식후 1시간"],
    ["AFTER_2H", "식후 2시간"],
    ["UNKNOWN", "모름"],
  ];

  const SUGGEST_TYPES = ["1형", "2형", "1.5형", "전단계", "모름"];

  // 글자 길이 제한(컬럼 VARCHAR2(20)이라 20자 권장)
  const normalizeGlucoseType = (s) => s.replace(/\s+/g, " ").trim().slice(0, 20);

  const validate = () => {
    if (!memberId) return "memberId가 없어.";
    if (!dateISO) return "dateISO가 없어.";

    const gt = normalizeGlucoseType(glucoseType);
    if (!gt) return "당뇨 타입(1형/2형/전단계 등)을 입력하거나 선택해야 저장돼.";

    if (glucoseValue === "" || glucoseValue === null) return "혈당 값을 입력해줘.";
    const v = Number(glucoseValue);
    if (Number.isNaN(v)) return "혈당 값이 숫자가 아니야.";
    if (v <= 0) return "혈당 값이 0 이하야.";

    if (exerciseYN && !exerciseContents.trim()) return "운동 체크했으면 운동 내용을 적어줘.";
    if (medicationYN && !medicationInfo.trim()) return "약 체크했으면 약 정보를 적어줘.";
    if (injectionYN && !injectionInfo.trim()) return "주사 체크했으면 주사 정보를 적어줘.";

    return "";
  };

  const canSave = (() => {
    if (saving) return false;
    if (!normalizeGlucoseType(glucoseType)) return false;
    if (glucoseValue === "" || Number.isNaN(Number(glucoseValue)) || Number(glucoseValue) <= 0) return false;
    if (exerciseYN && !exerciseContents.trim()) return false;
    if (medicationYN && !medicationInfo.trim()) return false;
    if (injectionYN && !injectionInfo.trim()) return false;
    return true;
  })();

  const onSubmit = async () => {
    const msg = validate();
    if (msg) return setErrorMsg(msg);

    const payload = {
      memberId,
      measureDate: dateISO,
      measureTime,
      measureType,

      glucoseValue: Number(glucoseValue),

      drinkYN,

      exerciseYN,
      exerciseContents: exerciseYN ? exerciseContents.trim() : null,

      medicationYN,
      medicationInfo: medicationYN ? medicationInfo.trim() : null,

      injectionYN,
      injectionInfo: injectionYN ? injectionInfo.trim() : null,

      diet: diet.trim() ? diet.trim() : null,
      logContent: logContent.trim() ? logContent.trim() : null,

      // ✅ 필수 + 20자 제한
      glucoseType: normalizeGlucoseType(glucoseType),
    };

    setSaving(true);
    setErrorMsg("");

    try {
      if (mode === "create") {
        await api.post("/glucose", payload);
      } else {
        await api.put(`/glucose/${recordId}`, payload);
      }
      await onSuccess?.();
    } catch (e) {
      console.error(e);
      setErrorMsg("저장 실패(서버 로그 확인).");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="gs2-backdrop" onClick={onClose}>
      <div className="gs2-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gs2-head">
          <div className="gs2-title">
            {mode === "create" ? "혈당 기록 작성" : "혈당 기록 수정"}
            <div className="gs2-sub">{dateISO}</div>
          </div>
          <button className="gs2-x" onClick={onClose} type="button" aria-label="닫기">×</button>
        </div>

        {errorMsg && <div className="gs2-error">{errorMsg}</div>}

        {/* ✅ 필수: 당뇨 타입 */}
        <section className="gs2-card gs2-cardRequired">
          <div className="gs2-cardTitle">
            ✅ 당뇨 타입(자유 입력) <span className="gs2-required">*</span>
          </div>

          <div className="gs2-field">
            <label>예: 1형 / 2형 / 1.5형 / 전단계 / 모름</label>
            <input
              value={glucoseType}
              onChange={(e) => setGlucoseType(e.target.value)}
              placeholder="모르면 '모름' 누르기"
              className={!normalizeGlucoseType(glucoseType) ? "gs2-invalid" : ""}
              maxLength={20}
            />

            <div className="gs2-chipRow">
              {SUGGEST_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`gs2-chip ${normalizeGlucoseType(glucoseType) === t ? "on" : ""}`}
                  onClick={() => setGlucoseType(t)}
                  disabled={saving}
                >
                  {t}
                </button>
              ))}
            </div>

            {!normalizeGlucoseType(glucoseType) && (
              <div className="gs2-help danger">
                이 값은 필수야. 모르면 <b>모름</b> 누르면 돼.
              </div>
            )}

            <div className="gs2-help">
              최대 20자. (DB 컬럼 VARCHAR2(20))
            </div>
          </div>
        </section>

        {/* 🩸 혈당 */}
        <section className="gs2-card">
          <div className="gs2-cardTitle">🩸 혈당</div>

          <div className="gs2-grid2">
            <div className="gs2-field">
              <label>혈당 값 (mg/dL)</label>
              <input
                type="number"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                placeholder="예: 95"
                className={(glucoseValue === "" || Number(glucoseValue) <= 0) ? "gs2-invalid" : ""}
              />
            </div>

            <div className="gs2-field">
              <label>측정 시간</label>
              <input
                type="time"
                value={measureTime}
                onChange={(e) => setMeasureTime(e.target.value)}
              />
            </div>
          </div>

          <div className="gs2-field" style={{ marginTop: 12 }}>
            <label>측정 유형 (MeasureType)</label>
            <div className="gs2-pillRow">
              {MEASURE.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`gs2-pill ${measureType === val ? "on" : ""}`}
                  onClick={() => setMeasureType(val)}
                  disabled={saving}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 🏃 생활 */}
        <section className="gs2-card">
          <div className="gs2-cardTitle">🏃 생활</div>

          <div className="gs2-toggleGrid">
            <Toggle label="운동" checked={exerciseYN} onChange={setExerciseYN} disabled={saving} />
            <Toggle label="음주" checked={drinkYN} onChange={setDrinkYN} disabled={saving} />
            <Toggle label="약" checked={medicationYN} onChange={setMedicationYN} disabled={saving} />
            <Toggle label="주사" checked={injectionYN} onChange={setInjectionYN} disabled={saving} />
          </div>

          <div className={`gs2-reveal ${exerciseYN ? "open" : ""}`}>
            <div className="gs2-field" style={{ marginTop: 12 }}>
              <label>운동 내용 <span className="gs2-required">*</span></label>
              <textarea
                value={exerciseContents}
                onChange={(e) => setExerciseContents(e.target.value)}
                placeholder="예: 30분 걷기"
                className={exerciseYN && !exerciseContents.trim() ? "gs2-invalid" : ""}
              />
            </div>
          </div>

          <div className={`gs2-reveal ${medicationYN ? "open" : ""}`}>
            <div className="gs2-field" style={{ marginTop: 12 }}>
              <label>약 정보 <span className="gs2-required">*</span></label>
              <input
                value={medicationInfo}
                onChange={(e) => setMedicationInfo(e.target.value)}
                placeholder="예: 메트포르민 1정"
                className={medicationYN && !medicationInfo.trim() ? "gs2-invalid" : ""}
              />
            </div>
          </div>

          <div className={`gs2-reveal ${injectionYN ? "open" : ""}`}>
            <div className="gs2-field" style={{ marginTop: 12 }}>
              <label>주사 정보 <span className="gs2-required">*</span></label>
              <input
                value={injectionInfo}
                onChange={(e) => setInjectionInfo(e.target.value)}
                placeholder="예: 인슐린 6U"
                className={injectionYN && !injectionInfo.trim() ? "gs2-invalid" : ""}
              />
            </div>
          </div>
        </section>

        {/* 🍽 식단 */}
        <section className="gs2-card">
          <div className="gs2-cardTitle">🍽 식단</div>
          <div className="gs2-field">
            <label>식단 메모</label>
            <textarea
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="예: 현미밥/계란/샐러드"
            />
          </div>
        </section>

        {/* 📝 메모 */}
        <section className="gs2-card">
          <div className="gs2-cardTitle">📝 하루 기록</div>
          <div className="gs2-field">
            <label>메모</label>
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="예: 컨디션, 스트레스, 특이사항"
            />
          </div>
        </section>

        <div className="gs2-foot">
          <button className="gs2-btn" onClick={onClose} type="button" disabled={saving}>취소</button>
          <button className="gs2-btn primary" onClick={onSubmit} type="button" disabled={!canSave}>
            {saving ? "저장중..." : "저장"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`gs2-toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="gs2-toggleDot" />
      <span className="gs2-toggleLabel">{label}</span>
    </button>
  );
}
