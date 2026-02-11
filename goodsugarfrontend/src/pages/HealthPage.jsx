// src/pages/HealthPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "../styles/HealthPage.css";

const emptyForm = {
  diabetesType: "",
  diagnoseAt: "",
  hba1cValue: "",
  hba1cDate: "",
  weight: "",
  medicationInfo: "",
  hasComplication: false,
  familyHistoryYn: false,
};

function toBoolYN(v) {
  return v === "Y" || v === true;
}
function yn(b) {
  return b ? "Y" : "N";
}
function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [exists, setExists] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const headerText = useMemo(() => {
    if (loading) return "";
    return exists
      ? "내 건강정보를 수정할 수 있어요."
      : "아직 건강정보가 없어요. 지금 작성해보세요.";
  }, [loading, exists]);

  const loadProfile = async () => {
    const res = await api.get("/api/health/profile"); // ✅ /api 포함
    return res.data;
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await loadProfile();

        if (!data) {
          setExists(false);
          setForm(emptyForm);
          setUpdatedAt(null);
        } else {
          setExists(true);
          setForm({
            diabetesType: data.diabetesType ?? "",
            diagnoseAt: data.diagnoseAt ?? "",
            hba1cValue: data.hba1cValue ?? "",
            hba1cDate: data.hba1cDate ?? "",
            weight: data.weight ?? "",
            medicationInfo: data.medicationInfo ?? "",
            hasComplication: toBoolYN(data.hasComplication),
            familyHistoryYn: toBoolYN(data.familyHistoryYn),
          });
          setUpdatedAt(data.updatedAt ?? null);
        }
      } catch (e) {
        console.error(e);
        alert("건강정보를 불러오지 못했습니다. (로그인/토큰 확인)");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSave = async () => {
    try {
      setSaving(true);

      const payload = {
        diabetesType: form.diabetesType.trim() || null,
        diagnoseAt: form.diagnoseAt || null,
        hba1cValue: numOrNull(form.hba1cValue),
        hba1cDate: form.hba1cDate || null,
        weight: numOrNull(form.weight),
        medicationInfo: form.medicationInfo.trim() || null,
        hasComplication: yn(form.hasComplication),
        familyHistoryYn: yn(form.familyHistoryYn),
      };

      await api.put("/api/health/profile", payload); // ✅ /api 포함

      const data = await loadProfile();
      setExists(!!data);
      setUpdatedAt(data?.updatedAt ?? null);

      alert("저장 완료!");
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="health-page">
      <div className="health-card">
        <div className="health-head">
          <div>
            <h1>건강 정보</h1>
            <p className="sub">{headerText}</p>
            {updatedAt && (
              <p className="meta">
                마지막 수정: {String(updatedAt).replace("T", " ")}
              </p>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={onSave}
            disabled={saving || loading}
          >
            {saving ? "저장중..." : "저장"}
          </button>
        </div>

        {loading ? (
          <div className="skeleton">불러오는 중...</div>
        ) : (
          <div className="grid">
            {/* 1) 당뇨 타입 */}
            <div className="field span2">
              <label>당뇨 타입(자유입력)</label>
              <input
                name="diabetesType"
                value={form.diabetesType}
                onChange={onChange}
                placeholder="예: 제2형 / 임신성 / 모름 등"
              />
            </div>

            {/* 2) 진단 시기 */}
            <div className="field">
              <label>진단 시기</label>
              <input
                type="date"
                name="diagnoseAt"
                value={form.diagnoseAt}
                onChange={onChange}
              />
            </div>

            {/* 3) 몸무게 */}
            <div className="field">
              <label>몸무게(kg)</label>
              <input
                type="number"
                step="0.01"
                name="weight"
                value={form.weight}
                onChange={onChange}
                placeholder="예: 72.30"
              />
            </div>

            {/* 4) HbA1c */}
            <div className="field">
              <label>HbA1c 수치</label>
              <input
                type="number"
                step="0.01"
                name="hba1cValue"
                value={form.hba1cValue}
                onChange={onChange}
                placeholder="예: 6.50"
              />
            </div>

            <div className="field">
              <label>HbA1c 검사일</label>
              <input
                type="date"
                name="hba1cDate"
                value={form.hba1cDate}
                onChange={onChange}
              />
            </div>

            {/* 5) 복용약 */}
            <div className="field span2">
              <label>복용약(자유입력)</label>
              <input
                name="medicationInfo"
                value={form.medicationInfo}
                onChange={onChange}
                placeholder="예: 메트포르민 500mg"
              />
            </div>

            {/* ✅ 6) 체크(토글) — 맨 아래 */}
            <div className="switch-row">
              <div className="switch-item">
                <div className="switch-text">
                  <div className="switch-title">합병증</div>
                  <div className="switch-desc">해당되면 켜기</div>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="hasComplication"
                    checked={form.hasComplication}
                    onChange={onChange}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="switch-item">
                <div className="switch-text">
                  <div className="switch-title">가족력(유전)</div>
                  <div className="switch-desc">
                    가족 중 당뇨 진단 이력이 있으면 켜기
                  </div>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="familyHistoryYn"
                    checked={form.familyHistoryYn}
                    onChange={onChange}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

