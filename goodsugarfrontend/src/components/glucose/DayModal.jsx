import { useEffect, useMemo, useState } from "react";
import ModalBase from "../common/ModalBase";
import api from "../../api/axios";
import "../../styles/DayModal.css";

const MEASURE_TYPES = [
  { value: "FASTING", label: "공복" },
  { value: "BEFORE_MEAL", label: "식전" },
  { value: "AFTER_1H", label: "식후 1시간" },
  { value: "AFTER_2H", label: "식후 2시간" },
  { value: "UNKNOWN", label: "모름" },
];

const GLUCOSE_TYPES = [
  { value: "STEP_1", label: "1단계" },
  { value: "STEP_1_5", label: "1.5단계" },
  { value: "STEP_2", label: "2단계" },
  { value: "PREV_STEP", label: "전단계" },
  { value: "UNKNOWN", label: "모름" },
];

const rid = (r) =>
  r?.recordId ?? r?.glucoseRecordId ?? r?.glucoseRecordNo ?? r?.id ?? null;

const toHHmm = (t) => (t ? String(t).slice(0, 5) : "");
const safeStr = (v) => (v == null ? "" : String(v));

function labelMeasure(measureType) {
  return MEASURE_TYPES.find((x) => x.value === measureType)?.label ?? "모름";
}
function labelGType(glucoseType) {
  return GLUCOSE_TYPES.find((x) => x.value === glucoseType)?.label ?? "모름";
}

