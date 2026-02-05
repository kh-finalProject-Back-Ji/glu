import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../styles/Header.css";

import Logo from "../../assets/LOGO.png";
import api from "../../api/axios";

import BoardIcon from "../../assets/board.png";
import MessageIcon from "../../assets/message.png";
import LoginIcon from "../../assets/login.png";
import LogoLoginIcon from "../../assets/LOGO_LOGIN.png";

import GlucoseIcon from "../../assets/glucose.png";
import HealthInfoIcon from "../../assets/healthInfo.png";
import PersonalInfoIcon from "../../assets/personalInfo.png";
import LogoutIcon from "../../assets/logout.png";

import LoginModal from "../auth/LoginModal.jsx";

export default function Header() {
  const [user, setUser] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // ✅ Home(/)가 아닐 때만 중앙 Good Sugar 표시
  const showCenterTitle = location.pathname !== "/";

  useEffect(() => {
    if (user) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    api.get("/api/auth/me")
      .then((res) => {
        setUser({
          memberNo: res.data.memberId ?? res.data.memberNo,
          nickname: res.data.nickname ?? res.data.memberNickname,
          profileImg: res.data.profileImg,
        });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
      });
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (openProfileMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openProfileMenu]);

  const go = (path) => {
    setOpenProfileMenu(false);
    navigate(path);
  };

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setOpenProfileMenu(false);
    alert("로그아웃!");
    navigate("/");
  };

  return (
    <header className="gs-header">
      {/* 왼쪽 로고 */}
      <Link to="/" className="gs-brand" aria-label="홈">
        <img src={Logo} className="gs-brandLogo" alt="logo" />
      </Link>

      {/* ✅ 중앙 Good Sugar (Home가 아닐 때만) */}
      <div className="gs-center">
        {showCenterTitle && <div className="gs-centerTitle">Good Sugar</div>}
      </div>

      {/* 오른쪽 메뉴 */}
      <nav className="gs-nav">
        {/* 프로필/로그인 */}
        <div className="gs-navItem gs-profileItem" ref={menuRef}>
          {user ? (
            <>
              <button
                type="button"
                className="gs-profileBtn"
                onClick={() => setOpenProfileMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={openProfileMenu}
              >
                <img src={LogoLoginIcon} className="gs-icon" alt="profile" />
              </button>
              <div className="gs-labelRow">
                <span className="gs-label">프로필</span>
              </div>

              {openProfileMenu && (
                <div className="gs-dropdown">
                  <button className="gs-ddItem" onClick={() => go("/glucose")}>
                    <img src={GlucoseIcon} className="gs-ddIcon" alt="" />
                    <span>혈당기록</span>
                  </button>

                  <button className="gs-ddItem" onClick={() => go("/health")}>
                    <img src={HealthInfoIcon} className="gs-ddIcon" alt="" />
                    <span>건강정보</span>
                  </button>

                  <button className="gs-ddItem" onClick={() => go("/personalInfo")}>
                    <img src={PersonalInfoIcon} className="gs-ddIcon" alt="" />
                    <span>개인정보수정</span>
                  </button>

                  <div className="gs-ddDivider" />

                  <button className="gs-ddItem gs-ddLogout" onClick={onLogout}>
                    <img src={LogoutIcon} className="gs-ddIcon" alt="" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button type="button" className="gs-profileBtn" onClick={() => setOpenLogin(true)}>
                <img src={LoginIcon} className="gs-icon" alt="login" />
              </button>
              <div className="gs-labelRow">
                <span className="gs-label">로그인</span>
              </div>
            </>
          )}
        </div>

        {/* 게시판 */}
        <div className="gs-navItem">
          <Link to="/board" className="gs-iconLink" aria-label="게시판">
            <img src={BoardIcon} className="gs-icon" alt="board" />
          </Link>
          <div className="gs-labelRow">
            <span className="gs-label">게시판</span>
          </div>
        </div>

        {/* 쪽지 */}
        <div className="gs-navItem">
          <Link to="/chat" className="gs-iconLink" aria-label="쪽지">
            <img src={MessageIcon} className="gs-icon" alt="message" />
          </Link>
          <div className="gs-labelRow">
            <span className="gs-label">쪽지</span>
          </div>
        </div>
      </nav>

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </header>
  );
}
