import { useMemo, useState } from "react";
import ModalBase from "../common/ModalBase";
import api from "../../api/axios";
import "../../styles/SignupModal.css";

export default function SignupModal({ open, onClose }) {
  const [form, setForm] = useState({
    memberEmail: "",
    emailCode: "",
    memberPw: "",
    memberPw2: "",
    memberNickname: "",
    memberBirth: "", // YYYY-MM-DD (date input)
    agree: false,
  });

  // 상태
  const [emailStatus, setEmailStatus] = useState("idle"); // idle|checking|available|taken
  const [sendStatus, setSendStatus] = useState("idle"); // idle|sending|sent|failed
  const [verifyStatus, setVerifyStatus] = useState("idle"); // idle|verifying|verified|failed
  const [nicknameStatus, setNicknameStatus] = useState("idle"); // idle|checking|available|taken
  const [msg, setMsg] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setMsg("");

    if (name === "memberEmail") {
      setEmailStatus("idle");
      setSendStatus("idle");
      setVerifyStatus("idle");
      setForm((p) => ({ ...p, emailCode: "" }));
    }

    if (name === "memberNickname") {
      setNicknameStatus("idle");
    }
  };

  /* ================= 유효성 ================= */
  const pwOk = useMemo(() => form.memberPw.length >= 6, [form.memberPw]);
  const pwMatch = useMemo(
    () => form.memberPw && form.memberPw === form.memberPw2,
    [form.memberPw, form.memberPw2]
  );

  const canSignup = useMemo(() => {
    return (
      form.agree &&
      emailStatus === "available" &&
      verifyStatus === "verified" &&
      nicknameStatus === "available" &&
      pwOk &&
      pwMatch
    );
  }, [form.agree, emailStatus, verifyStatus, nicknameStatus, pwOk, pwMatch]);

  /* ================= API ================= */

  // 이메일 중복 체크
  const checkEmail = async () => {
    if (!form.memberEmail) return setMsg("이메일을 입력하세요.");

    setEmailStatus("checking");
    try {
      const res = await api.get("/member/email/exists", {
        params: { email: form.memberEmail },
      });

      if (res.data.exists) {
        setEmailStatus("taken");
        setMsg("이미 사용 중인 이메일입니다.");
      } else {
        setEmailStatus("available");
        setMsg("사용 가능한 이메일입니다. 인증을 진행하세요.");
      }
    } catch {
      setEmailStatus("idle");
      setMsg("이메일 중복체크 실패");
    }
  };

  // 인증코드 발송
const sendEmailCode = async () => {
  try {
    const res = await api.post("/member/email/send", { email: form.memberEmail });
    console.log("SEND OK:", res.status, res.data);
    alert("인증코드 전송 완료");
  } catch (err) {
    console.log("SEND FAIL:", err?.response?.status, err?.response?.data, err?.message);
    alert("전송 실패: " + (err?.response?.data || err?.message));
  }
};

  // 인증코드 검증
  const verifyEmailCode = async () => {
    if (!form.emailCode) return;

    setVerifyStatus("verifying");
    try {
      await api.post("/member/email/verify", {
        email: form.memberEmail,
        code: form.emailCode,
      });
      setVerifyStatus("verified");
      setMsg("이메일 인증 완료!");
    } catch {
      setVerifyStatus("failed");
      setMsg("인증코드가 올바르지 않거나 만료되었습니다.");
    }
  };

  // 닉네임 중복 체크
  const checkNickname = async () => {
    if (!form.memberNickname) return setMsg("닉네임을 입력하세요.");

    setNicknameStatus("checking");
    try {
      const res = await api.get("/member/nickname/exists", {
        params: { nickname: form.memberNickname },
      });

      if (res.data.exists) {
        setNicknameStatus("taken");
        setMsg("이미 사용 중인 닉네임입니다.");
      } else {
        setNicknameStatus("available");
        setMsg("사용 가능한 닉네임입니다.");
      }
    } catch {
      setNicknameStatus("idle");
      setMsg("닉네임 중복체크 실패");
    }
  };

  // 회원가입
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSignup) return alert("필수 절차를 완료하세요.");

    try {
      const payload = {
        email: form.memberEmail,
        password: form.memberPw,
        nickname: form.memberNickname,
        memberBirth: form.memberBirth || null, // ⭐ LocalDate로 그대로 전달
        agreeTerms: true,
      };

      await api.post("/member/signup", payload);
      alert("회원가입 완료!");
      onClose();
    } catch (err) {
      alert(err?.response?.data || "회원가입 실패");
    }
  };

  return (
  <ModalBase open={open} onClose={onClose}>
    <div className="signup-modal-container">
      <h2 className="signup-title">회원가입</h2>
      <p className="signup-sub">                 </p>

      <form className="signup-form" onSubmit={onSubmit}>
        {/* 이메일 */}
        <div className="signup-row">
          <input
            className="signup-input"
            name="memberEmail"
            value={form.memberEmail}
            onChange={onChange}
            placeholder="이메일"
          />
          <button type="button" className="signup-btn primary small" onClick={checkEmail}>
            중복확인
          </button>
          {emailStatus === "available" && <span className="signup-badge ok">가능</span>}
          {emailStatus === "taken" && <span className="signup-badge err">중복</span>}
          {emailStatus === "checking" && <span className="signup-badge wait">확인중</span>}
        </div>

        {/* 인증 */}
        <div className="signup-row">
          <button type="button" className="signup-btn primary small" onClick={sendEmailCode}>
            코드전송
          </button>
          <input
            className="signup-input"
            name="emailCode"
            value={form.emailCode}
            onChange={onChange}
            placeholder="인증코드"
          />
          <button type="button" className="signup-btn small" onClick={verifyEmailCode}>
            확인
          </button>
          {verifyStatus === "verified" && <span className="signup-badge ok">완료</span>}
          {verifyStatus === "failed" && <span className="signup-badge err">실패</span>}
          {verifyStatus === "verifying" && <span className="signup-badge wait">확인중</span>}
        </div>

        {/* 비밀번호 */}
        <input
          className="signup-input"
          type="password"
          name="memberPw"
          value={form.memberPw}
          onChange={onChange}
          placeholder="비밀번호 (6자 이상)"
        />
        <input
          className="signup-input"
          type="password"
          name="memberPw2"
          value={form.memberPw2}
          onChange={onChange}
          placeholder="비밀번호 확인"
        />

        {/* 닉네임 */}
        <div className="signup-row">
          <input
            className="signup-input"
            name="memberNickname"
            value={form.memberNickname}
            onChange={onChange}
            placeholder="닉네임"
          />
          <button type="button" className="signup-btn primary small" onClick={checkNickname}>
            중복확인
          </button>
          {nicknameStatus === "available" && <span className="signup-badge ok">가능</span>}
          {nicknameStatus === "taken" && <span className="signup-badge err">중복</span>}
          {nicknameStatus === "checking" && <span className="signup-badge wait">확인중</span>}
        </div>

        {/* 생년월일 */}
        <input
          className="signup-input"
          type="date"
          name="memberBirth"
          value={form.memberBirth}
          onChange={onChange}
        />

        {/* 약관 */}
        <label className="signup-agree">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={onChange}
          />
          이용약관 및 개인정보처리방침 동의
        </label>

        {msg && <div className="signup-msg">{msg}</div>}

        <div className="signup-actions">
          <button type="submit" className="signup-submit" disabled={!canSignup}>
            회원가입
          </button>
          <button type="button" className="signup-cancel" onClick={onClose}>
            닫기
          </button>
        </div>
      </form>
    </div>
  </ModalBase>
);

}
