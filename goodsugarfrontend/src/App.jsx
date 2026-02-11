import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import GlucoseRecordPage from "./pages/GlucoseRecordPage";
import OAuthRedirect from "./pages/auth/OAuthRedirect";
import FoodSearchPage from "./pages/FoodSearchPage";
import PersonalInfo from "./pages/PersonalInfo";
import Board from "./pages/Board";
import HealthPage from "./pages/HealthPage";

function App() {
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  useEffect(() => {
    if (accessToken) console.log("AccessToken set:", accessToken);
  }, [accessToken]);

  // ✅ 로그아웃(필요하면 Header에서 호출)
  const onLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
  };

  return (
    <Router>
      <div className="layout">
        <Header accessToken={accessToken} onLogout={onLogout} />

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/glucose" element={<GlucoseRecordPage />} />
            <Route path="/personalInfo" element={<PersonalInfo />} />
            <Route path="/board" element={<Board />} />
            <Route path="/food" element={<FoodSearchPage />} />
            <Route path="/health" element={<HealthPage />} />

            {/* ✅ 소셜로그인 콜백에서 accessToken 받아 저장 */}
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
