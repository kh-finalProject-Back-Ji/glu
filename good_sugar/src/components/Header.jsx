import React, { useContext, useState } from "react";
import '../styles/Header.css'
import { Link } from "react-router-dom";
import Logo from '../assets/LOGO.png'
import { Login } from '../components/Login'


function Header() {
  const [user, setUser] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="header">

      <Link to="/">
        <img src={Logo} className="logo"/>
      </Link>

      <div className="nav">
        <>
          { user ? (
             <Link to="#" className="nav-item" onClick={() => setUser(false)}>
              <img src={Logo} className="logo" />
              <p>프로필</p>
            </Link>
          ) 
          : (
             <Link to="#" className="nav-item" onClick={() => setOpenLogin(true)}>
                <img src={Logo} className="logo" />
                <p>로그인</p> {openLogin ? <Login /> : null}
              </Link>
             
          )}
        </> 
        <Link to="/board" className="nav-item">
          <img src={Logo} className="logo" />
          <p>게시판</p>
        </Link>
        <Link to="/chat" className="nav-item">
          <img src={Logo} className="logo" />
          <p>쪽지</p>
        </Link>
      </div>
      
    </div>
  )
}

export default Header