export default function DayModal({ open, onClose, memberId, dateISO, onSaved }) {
  const [mode, setMode] = useState("menu"); // menu | form | detail
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const emptyForm = useMemo(
    () => ({
      recordId: null,
      memberId,
      glucoseValue: "",
      drinkYN: false,
      exerciseYN: false,
      exerciseContents: "",
      measureDate: dateISO,
      measureTime: "",
      measureType: "FASTING",
      medicationYN: false,
      medicationInfo: "",
      injectionYN: false,
      injectionInfo: "",
      diet: "",
      logContent: "",
      glucoseType: "UNKNOWN",
    }),
    [memberId, dateISO]
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    setMode("menu");
    setSelectedId(null);
    setForm(emptyForm);
    fetchDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateISO, memberId]);

  async function fetchDay() {
    if (!memberId || !dateISO) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/glucose/day", {
        params: { memberId, date: dateISO },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setRecords(list);
      setSelectedId(rid(list[0]) ?? null);
    } catch (e) {
      console.error(e);
      setErrorMsg("기록을 불러오지 못했어요.");
      setRecords([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }

  const selected = useMemo(() => {
    return records.find((r) => String(rid(r)) === String(selectedId)) || null;
  }, [records, selectedId]);

  const summary = useMemo(() => {
    const count = records.length;
    const fasting = records.find((r) => r.measureType === "FASTING")?.glucoseValue ?? null;
    const hasDrink = records.some((r) => r.drinkYN);
    const hasMed = records.some((r) => r.medicationYN);
    const hasInj = records.some((r) => r.injectionYN);
    const hasEx = records.some((r) => r.exerciseYN);
    return { count, fasting, hasDrink, hasMed, hasInj, hasEx };
  }, [records]);

  const hasFastingAlready = useMemo(
    () => (records || []).some((r) => r?.measureType === "FASTING"),
    [records]
  );

  function startCreate() {
    setErrorMsg("");
    setForm({
      ...emptyForm,
      // 공복이 이미 있으면 기본 구분을 식전으로 내려서 UX 편하게
      measureType: hasFastingAlready ? "BEFORE_MEAL" : "FASTING",
    });
    setMode("form");
  }

  function startEdit(r) {
    setErrorMsg("");
    setForm({
      recordId: rid(r),
      memberId: r.memberId,
      glucoseValue: r.glucoseValue ?? "",
      drinkYN: !!r.drinkYN,
      exerciseYN: !!r.exerciseYN,
      exerciseContents: safeStr(r.exerciseContents),
      measureDate: dateISO,
      measureTime: toHHmm(r.measureTime),
      measureType: r.measureType ?? "UNKNOWN",
      medicationYN: !!r.medicationYN,
      medicationInfo: safeStr(r.medicationInfo),
      injectionYN: !!r.injectionYN,
      injectionInfo: safeStr(r.injectionInfo),
      diet: safeStr(r.diet),
      logContent: safeStr(r.logContent),
      glucoseType: r.glucoseType ?? "UNKNOWN",
    });
    setMode("form");
  }

  function openDetail(r) {
    setSelectedId(rid(r));
    setMode("detail");
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((p) => {
      if (name === "exerciseYN") {
        return { ...p, exerciseYN: checked, exerciseContents: checked ? p.exerciseContents : "" };
      }
      if (name === "medicationYN") {
        return { ...p, medicationYN: checked, medicationInfo: checked ? p.medicationInfo : "" };
      }
      if (name === "injectionYN") {
        return { ...p, injectionYN: checked, injectionInfo: checked ? p.injectionInfo : "" };
      }
      return { ...p, [name]: type === "checkbox" ? checked : value };
    });
  }

  function normalizePayload(f) {
    return {
      recordId: f.recordId || null,
      memberId: f.memberId,
      glucoseValue: f.glucoseValue === "" ? null : Number(f.glucoseValue),

      drinkYN: !!f.drinkYN,
      exerciseYN: !!f.exerciseYN,
      exerciseContents: f.exerciseYN ? (f.exerciseContents?.trim() || null) : null,

      measureDate: f.measureDate,
      measureTime: f.measureTime?.trim() ? f.measureTime : null,
      measureType: f.measureType,

      medicationYN: !!f.medicationYN,
      medicationInfo: f.medicationYN ? (f.medicationInfo?.trim() || null) : null,

      injectionYN: !!f.injectionYN,
      injectionInfo: f.injectionYN ? (f.injectionInfo?.trim() || null) : null,

      diet: f.diet?.trim() || null,
      logContent: f.logContent?.trim() || null,

      glucoseType: f.glucoseType?.trim() || "UNKNOWN",
    };
  }

  async function removeRecord(id) {
    if (!id) return;
    if (!window.confirm("삭제할까요?")) return;

    setErrorMsg("");
    try {
      await api.delete(`/glucose/${id}`);
      await fetchDay();
      onSaved?.();
    } catch (e) {
      console.error(e);
      setErrorMsg("삭제에 실패했어요.");
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (saving) return;

    setErrorMsg("");

    // ✅ 공복 하루 1회 제한 (신규 작성일 때만)
    if (!form.recordId && form.measureType === "FASTING" && hasFastingAlready) {
      setErrorMsg("공복은 하루에 1번만 입력할 수 있어요.");
      return;
    }

    if (!form.measureDate) {
      setErrorMsg("날짜가 비어있어요.");
      return;
    }

    setSaving(true);
    try {
      const payload = normalizePayload(form);

      if (form.recordId) {
        await api.put(`/glucose/${form.recordId}`, payload);
      } else {
        await api.post("/glucose", payload);
      }

      await fetchDay();
      onSaved?.();
      setMode("menu");
    } catch (e2) {
      console.error(e2);
      setErrorMsg("저장/수정 실패.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <div className="dm-wrap" role="dialog" aria-modal="true">
        <header className="dm-head">
          <div>
            <div className="dm-title">Good Sugar</div>
            <div className="dm-sub">선택 날짜: {dateISO}</div>
          </div>
          <button className="dm-x" onClick={onClose} aria-label="닫기" type="button">
            ✕
          </button>
        </header>

        {errorMsg && <div className="dm-alert">{errorMsg}</div>}

        {mode === "menu" && (
          <>
            <section className="dm-summary">
              <div className="dm-summaryTop">
                <div className="dm-summaryLeft">
                  <div className="dm-summaryTitle">요약</div>
                  <div className="dm-summaryMeta">
                    {loading ? "불러오는 중..." : `오늘 기록 ${summary.count}개`}
                    <span className="dm-dot">·</span>
                    공복 <b className="dm-fast">{summary.fasting ?? "-"}</b>
                  </div>
                </div>

                <button className="dm-primary" onClick={startCreate} type="button">
                  작성하기
                </button>
              </div>

              <div className="dm-badges">
                <span className={`dm-badge ${summary.hasEx ? "on" : ""}`}>🏃 운동</span>
                <span className={`dm-badge ${summary.hasDrink ? "on" : ""}`}>🍺 음주</span>
                <span className={`dm-badge ${summary.hasMed ? "on" : ""}`}>💊 약</span>
                <span className={`dm-badge ${summary.hasInj ? "on" : ""}`}>💉 주사</span>
              </div>
            </section>

            <section className="dm-list">
              {records.length === 0 ? (
                <div className="dm-empty">아직 기록이 없어요. “작성하기”로 추가해봐.</div>
              ) : (
                <ul className="dm-ul">
                  {records.map((r, idx) => {
                    const id = rid(r);

                    return (
                      <li key={id ? `rid-${id}` : `idx-${idx}`} className="dm-item">
                        <button
                          className="dm-itemMain"
                          type="button"
                          onClick={() => openDetail(r)}
                        >
                          <div className="dm-row1">
                            <span className="dm-no">#{idx + 1}</span>
                            <span className="dm-time">{toHHmm(r.measureTime) || "시간없음"}</span>
                          </div>

                          <div className="dm-row2">
                            <span className="dm-pill">혈당 {r.glucoseValue ?? "-"}</span>
                            <span className="dm-pill">{labelMeasure(r.measureType)}</span>
                            <span className="dm-pill">{labelGType(r.glucoseType)}</span>
                          </div>

                          <div className="dm-row3">
                            {(r.exerciseYN ? "🏃" : "")}
                            {(r.drinkYN ? " 🍺" : "")}
                            {(r.medicationYN ? " 💊" : "")}
                            {(r.injectionYN ? " 💉" : "")}
                          </div>
                        </button>

                        <div className="dm-actions">
                          <button className="dm-ghost" type="button" onClick={() => startEdit(r)}>
                            수정
                          </button>
                          <button className="dm-ghost danger" type="button" onClick={() => removeRecord(id)}>
                            삭제
                          </button>
                          <button className="dm-ghost" type="button" onClick={() => openDetail(r)}>
                            상세
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}

        {mode === "detail" && selected && (
          <section className="dm-detail">
            <div className="dm-detailTop">
              <div className="dm-detailTitle">상세</div>
              <div className="dm-detailBtns">
                <button className="dm-ghost" type="button" onClick={() => startEdit(selected)}>
                  수정
                </button>
                <button
                  className="dm-ghost danger"
                  type="button"
                  onClick={() => removeRecord(rid(selected))}
                >
                  삭제
                </button>
                <button className="dm-ghost" type="button" onClick={() => setMode("menu")}>
                  목록
                </button>
              </div>
            </div>

            <div className="dm-grid">
              <div className="dm-card">
                <div className="dm-cardT">기본</div>
                <div className="dm-row"><span>시간</span><b>{toHHmm(selected.measureTime) || "-"}</b></div>
                <div className="dm-row"><span>혈당</span><b>{selected.glucoseValue ?? "-"}</b></div>
                <div className="dm-row"><span>구분</span><b>{labelMeasure(selected.measureType)}</b></div>
                <div className="dm-row"><span>타입</span><b>{labelGType(selected.glucoseType)}</b></div>
              </div>

              <div className="dm-card">
                <div className="dm-cardT">생활</div>
                <div className="dm-row"><span>음주</span><b>{selected.drinkYN ? "Y" : "N"}</b></div>
                <div className="dm-row"><span>운동</span><b>{selected.exerciseYN ? "Y" : "N"}</b></div>
                <div className="dm-row"><span>운동내용</span><b>{selected.exerciseContents || "-"}</b></div>
                <div className="dm-row"><span>식단</span><b>{selected.diet || "-"}</b></div>
              </div>

              <div className="dm-card">
                <div className="dm-cardT">약/주사</div>
                <div className="dm-row"><span>약</span><b>{selected.medicationYN ? "Y" : "N"}</b></div>
                <div className="dm-row"><span>약 정보</span><b>{selected.medicationInfo || "-"}</b></div>
                <div className="dm-row"><span>주사</span><b>{selected.injectionYN ? "Y" : "N"}</b></div>
                <div className="dm-row"><span>주사 정보</span><b>{selected.injectionInfo || "-"}</b></div>
              </div>

              <div className="dm-card full">
                <div className="dm-cardT">메모</div>
                <div className="dm-memo">{selected.logContent || "메모 없음"}</div>
              </div>
            </div>
          </section>
        )}

        {mode === "form" && (
          <form className="dm-form" onSubmit={submit}>
            <div className="dm-formTop">
              <div className="dm-formTitle">{form.recordId ? "기록 수정" : "기록 작성"}</div>
              <div className="dm-formBtns">
                <button type="button" className="dm-ghost" onClick={() => setMode("menu")} disabled={saving}>
                  취소
                </button>
                <button type="submit" className="dm-primary" disabled={saving}>
                  {saving ? "저장중..." : "저장하기"}
                </button>
              </div>
            </div>

            <div className="dm-formGrid">
              <label className="dm-field">
                <span>혈당</span>
                <input
                  name="glucoseValue"
                  value={form.glucoseValue}
                  onChange={onChange}
                  placeholder="예: 110"
                  inputMode="numeric"
                />
              </label>

              <label className="dm-field">
                <span>측정 구분</span>
                <select name="measureType" value={form.measureType} onChange={onChange}>
                  {MEASURE_TYPES.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      disabled={!form.recordId && t.value === "FASTING" && hasFastingAlready}
                    >
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="dm-field">
                <span>시간(선택)</span>
                <input name="measureTime" type="time" value={form.measureTime} onChange={onChange} />
              </label>

              <label className="dm-field">
                <span>혈당 타입(필수)</span>
                <select name="glucoseType" value={form.glucoseType} onChange={onChange} required>
                  {GLUCOSE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>

              <div className="dm-switchRow">
                <label className="dm-switch">
                  <input type="checkbox" name="drinkYN" checked={form.drinkYN} onChange={onChange} />
                  <span>🍺 음주</span>
                </label>

                <label className="dm-switch">
                  <input type="checkbox" name="exerciseYN" checked={form.exerciseYN} onChange={onChange} />
                  <span>🏃 운동</span>
                </label>

                <label className="dm-switch">
                  <input type="checkbox" name="medicationYN" checked={form.medicationYN} onChange={onChange} />
                  <span>💊 약</span>
                </label>

                <label className="dm-switch">
                  <input type="checkbox" name="injectionYN" checked={form.injectionYN} onChange={onChange} />
                  <span>💉 주사</span>
                </label>
              </div>

              <label className={`dm-field ${!form.exerciseYN ? "disabled" : ""}`}>
                <span>운동 내용(선택)</span>
                <input
                  name="exerciseContents"
                  value={form.exerciseContents}
                  onChange={onChange}
                  placeholder="안 써도 됨"
                  disabled={!form.exerciseYN}
                />
              </label>

              <label className={`dm-field ${!form.medicationYN ? "disabled" : ""}`}>
                <span>약 정보(선택)</span>
                <input
                  name="medicationInfo"
                  value={form.medicationInfo}
                  onChange={onChange}
                  placeholder="안 써도 됨"
                  disabled={!form.medicationYN}
                />
              </label>

              <label className={`dm-field ${!form.injectionYN ? "disabled" : ""}`}>
                <span>주사 정보(선택)</span>
                <input
                  name="injectionInfo"
                  value={form.injectionInfo}
                  onChange={onChange}
                  placeholder="안 써도 됨"
                  disabled={!form.injectionYN}
                />
              </label>

              <label className="dm-field full">
                <span>식단(선택)</span>
                <input name="diet" value={form.diet} onChange={onChange} placeholder="예: 샐러드/밥/빵..." />
              </label>

              <label className="dm-field full">
                <span>메모(선택)</span>
                <textarea
                  name="logContent"
                  value={form.logContent}
                  onChange={onChange}
                  placeholder="오늘 컨디션/특이사항 등"
                  rows={4}
                />
              </label>
            </div>
          </form>
        )}
      </div>
    </ModalBase>
  );
}
