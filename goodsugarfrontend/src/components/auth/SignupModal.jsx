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
    name: "",
    gender: "",
    memberBirth: "", // YYYY-MM-DD
    agree: false,
  });

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

  // 이메일 중복 체크
  const checkEmail = async () => {
    if (!form.memberEmail) return setMsg("이메일을 입력하세요.");

    setEmailStatus("checking");
    try {
      const res = await api.get("/api/member/email/exists", {
        params: { email: form.memberEmail },
      });

      if (res.data?.exists) {
        setEmailStatus("taken");
        setMsg("이미 사용 중인 이메일입니다.");
      } else {
        setEmailStatus("available");
        setMsg("사용 가능한 이메일입니다. 인증을 진행하세요.");
      }
    } catch (err) {
      console.log(err);
      setEmailStatus("idle");
      setMsg("이메일 중복체크 실패");
    }
  };

  // 인증코드 발송
  const sendEmailCode = async () => {
    if (!form.memberEmail) return setMsg("이메일을 입력하세요.");
    if (emailStatus !== "available") return setMsg("이메일 중복확인부터 하세요.");

    setSendStatus("sending");
    try {
      await api.post("/api/member/email/send", { email: form.memberEmail });
      setSendStatus("sent");
      setMsg("인증코드를 전송했습니다. 메일을 확인하세요.");
    } catch (err) {
      console.log(err);
      setSendStatus("failed");
      setMsg(err?.response?.data || "인증코드 전송 실패");
    }
  };

  // 인증코드 검증
  const verifyEmailCode = async () => {
    if (!form.emailCode) return setMsg("인증코드를 입력하세요.");

    setVerifyStatus("verifying");
    try {
      await api.post("/api/member/email/verify", {
        email: form.memberEmail,
        code: form.emailCode,
      });
      setVerifyStatus("verified");
      setMsg("이메일 인증 완료!");
    } catch (err) {
      console.log(err);
      setVerifyStatus("failed");
      setMsg("인증코드가 올바르지 않거나 만료되었습니다.");
    }
  };

  // 닉네임 중복 체크
  const checkNickname = async () => {
    if (!form.memberNickname) return setMsg("닉네임을 입력하세요.");

    setNicknameStatus("checking");
    try {
      const res = await api.get("/api/member/nickname/exists", {
        params: { nickname: form.memberNickname },
      });

      if (res.data?.exists) {
        setNicknameStatus("taken");
        setMsg("이미 사용 중인 닉네임입니다.");
      } else {
        setNicknameStatus("available");
        setMsg("사용 가능한 닉네임입니다.");
      }
    } catch (err) {
      console.log(err);
      setNicknameStatus("idle");
      setMsg("닉네임 중복체크 실패");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSignup) return alert("필수 절차를 완료하세요.");

    try {
      // ✅ 서버 SignupRequest: email/password/nickname/name/gender/memberBirth
      const payload = {
        email: form.memberEmail,
        password: form.memberPw,
        nickname: form.memberNickname,
        name: form.name || null,
        gender: form.gender || null,
        memberBirth: form.memberBirth || null,
      };

      await api.post("/api/member/signup", payload);
      alert("회원가입 완료!");
      onClose?.();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data || "회원가입 실패");
    }
  };

  return (
    <ModalBase open={open} onClose={onClose} panelClassName="dm-panel--auth">
      <div className="signup">
        <div className="signup__head">
          <h2 className="signup__title">회원가입</h2>
          <p className="signup__sub">메일 인증 후 가입이 완료됩니다.</p>
        </div>

        <form className="signup__form" onSubmit={onSubmit}>
          {/* 이메일 */}
          <div className="signup__row">
            <input
              className="signup__input"
              name="memberEmail"
              value={form.memberEmail}
              onChange={onChange}
              placeholder="이메일"
              autoComplete="email"
            />
            <button
              type="button"
              className="signup__btn primary"
              onClick={checkEmail}
            >
              중복확인
            </button>
          </div>

          <div className="signup__statusRow">
            {emailStatus === "available" && (
              <span className="signup__badge ok">사용가능</span>
            )}
            {emailStatus === "taken" && (
              <span className="signup__badge err">중복</span>
            )}
            {emailStatus === "checking" && (
              <span className="signup__badge wait">확인중</span>
            )}
          </div>

          {/* 인증 */}
          <div className="signup__row">
            <button
              type="button"
              className="signup__btn primary"
              onClick={sendEmailCode}
              disabled={emailStatus !== "available" || sendStatus === "sending"}
            >
              {sendStatus === "sending" ? "전송중" : "코드전송"}
            </button>

            <input
              className="signup__input"
              name="emailCode"
              value={form.emailCode}
              onChange={onChange}
              placeholder="인증코드"
            />

            <button
              type="button"
              className="signup__btn"
              onClick={verifyEmailCode}
              disabled={!form.emailCode || verifyStatus === "verifying"}
            >
              확인
            </button>
          </div>

          <div className="signup__statusRow">
            {verifyStatus === "verified" && (
              <span className="signup__badge ok">인증완료</span>
            )}
            {verifyStatus === "failed" && (
              <span className="signup__badge err">인증실패</span>
            )}
            {verifyStatus === "verifying" && (
              <span className="signup__badge wait">확인중</span>
            )}
          </div>

          {/* 비밀번호 */}
          <input
            className="signup__input"
            type="password"
            name="memberPw"
            value={form.memberPw}
            onChange={onChange}
            placeholder="비밀번호 (6자 이상)"
            autoComplete="new-password"
          />
          <div className="signup__hint">
            {form.memberPw && !pwOk && "비밀번호는 6자 이상이어야 합니다."}
          </div>

          <input
            className="signup__input"
            type="password"
            name="memberPw2"
            value={form.memberPw2}
            onChange={onChange}
            placeholder="비밀번호 확인"
            autoComplete="new-password"
          />
          <div className="signup__hint">
            {form.memberPw2 && !pwMatch && "비밀번호가 일치하지 않습니다."}
          </div>

          {/* 닉네임 */}
          <div className="signup__row">
            <input
              className="signup__input"
              name="memberNickname"
              value={form.memberNickname}
              onChange={onChange}
              placeholder="닉네임"
              autoComplete="nickname"
            />
            <button
              type="button"
              className="signup__btn primary"
              onClick={checkNickname}
            >
              중복확인
            </button>
          </div>

          <div className="signup__statusRow">
            {nicknameStatus === "available" && (
              <span className="signup__badge ok">사용가능</span>
            )}
            {nicknameStatus === "taken" && (
              <span className="signup__badge err">중복</span>
            )}
            {nicknameStatus === "checking" && (
              <span className="signup__badge wait">확인중</span>
            )}
          </div>

          {/* 이름/성별/생년월일 */}
          <div className="signup__grid2">
            <input
              className="signup__input"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="이름(선택)"
            />
            <select
              className="signup__input"
              name="gender"
              value={form.gender}
              onChange={onChange}
            >
              <option value="">성별(선택)</option>
              <option value="M">남</option>
              <option value="F">여</option>
            </select>
          </div>

          <input
            className="signup__input"
            type="date"
            name="memberBirth"
            value={form.memberBirth}
            onChange={onChange}
          />

          {/* 약관 */}
          <label className="signup__agree">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={onChange}
            />
            이용약관 및 개인정보처리방침 동의
          </label>

          {msg && <div className="signup__msg">{msg}</div>}

          <div className="signup__actions">
            <button type="submit" className="signup__submit" disabled={!canSignup}>
              회원가입
            </button>
            <button type="button" className="signup__cancel" onClick={onClose}>
              닫기
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
