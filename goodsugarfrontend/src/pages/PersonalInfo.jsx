import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "../styles/PersonalInfo.css";

import DefaultProfile from "../assets/LOGOLOGINICON.png";

const BACKEND = "http://localhost:12345";

function resolveImgSrc(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return BACKEND + pathOrUrl; // "/myPage/profile/xxx.png"
}

export default function PersonalInfo() {
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    nickname: "",
    name: "",
    gender: "",
    memberBirth: "",
    profileImg: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/members/me");
        const me = res.data;
        setForm({
          email: me.email ?? "",
          nickname: me.nickname ?? "",
          name: me.name ?? "",
          gender: me.gender ?? "",
          memberBirth: (me.memberBirth ?? "").slice(0, 10),
          profileImg: me.profileImg ?? "",
        });
      } catch (e) {
        console.error(e);
        setError("내 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openPicker = () => {
    if (uploading) return;
    fileRef.current?.click();
  };

  // ✅ 파일 고르면 즉시 업로드 (정석 UX)
  const onPicked = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ok = ["image/png", "image/jpeg", "image/webp"];
    if (!ok.includes(f.type)) {
      alert("png/jpg/webp만 가능");
      e.target.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("5MB 이하만 가능");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", f);

      // ✅ 여기 404 뜨던 곳. 백엔드 컨트롤러 경로랑 반드시 동일해야 함.
      const res = await api.post("/api/members/me/profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.ok) {
        setError("업로드에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      setForm((p) => ({ ...p, profileImg: res.data.profileImg }));
    } catch (err) {
      console.error(err);
      setError("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSave = async () => {
    setError("");
    try {
      const payload = {
        nickname: form.nickname,
        name: form.name,
        gender: form.gender,
        memberBirth: form.memberBirth || null,
      };
      await api.put("/api/members/me", payload);
      alert("저장 완료!");
    } catch (e) {
      console.error(e);
      setError("저장에 실패했습니다.");
    }
  };

  if (loading) return null;

  const avatarSrc = form.profileImg ? resolveImgSrc(form.profileImg) : DefaultProfile;

  return (
    <div className="pi-wrap">
      <div className="pi-card">
        <div className="pi-title">개인정보 수정</div>
        <div className="pi-sub">프로필은 파일 업로드로 변경합니다.</div>

        {error && <div className="pi-error">{error}</div>}

        {/* ✅ “프로필 이미지” 텍스트 아래에 아이콘 배치 */}
        <div className="pi-profileBox">
          <div className="pi-profileLabelRow">
            <div className="pi-profileLabel">   프로필 이미지</div>
            <div className="pi-profileHint">{uploading ? "업로드 중..." : ""}</div>
          </div>

          <button type="button" className="pi-profileIconBtn" onClick={openPicker} disabled={uploading}>
            <img src={avatarSrc} className="pi-profileIcon" alt="profile" />
          </button>

          <input
            ref={fileRef}
            className="pi-hiddenFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPicked}
          />
        </div>

        {/* 아래는 기존 입력 UI 유지 */}
        <div className="pi-grid">
          <div className="pi-field">
            <label className="pi-label">이메일 (수정 불가)</label>
            <input className="pi-input pi-readonly" value={form.email} readOnly />
          </div>

          <div className="pi-field">
            <label className="pi-label">닉네임</label>
            <input className="pi-input" value={form.nickname} onChange={(e)=>setForm(p=>({...p,nickname:e.target.value}))}/>
          </div>

          <div className="pi-field">
            <label className="pi-label">이름</label>
            <input className="pi-input" value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))}/>
          </div>

          <div className="pi-field">
            <label className="pi-label">성별</label>
            <select className="pi-input" value={form.gender} onChange={(e)=>setForm(p=>({...p,gender:e.target.value}))}>
              <option value="">선택 안 함</option>
              <option value="M">남</option>
              <option value="F">여</option>
            </select>
          </div>

          <div className="pi-field">
            <label className="pi-label">생년월일</label>
            <input type="date" className="pi-input" value={form.memberBirth} onChange={(e)=>setForm(p=>({...p,memberBirth:e.target.value}))}/>
          </div>
        </div>

        <div className="pi-actions">
          <button className="pi-btn" type="button" onClick={onSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
