import { useState } from "react";
import ModalBase from "../common/ModalBase";
import api from "../../api/axios";
import SignupModal from "./SignupModal";
import Logo from "../../assets/LOGO.png";
import "../../styles/LoginModal.css";

const BACKEND = "http://localhost:12345";

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const [form, setForm] = useState({ memberEmail: "", memberPw: "" });
  const [openSignup, setOpenSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const payload = { email: form.memberEmail, password: form.memberPw };
      const res = await api.post("/api/member/login", payload);

      const { member, accessToken } = res.data || {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);

      onLoginSuccess?.({
        memberId: member?.memberId,
        nickname: member?.nickname,
        profileImg: member?.profileImg,
        raw: member,
      });

      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const goOAuth = (provider) => {
    window.location.href = `${BACKEND}/oauth2/authorization/${provider}`;
  };

  return (
    <>
      <ModalBase open={open} onClose={onClose} panelClassName="dm-panel--auth">
        <div className="loginM">
          <div className="loginM__brandWrap">
            <div className="loginM__brandRow">
              {/* ✅ 클래스 강제 (CSS 미적용시도 방지용으로 style fallback도 넣음) */}
              <img
                src={Logo}
                alt="Good Sugar"
                className="loginM__logo"
                style={{ width: 42, height: 42, objectFit: "contain" }}
              />
              <span className="loginM__title">Good Sugar</span>
            </div>
          </div>

          <form className="loginM__form" onSubmit={onSubmit}>
            <label className="loginM__label">
              <span>이메일</span>
              <input
                className="loginM__input"
                name="memberEmail"
                value={form.memberEmail}
                onChange={onChange}
                placeholder="example@email.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="loginM__label">
              <span>비밀번호</span>
              <input
                className="loginM__input"
                type="password"
                name="memberPw"
                value={form.memberPw}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <button
              className="loginM__btn loginM__btn--primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>

            <button
              type="button"
              className="loginM__btn loginM__btn--outline"
              onClick={() => setOpenSignup(true)}
            >
              회원가입
            </button>
          </form>

          <div className="loginM__divider">
            <span>또는</span>
          </div>

          <div className="loginM__social">
            <button
              type="button"
              className="loginM__socialBtn google"
              onClick={() => goOAuth("google")}
            >
              Google로 계속하기
            </button>

            <button
              type="button"
              className="loginM__socialBtn kakao"
              onClick={() => goOAuth("kakao")}
            >
              카카오로 계속하기
            </button>

            <button
              type="button"
              className="loginM__socialBtn naver"
              onClick={() => goOAuth("naver")}
            >
              네이버로 계속하기
            </button>
          </div>

          <div className="loginM__footnote">
            메일 인증을 통해 회원가입이 진행됩니다.
          </div>
        </div>
      </ModalBase>

      <SignupModal open={openSignup} onClose={() => setOpenSignup(false)} />
    </>
  );
}
