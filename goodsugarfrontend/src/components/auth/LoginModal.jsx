import { useState } from "react";
import ModalBase from "../common/ModalBase";
import api from "../../api/axios";
import SignupModal from "./SignupModal";
import Logo from "../../assets/LOGO.png";
import "../../styles/LoginModal.css";

const BACKEND = "http://localhost:12345"; // 백엔드 서버 주소 (oauth redirect용)

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

      // ✅ 너 백엔드 컨트롤러 기준: POST /member/login
      // ✅ DTO(LoginRequest) 필드명이 memberEmail/memberPw 라는 가정 (프론트와 맞춤)
      const res = await api.post("/member/login", form);

      // res.data = Member (컨트롤러가 Member 그대로 반환)
      // 너 프로젝트 Member 필드명에 맞춰서 필요 값만 전달
      onLoginSuccess?.({
        memberNo: res.data.memberNo ?? res.data.memberId ?? res.data.memberNo,
        nickname: res.data.nickname ?? res.data.memberNickname,
        profileImg: res.data.profileImg,
        raw: res.data,
      });

      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  // ✅ OAuth: 백엔드에 Spring Security oauth2 설정이 있을 때만 동작
  // 백엔드의 oauth2 authorization endpoint가 이 경로여야 함.
  const goOAuth = (provider) => {
    window.location.href = `${BACKEND}/oauth2/authorization/${provider}`;
  };

  return (
    <>
      <ModalBase open={open} onClose={onClose} panelClassName="dm-panel--sm">
        <div className="loginM">
          {/* ✅ 로고 + Good Sugar 같은 줄, 덩어리 전체 중앙 */}
          <div className="loginM__brandWrap">
            <div className="loginM__brandRow">
              <img src={Logo} alt="Good Sugar" className="loginM__logo" />
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

          <div className="loginM__footnote">메일 인증을 통해 회원가입이 진행됩니다.</div>
        </div>
      </ModalBase>

      <SignupModal open={openSignup} onClose={() => setOpenSignup(false)} />
    </>
  );
}
