import { useState } from "react";
import ModalBase from "../common/ModalBase";
import api from "../../api/axios";
import SignupModal from "./SignupModal";
import Logo from "../../assets/LOGO.png";

const BACKEND = "http://localhost:12345"; // ✅ 백엔드 주소

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const [form, setForm] = useState({ memberEmail: "", memberPw: "" });
  const [openSignup, setOpenSignup] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);

      onLoginSuccess({
        memberNo: res.data.memberNo,
        nickname: res.data.memberNickname,
        profileImg: res.data.profileImg,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("로그인 실패");
    }
  };

  // ✅ OAuth 시작 URL (중요: /api 붙이면 안 됨)
  const goOAuth = (provider) => {
    window.location.href = `${BACKEND}/oauth2/authorization/${provider}`;
  };

  if (!open) return null;

  return (
    <>
      <ModalBase open={open} onClose={onClose}>
        <div className="modal-brand">
          <img src={Logo} alt="Good Sugar" className="modal-brand-logo" />
          <div className="modal-brand-title">Good Sugar</div>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            className="modal-input"
            name="memberEmail"
            value={form.memberEmail}
            onChange={onChange}
            placeholder="이메일"
          />
          <input
            className="modal-input"
            type="password"
            name="memberPw"
            value={form.memberPw}
            onChange={onChange}
            placeholder="비밀번호"
          />

          <button className="modal-btn modal-btn-primary" type="submit">
            로그인
          </button>

          <button
            className="modal-btn modal-btn-outline"
            type="button"
            onClick={() => setOpenSignup(true)}
          >
            회원가입
          </button>
        </form>

        <div className="modal-footer-text">메일 인증을 통해 회원가입이 진행됩니다.</div>

        <div className="modal-divider">또는</div>

        <div style={{ display: "grid", gap: 10 }}>
          <button
            className="social-btn social-google"
            type="button"
            onClick={() => goOAuth("google")}
          >
            Google로 계속하기
          </button>

          <button
            className="social-btn social-kakao"
            type="button"
            onClick={() => goOAuth("kakao")}
          >
            카카오로 계속하기
          </button>

          <button
            className="social-btn social-naver"
            type="button"
            onClick={() => goOAuth("naver")}
          >
            네이버로 계속하기
          </button>
        </div>
      </ModalBase>

      <SignupModal open={openSignup} onClose={() => setOpenSignup(false)} />
    </>
  );
}
