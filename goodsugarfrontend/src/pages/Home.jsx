import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;

    // ✅ 검색 페이지로 이동
    navigate(`/food?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="main-content">
      <h1 className="title">Good Sugar</h1>

      <p className="subtitle">
        건강한 간식 선택을 위한 혈당 관리 플랫폼
      </p>

      {/* ✅ form으로 감싸면 엔터 검색 가능 */}
      <form onSubmit={onSearch}>
        <div className="search-container">
          <nav className="search-input-wrapper">
            <input
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="알고 싶은 간식의 정보를 검색하세요"
            />
          </nav>
        </div>

        <button type="submit" className="search-button">
          검색
        </button>
      </form>
    </div>
  );
}

export default Home;
