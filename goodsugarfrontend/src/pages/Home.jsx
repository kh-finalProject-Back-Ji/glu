import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css"

function Home() {
  return(
    <div className="main-content">
      <h1 className="title">
        Good Sugar
      </h1>
      <p className="subtitle">건강한 간식 선택을 위한 혈당 관리 플랫폼</p>
      <div className="search-container">
        <nav className="search-input-wrapper">
          <input className="search-input"
            placeholder="알고 싶은 간식의 정보를 검색하세요"></input>  
        </nav>   
      </div>
      <button className="search-button">검색</button>    
    </div>
  )
}

export default Home