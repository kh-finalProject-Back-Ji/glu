import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Board from "./pages/Board";

import Home from "./pages/Home";
import GlucoseRecordPage from "./pages/GlucoseRecordPage";
import OAuthRedirect from "./pages/auth/OAuthRedirect";

function App() {
  // ✅ 로그인 상태의 기준이 되는 accessToken
  const [accessToken, setAccessToken] = useState(() => {
    // 새로고침 대비
    return localStorage.getItem("accessToken");
  });

  // (선택) 토큰 변경 로그
  useEffect(() => {
    if (accessToken) {
      console.log("AccessToken set:", accessToken);
    }
  }, [accessToken]);

  return (
    <Router>
      <div className="layout">
        {/* Header에 로그인 상태 내려줄 수도 있음 */}
        <Header accessToken={accessToken} />

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/glucose" element={<GlucoseRecordPage />} />
            <Route path="/board" element={<Board />} />

            {/* ✅ 여기서 setAccessToken을 실제로 내려줌 */}
            <Route
              path="/oauth/callback"
              element={<OAuthRedirect setAccessToken={setAccessToken} />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
