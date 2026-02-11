import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios"; // ✅ 경로 정확히

export default function OAuthRedirect({ setAccessToken, setUser }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const access = params.get("access");
    const error = params.get("error");

    if (error) {
      console.error("OAuth error:", error);
      navigate("/", { replace: true });
      return;
    }

    if (!access) {
      console.warn("OAuth callback without token");
      navigate("/", { replace: true });
      return;
    }

    // 1) 저장
    localStorage.setItem("accessToken", access);

    // 2) App 상태 갱신
    setAccessToken?.(access);

    // 3) ✅ 토큰으로 내 정보 조회해서 Header에 쓸 user 세팅
    api
      .get("/api/auth/me", {
        headers: { Authorization: `Bearer ${access}` },
      })
      .then((res) => {
        // 백엔드 응답 키는 프로젝트마다 달라서 여기 매핑만 맞추면 됨
        setUser?.({
          memberNo: res.data.memberId ?? res.data.memberNo,
          nickname: res.data.nickname ?? res.data.memberNickname,
          profileImg: res.data.profileImg,
        });
        navigate("/", { replace: true });
      })
      .catch((e) => {
        console.error("me failed", e);
        localStorage.removeItem("accessToken");
        setAccessToken?.(null);
        setUser?.(null);
        navigate("/", { replace: true });
      });
  }, [params, navigate, setAccessToken, setUser]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
      }}
    >
      로그인 처리 중입니다…
    </div>
  );
}
